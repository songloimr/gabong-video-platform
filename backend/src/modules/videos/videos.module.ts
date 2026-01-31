import { Module, forwardRef } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './public-videos.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { VideosUserController } from './user-videos.controller';
import { VideosAdminController } from './admin-videos.controller';
import { SubtitlesModule } from '../subtitles/subtitles.module';
import { VideoMarkupsModule } from '../video-markups/video-markups.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DrizzleModule, SubtitlesModule, VideoMarkupsModule, forwardRef(() => VideoProcessingModule), StorageModule],
  controllers: [VideosController, VideosUserController, VideosAdminController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule { }
