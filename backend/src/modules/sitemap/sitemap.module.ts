import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DrizzleModule } from '../../database/drizzle.module';
import { StorageModule } from '../storage/storage.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';
import { SitemapCron } from './sitemap.cron';

@Module({
  imports: [DrizzleModule, StorageModule, SiteSettingsModule, ScheduleModule.forRoot()],
  controllers: [SitemapController],
  providers: [SitemapService, SitemapCron],
  exports: [SitemapService],
})
export class SitemapModule {}
