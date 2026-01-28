import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { watchLater, videos } from '../../database/schema';
import { PaginationParams } from '../../types';
import {
  calculateOffset,
  buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import type { PaginatedResponse, WatchLaterItemResponse } from '../../types';

@Injectable()
export class WatchLaterService {
  constructor(private readonly drizzle: DrizzleService) { }

  async findAll(
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedResponse<WatchLaterItemResponse>> {
    const offset = calculateOffset(params.page, params.limit);

    const [items, [{ count }]] = await Promise.all([
      this.drizzle.db
        .select({
          // Video fields
          id: videos.id,
          title: videos.title,
          slug: videos.slug,
          short_code: videos.short_code,
          thumbnail_url: videos.thumbnail_url,
          duration: videos.duration,
          likes_count: videos.likes_count,
          published_at: videos.published_at,
          // Watch later fields
          watch_position: watchLater.watch_position,
          added_at: watchLater.added_at,
        })
        .from(watchLater)
        .innerJoin(videos, eq(watchLater.video_id, videos.id))
        .where(
          and(
            eq(watchLater.user_id, userId),
            eq(videos.status, 'approved'),
          ),
        )
        .orderBy(desc(watchLater.added_at))
        .limit(params.limit)
        .offset(offset),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(watchLater)
        .innerJoin(videos, eq(watchLater.video_id, videos.id))
        .where(
          and(
            eq(watchLater.user_id, userId),
            eq(videos.status, 'approved'),
          ),
        ),
    ]);

    return {
      data: items,
      pagination: buildPaginationMeta(count, params.page, params.limit),
    };
  }

  async add(userId: string, videoId: string) {

    const [result] = await this.drizzle.db
      .insert(watchLater)
      .values({
        user_id: userId,
        video_id: videoId,
        watch_position: 0,
      })
      .onConflictDoUpdate({
        target: [watchLater.user_id, watchLater.video_id],
        set: {
          updated_at: new Date(),
        },
      })
      .returning();

    return result;
  }

  async updatePosition(userId: string, videoId: string, watchPosition: number) {
    // Use upsert to handle case where watch_later entry doesn't exist yet
    const [result] = await this.drizzle.db
      .insert(watchLater)
      .values({
        user_id: userId,
        video_id: videoId,
        watch_position: watchPosition,
      })
      .onConflictDoUpdate({
        target: [watchLater.user_id, watchLater.video_id],
        set: {
          watch_position: watchPosition,
          updated_at: new Date(),
        },
      })
      .returning();

    return result;
  }

  async remove(userId: string, videoId: string) {
    await this.drizzle.db
      .delete(watchLater)
      .where(
        and(eq(watchLater.user_id, userId), eq(watchLater.video_id, videoId)),
      );
  }
}
