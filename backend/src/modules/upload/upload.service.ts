import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { VideosService } from '../videos/videos.service';
import { CreateVideoDto } from '../videos/dto';
import { StorageService } from '../storage/storage.service';
import { MediaProcessingService } from '../media-processing/media-processing.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';

import path = require('path');
import fs = require('fs');
import { v4 as uuidv4 } from 'uuid';
import { VideoSourceType } from '../../types/video.types';
import sharp = require('sharp');
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createWriteStream } from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'pending');

  constructor(
    private readonly videosService: VideosService,
    private readonly storageService: StorageService,
    private readonly mediaProcessingService: MediaProcessingService,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly httpService: HttpService
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async fetchThumbnail(url: string, filePath: string) {
    const writer = createWriteStream(filePath);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: "stream" })
      )
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Failed to download image: ' + url);
    }
    return null;
  }

  async handleUpload(
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    dto: CreateVideoDto,
    userId: string,
  ) {

    if (dto.source_type === VideoSourceType.EMBED) {
      const video = await this.videosService.create({ ...dto, thumbnail_url: dto.thumbnail_url }, userId);

      if (!dto.thumbnail_url && thumbnailFile) {
        const thumbExt = path.extname(thumbnailFile.originalname) || '.jpg';
        const thumbnailKey = `videos/${video.id}/thumbnail${thumbExt}`;
        await this.storageService.uploadFile(
          thumbnailFile.buffer,
          thumbnailKey,
          'image/jpeg',
        );
      }

      return video;
    }

    if (!videoFile) {
      throw new BadRequestException('Video file is required for upload source type');
    }

    // Get upload config and format config from settings
    const uploadConfig = await this.siteSettingsService.getUploadConfig();
    const formatConfig = await this.siteSettingsService.getVideoFormatConfig();

    const maxFileSize = uploadConfig.maxUploadSizeMb * 1024 * 1024;

    if (!formatConfig.allowedMimeTypes.includes(videoFile.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${videoFile.mimetype}. Allowed: ${formatConfig.allowedMimeTypes.join(', ')}`,
      );
    }

    if (videoFile.size > maxFileSize) {
      throw new BadRequestException(`File exceeds ${uploadConfig.maxUploadSizeMb}MB limit`);
    }

    const videoId = uuidv4();
    const videoTempDir = path.join(this.uploadDir, videoId);

    if (!fs.existsSync(videoTempDir)) {
      fs.mkdirSync(videoTempDir, { recursive: true });
    }

    const ext = path.extname(videoFile.originalname);
    const localPath = path.join(videoTempDir, `original${ext}`);

    try {
      // Save video file to local storage first
      fs.writeFileSync(localPath, videoFile.buffer);

      // Validate video file with ffprobe (checks duration limit, codec, bitrate)
      const validation = await this.mediaProcessingService.validateVideoFile(localPath);
      if (!validation.isValid) {
        // Cleanup and throw
        fs.rmSync(videoTempDir, { recursive: true, force: true });
        throw new BadRequestException(validation.error || 'Invalid video file');
      }

      // Extract metadata (duration, resolution) to save immediately
      const metadata = await this.mediaProcessingService.extractMetadata(localPath);

      if (dto.thumbnail_url) {
        this.logger.log("Using remote thumbnail: " + dto.thumbnail_url)
      } else if (thumbnailFile) {
        const thumbExt = path.extname(thumbnailFile.originalname) || '.jpg';
        const thumbPath = path.join(videoTempDir, `thumbnail.jpg`);

        if (thumbExt !== '.jpg') {
          await sharp(thumbnailFile.buffer).jpeg().toFile(thumbPath)
        }
        fs.writeFileSync(thumbPath, thumbnailFile.buffer);
      }

      // Create video record with status 'pending_approval' including metadata
      const video = await this.videosService.create(
        {
          ...dto,
          local_path: localPath,
          duration: metadata.duration,
          resolution: metadata.resolution,
          file_size: videoFile.size,
        },
        userId,
      );

      return video;
    } catch (error) {
      this.logger.error(`Error handling upload for user ${userId}: ${error.message}`);
      // Cleanup if failed
      if (fs.existsSync(videoTempDir)) {
        fs.rmSync(videoTempDir, { recursive: true, force: true });
      }
      throw error;
    }
  }
}
