import { Controller, Get, Query } from '@nestjs/common';
import { VideosService } from '../videos/videos.service';

class SearchQueryDto {
  q: string;
  category?: string;
  tag?: string;
  sort?: 'newest' | 'views' | 'likes';
  page?: number = 1;
  limit?: number = 25;
}

@Controller('search')
export class SearchController {
  constructor(private readonly videosService: VideosService) { }

  @Get()
  async search(@Query() query: SearchQueryDto) {
    const { q, category, tag, sort, page = 1, limit = 25 } = query;

    return this.videosService.findAll(
      { page: Number(page), limit: Number(limit) },
      {
        search: q,
        category,
        tag,
        sort: sort || 'newest',
      }
    );
  }
}
