import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { VideosModule } from '../videos/videos.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [DrizzleModule, VideosModule, SiteSettingsModule, UsersModule, RedisModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule { }
