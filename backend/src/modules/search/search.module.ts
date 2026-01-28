import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [VideosModule],
  controllers: [SearchController],
})
export class SearchModule {}
