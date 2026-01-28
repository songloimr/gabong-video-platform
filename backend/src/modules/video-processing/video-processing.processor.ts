import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { VideosService } from '../videos/videos.service';
import { MediaProcessingService } from '../media-processing/media-processing.service';
import { StorageService } from '../storage/storage.service';
import * as path from 'path';
import * as fs from 'fs';

@Processor('video-processing')
export class VideoProcessingProcessor {
    private readonly logger = new Logger(VideoProcessingProcessor.name);

    constructor(
        @Inject(forwardRef(() => VideosService))
        private readonly videosService: VideosService,
        private readonly mediaProcessingService: MediaProcessingService,
        private readonly storageService: StorageService,
        @InjectQueue('video-processing') private readonly videoQueue: Queue
    ) { }

    @Process({ concurrency: 1 })
    async handleVideo(job: Job<{ videoId: string }>) {
        const { videoId } = job.data;
        this.logger.log(`Processing video: ${videoId}`);

        const video = await this.videosService.findOne(videoId);
        if (!video || !video.local_path) {
            this.logger.error(`Video ${videoId} not found or has no local path`);
            return;
        }

        try {
            // 1. Update status to processing
            await this.videosService.updateStatus(videoId, 'processing');

            const localPath = video.local_path;
            const tempDir = path.dirname(localPath);
            // 2. Extract metadata
            const metadata = await this.mediaProcessingService.extractMetadata(localPath);

            // 3. Validate video
            const validation = await this.mediaProcessingService.validateVideoFile(null, metadata);
            if (!validation.isValid) {
                this.logger.error(`Video ${videoId} validation failed: ${validation.error}`);
                await this.videosService.updateStatus(videoId, 'rejected', validation.error);
                return;
            }

            // 4. Handle thumbnail (use existing if uploaded, otherwise generate)
            let thumbnailLocalPath: string | undefined;
            const files = fs.readdirSync(tempDir);
            const thumbFile = files.find(f => f.startsWith('thumb.'));

            if (thumbFile) {
                thumbnailLocalPath = path.join(tempDir, thumbFile);
                this.logger.log(`Using uploaded thumbnail: ${thumbFile}`);
            } else {
                this.logger.log('Generating thumbnail from video...');
                thumbnailLocalPath = await this.mediaProcessingService.generateThumbnail(
                    localPath,
                    tempDir,
                    metadata,
                );
            }
            
            // 5. Upload thumbnail to R2
            this.logger.log(`Uploading thumbnail to R2...`);
            const thumbnailBuffer = fs.readFileSync(thumbnailLocalPath);
            await this.storageService.uploadFile(
                thumbnailBuffer,
                `videos/${videoId}/${path.basename(thumbnailLocalPath)}`,
                'image/jpeg',
            );
            
            this.logger.log('Generating preview GIF...');
            const previewGifLocalPath = await this.mediaProcessingService.createPreviewGif(localPath, tempDir, metadata);

            this.logger.log(`Uploaded preview GIF to R2...`);
            const previewGifBuffer = fs.readFileSync(previewGifLocalPath);
            await this.storageService.uploadFile(
                previewGifBuffer,
                `videos/${videoId}/${path.basename(previewGifLocalPath)}`,
                'image/gif',
            );

            let videoUrl: string;
            let hlsUrl: string | undefined;

            // 6. Check duration for HLS
            if (metadata.duration > 3 * 60) {
                // HLS transcode
                const hlsOutputDir = path.join(tempDir, 'hls');

                await this.mediaProcessingService.transcodeToHLS(localPath, hlsOutputDir, metadata);
                // Upload HLS directory
                hlsUrl = await this.storageService.uploadDirectory(hlsOutputDir, `videos/${videoId}`);
            } else {
                // Direct MP4 upload
                const videoBuffer = fs.readFileSync(localPath);
                videoUrl = await this.storageService.uploadFile(
                    videoBuffer,
                    `videos/${videoId}/video.mp4`,
                    'video/mp4',
                );
            }

            // 7. Finalize video record
            await this.videosService.update(videoId, {
                status: 'approved',
                video_url: videoUrl || hlsUrl,
                video_key: 'videos/' + videoId,
                published_at: new Date(),
            });

            // 8. Cleanup local files
            this.cleanup(tempDir);

            this.logger.log(`Finished processing video: ${videoId}`);
        } catch (error) {
            this.logger.error(`Error processing video ${videoId}: ${error.message}`);
            await this.videosService.updateStatus(videoId, 'rejected', 'Processing error');
        }
    }

    async addToQueue(videoId: string) {
        await this.videoQueue.add({ videoId }, { removeOnComplete: true });
    }

    async removeFromQueue(videoId: string) {
        const job = await this.videoQueue.getJob(videoId);
        if (job) {
            await job.remove();
        }
    }

    private cleanup(dir: string) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
            this.logger.error(`Error cleaning up directory ${dir}: ${error.message}`);
        }
    }
}
