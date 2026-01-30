import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';


import { DrizzleModule } from './database/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { WatchLaterModule } from './modules/watch-later/watch-later.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { CronModule } from './modules/cron/cron.module';
import { UploadModule } from './modules/upload/upload.module';
import { BannerAdsModule } from './modules/banner-ads/banner-ads.module';
import { SearchModule } from './modules/search/search.module';
import { StorageModule } from './modules/storage/storage.module';
import { MediaProcessingModule } from './modules/media-processing/media-processing.module';
import { VideoProcessingModule } from './modules/video-processing/video-processing.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { SubtitlesModule } from './modules/subtitles/subtitles.module';
import { VideoMarkupsModule } from './modules/video-markups/video-markups.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { RedisModule } from './common/redis';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';

import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cloudflareConfig from './config/cloudflare.config';
import redisConfig from './config/redis.config';
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cloudflareConfig, redisConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          username: configService.get<string>('redis.username'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('redis.host');
        const port = configService.get<number>('redis.port');
        const username = configService.get<string>('redis.username');
        const password = configService.get<string>('redis.password');
        const redisUrl = `redis://${username}:${password}@${host}:${port}`;
        return {
          stores: [createKeyv(redisUrl)],
          ttl: 15 * 60 * 1000, // 15 minutes default
        };
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter // Or FastifyAdapter from `@bull-board/fastify`
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
    DrizzleModule,
    AuthModule,
    UsersModule,
    VideosModule,
    CommentsModule,
    CategoriesModule,
    TagsModule,
    PlaylistsModule,
    WatchLaterModule,
    NotificationsModule,
    AdminModule,
    CronModule,
    UploadModule,
    BannerAdsModule,
    SearchModule,
    StorageModule,
    MediaProcessingModule,
    VideoProcessingModule,
    SiteSettingsModule,
    AnnouncementsModule,
    SubtitlesModule,
    VideoMarkupsModule,
    FeedbacksModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule { }
