import { Injectable, Logger } from '@nestjs/common';
import ffmpeg = require('fluent-ffmpeg');
import * as path from 'path';
import * as fs from 'fs';
import { SiteSettingsService } from '../site-settings/site-settings.service';

type VideoMetadata = {
    duration: number;
    resolution: string | "unknown";
}

@Injectable()
export class MediaProcessingService {
    private readonly logger = new Logger(MediaProcessingService.name);

    constructor(private readonly siteSettingsService: SiteSettingsService) { }

    private isPortrait(resolution: string): boolean {
        const [width, height] = resolution.split('x').map(Number);
        return height > width;
    }

    async validateVideoFile(filePath: string = null, metadata: VideoMetadata = null): Promise<{ isValid: boolean; error?: string }> {
        // Get max duration from settings
        const uploadConfig = await this.siteSettingsService.getUploadConfig();
        const maxDurationSeconds = uploadConfig.maxVideoDuration;

        const { duration, resolution } = metadata || await this.extractMetadata(filePath);
        if (resolution === 'unknown') {
            return { isValid: false, error: 'Unknown video resolution' };
        }
        if (!duration || duration <= 0) {
            return { isValid: false, error: 'Invalid video duration' }
        }
        if (duration > maxDurationSeconds) {
            const maxMinutes = Math.floor(maxDurationSeconds / 60);
            return { isValid: false, error: `Video is longer than ${maxMinutes} minutes` }
        }
        return { isValid: true }
    }

    async extractMetadata(filePath: string) {
        return new Promise<VideoMetadata>((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) return reject(err);

                const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
                const duration = Math.round(metadata.format.duration || 0);
                const resolution = videoStream
                    ? `${videoStream.width}x${videoStream.height}`
                    : 'unknown';

                resolve({ duration, resolution });
            });
        });
    }

    async generateThumbnail(filePath: string, outputDir: string, _metadata: VideoMetadata = null): Promise<string> {
        const filename = `thumbnail.jpg`;
        const outputPath = path.join(outputDir, filename);

        const metadata = _metadata || await this.extractMetadata(filePath);
        const portrait = this.isPortrait(metadata.resolution);
        //
        console.log({ filePath, outputPath })

        const tileColumns = portrait ? 4 : 2;
        const tileRows = portrait ? 1 : 2;
        const frameWidth = 1280 / tileColumns;
        const frameHeight = "-1"

        const frameCount = Math.max(1, Math.ceil(metadata.duration / (tileColumns * tileRows)));

        console.log({ frameCount, tileColumns, tileRows, frameWidth })

        return new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .videoFilters([{
                    filter: 'fps',
                    options: `1/${frameCount}`
                }, {
                    filter: 'scale',
                    options: `${frameWidth}:${frameHeight}`
                }, {
                    filter: 'tile',
                    options: `${tileColumns}x${tileRows}`
                }])
                .outputOptions(['-vsync vfr', '-qscale:v 3'])
                .save(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => {
                    this.logger.error(`Error generating thumbnail: ${err.message}`);
                    reject(err);
                });
        });
    }

    async remuxToMP4(inputPath: string, outputPath: string): Promise<string> {
        this.logger.log(`Remuxing ${inputPath} to ${outputPath}`);
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(['-c:v copy', '-c:a copy'])
                .save(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err));
        });
    }

    async createPreviewGif(filePath: string, outputDir: string, metadata: VideoMetadata): Promise<string> {
        const filename = `preview.gif`;
        const outputPath = path.join(outputDir, filename);
        const frameCount = 20;
        const screenshotPattern = 'preview_%02d.jpg';

        try {
            // Step 1: Generate screenshots from video
            await new Promise<void>((resolve, reject) => {
                ffmpeg(filePath)
                    .videoFilters([
                        { filter: "fps", options: `${frameCount}/${metadata.duration}` }
                    ])
                    .outputOptions([`-vframes ${frameCount}`])
                    .output(path.join(outputDir, screenshotPattern))
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
            });

            // Step 2: Create GIF from screenshots
            await new Promise<void>((resolve, reject) => {
                ffmpeg()
                    .input(path.join(outputDir, screenshotPattern))
                    .inputOptions(['-framerate 4'])
                    .videoFilters([
                        { filter: 'scale', options: '480:-1' }
                    ])
                    .output(outputPath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
            });

            return outputPath;
        } catch (err) {
            this.logger.error(`Error creating preview GIF: ${err.message}`);
            throw err;
        } finally {
            // Step 3: Cleanup temp screenshot files
            for (let i = 1; i <= frameCount; i++) {
                const tempFile = path.join(outputDir, `preview_${String(i).padStart(2, '0')}.jpg`);
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
            }
        }
    }
    async transcodeToHLS(inputPath: string, outputDir: string, metadata: VideoMetadata): Promise<string> {
        this.logger.debug(`Transcoding ${path.basename(inputPath)} to HLS in ${path.basename(outputDir)}`);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const { duration } = metadata;
        let hlsTime = 5;

        if (duration >= 10 * 60) {
            hlsTime = 20;
        } else if (duration >= 7 * 60) {
            hlsTime = 15;
        } else if (duration >= 4 * 60) {
            hlsTime = 10;
        }

        const playlistPath = path.join(outputDir, 'master.m3u8');

        // Get FFmpeg config from settings
        //const ffmpegConfig = await this.siteSettingsService.getFFmpegConfig();

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-c copy',
                    `-hls_time ${hlsTime}`,
                    '-hls_list_size 0',
                    '-f hls',
                ])
                .output(playlistPath)
                .on('end', () => resolve(playlistPath))
                .on('error', (err) => {
                    this.logger.error(`Error transcoding to HLS: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }
}

