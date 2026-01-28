import { Module } from '@nestjs/common';
import { BannerAdsService } from './banner-ads.service';
import { BannerAdsController } from './banner-ads.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [DrizzleModule, SiteSettingsModule],
  controllers: [BannerAdsController],
  providers: [BannerAdsService],
  exports: [BannerAdsService],
})
export class BannerAdsModule {}
