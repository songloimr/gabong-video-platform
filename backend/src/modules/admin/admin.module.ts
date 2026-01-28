import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DrizzleModule } from '../../database/drizzle.module';
import { UsersModule } from '../users/users.module';
import { VideosModule } from '../videos/videos.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';


@Module({
  imports: [DrizzleModule, UsersModule, VideosModule, VideoProcessingModule, NotificationsModule, StorageModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
