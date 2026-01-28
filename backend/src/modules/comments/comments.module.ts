import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  CommentsController,
  CommentsAdminController,
} from './comments.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [DrizzleModule, SiteSettingsModule, RedisModule],
  controllers: [CommentsController, CommentsAdminController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
