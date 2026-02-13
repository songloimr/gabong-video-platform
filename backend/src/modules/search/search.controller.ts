import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { VideosService } from '../videos/videos.service';
import { CacheTTL } from '../../common/decorators';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor';

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
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(2) // 2 minutes
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
