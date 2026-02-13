import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { VideosModule } from '../videos/videos.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [VideosModule, SiteSettingsModule],
  controllers: [SearchController],
})
export class SearchModule {}
