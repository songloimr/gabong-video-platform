import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, sql, inArray, desc, asc } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { playlists, playlistVideos, videos } from '../../database/schema';
import { CreatePlaylistDto, UpdatePlaylistDto, AddVideosDto } from './dto';
import { PaginationParams } from '../../types';
import {
  calculateOffset,
  buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import type { PaginatedResponse } from '../../types';

@Injectable()
export class PlaylistsService {
  constructor(private readonly drizzle: DrizzleService) { }

  /**
   * Get all public playlists with pagination
   * Optimized: Single query for data + count using window function
   */
  async findAll(
    params: PaginationParams = { page: 1, limit: 25 },
  ): Promise<PaginatedResponse<typeof playlists.$inferSelect>> {
    const offset = calculateOffset(params.page, params.limit);

    // Use window function for efficient count in single query
    const result = await this.drizzle.db
      .select({
        id: playlists.id,
        title: playlists.title,
        slug: playlists.slug,
        description: playlists.description,
        thumbnail_url: playlists.thumbnail_url,
        is_public: playlists.is_public,
        video_count: playlists.video_count,
        created_by: playlists.created_by,
        created_at: playlists.created_at,
        updated_at: playlists.updated_at,
        total_count: sql<number>`count(*) over()`.as('total_count'),
      })
      .from(playlists)
      .where(eq(playlists.is_public, true))
      .orderBy(desc(playlists.created_at))
      .limit(params.limit)
      .offset(offset);

    const count = result[0]?.total_count ?? 0;
    const items = result.map(({ total_count, ...rest }) => rest);

    return {
      data: items,
      pagination: buildPaginationMeta(params.page, params.limit, count),
    };
  }

  /**
   * Get playlist by slug with videos
   * Optimized: Single JOIN query instead of 3 separate queries
   */
  async findBySlug(slug: string) {
    // Single query with LEFT JOIN to get playlist and videos together
    const result = await this.drizzle.db
      .select({
        // Playlist fields
        playlist_id: playlists.id,
        playlist_title: playlists.title,
        playlist_slug: playlists.slug,
        playlist_description: playlists.description,
        playlist_thumbnail_url: playlists.thumbnail_url,
        playlist_is_public: playlists.is_public,
        playlist_video_count: playlists.video_count,
        playlist_created_by: playlists.created_by,
        playlist_created_at: playlists.created_at,
        playlist_updated_at: playlists.updated_at,
        // Video fields (nullable due to LEFT JOIN)
        video_id: videos.id,
        video_title: videos.title,
        video_slug: videos.slug,
        video_short_code: videos.short_code,
        video_description: videos.description,
        video_video_url: videos.video_url,
        video_embed_url: videos.embed_url,
        video_embed_platform: videos.embed_platform,
        video_thumbnail_url: videos.thumbnail_url,
        video_storyboard_url: videos.storyboard_url,
        video_duration: videos.duration,
        video_file_size: videos.file_size,
        video_likes_count: videos.likes_count,
        video_comments_count: videos.comments_count,
        video_status: videos.status,
        video_published_at: videos.published_at,
        // Position from junction table
        position: playlistVideos.position,
      })
      .from(playlists)
      .leftJoin(playlistVideos, eq(playlistVideos.playlist_id, playlists.id))
      .leftJoin(
        videos,
        and(
          eq(videos.id, playlistVideos.video_id),
          eq(videos.status, 'approved'),
        ),
      )
      .where(eq(playlists.slug, slug))
      .orderBy(asc(playlistVideos.position));

    if (result.length === 0) {
      throw new NotFoundException('Playlist not found');
    }

    // Transform flat result to nested structure
    const firstRow = result[0];
    const playlist = {
      id: firstRow.playlist_id,
      title: firstRow.playlist_title,
      slug: firstRow.playlist_slug,
      description: firstRow.playlist_description,
      thumbnail_url: firstRow.playlist_thumbnail_url,
      is_public: firstRow.playlist_is_public,
      video_count: firstRow.playlist_video_count,
      created_by: firstRow.playlist_created_by,
      created_at: firstRow.playlist_created_at,
      updated_at: firstRow.playlist_updated_at,
    };

    // Filter out null videos (when playlist has no videos or video not approved)
    const videoItems = result
      .filter((row) => row.video_id !== null)
      .map((row) => ({
        id: row.video_id!,
        title: row.video_title!,
        slug: row.video_slug!,
        short_code: row.video_short_code!,
        description: row.video_description,
        video_url: row.video_video_url,
        embed_url: row.video_embed_url,
        embed_platform: row.video_embed_platform,
        thumbnail_url: row.video_thumbnail_url,
        storyboard_url: row.video_storyboard_url,
        duration: row.video_duration,
        file_size: row.video_file_size,
        likes_count: row.video_likes_count!,
        comments_count: row.video_comments_count!,
        status: row.video_status!,
        published_at: row.video_published_at,
        position: row.position ?? 0,
      }));

    return {
      data: {
        ...playlist,
        videos: videoItems,
      },
    };
  }

  async findById(id: string) {
    const result = await this.drizzle.db
      .select({
        playlist_id: playlists.id,
        playlist_title: playlists.title,
        playlist_slug: playlists.slug,
        playlist_description: playlists.description,
        playlist_thumbnail_url: playlists.thumbnail_url,
        playlist_is_public: playlists.is_public,
        playlist_video_count: playlists.video_count,
        playlist_created_by: playlists.created_by,
        playlist_created_at: playlists.created_at,
        playlist_updated_at: playlists.updated_at,
        video_id: videos.id,
        video_title: videos.title,
        video_slug: videos.slug,
        video_thumbnail_url: videos.thumbnail_url,
        video_duration: videos.duration,
        video_status: videos.status,
        position: playlistVideos.position,
      })
      .from(playlists)
      .leftJoin(playlistVideos, eq(playlistVideos.playlist_id, playlists.id))
      .leftJoin(videos, eq(videos.id, playlistVideos.video_id))
      .where(eq(playlists.id, id))
      .orderBy(asc(playlistVideos.position));

    if (result.length === 0) {
      throw new NotFoundException('Playlist not found');
    }

    const firstRow = result[0];
    const playlist = {
      id: firstRow.playlist_id,
      title: firstRow.playlist_title,
      slug: firstRow.playlist_slug,
      description: firstRow.playlist_description,
      thumbnail_url: firstRow.playlist_thumbnail_url,
      is_public: firstRow.playlist_is_public,
      video_count: firstRow.playlist_video_count,
      created_by: firstRow.playlist_created_by,
      created_at: firstRow.playlist_created_at,
      updated_at: firstRow.playlist_updated_at,
    };

    const videoItems = result
      .filter((row) => row.video_id !== null)
      .map((row) => ({
        id: row.video_id!,
        title: row.video_title!,
        slug: row.video_slug!,
        thumbnail_url: row.video_thumbnail_url,
        duration: row.video_duration,
        status: row.video_status!,
        position: row.position ?? 0,
      }));

    return {
      ...playlist,
      videos: videoItems,
    };
  }

  async create(dto: CreatePlaylistDto) {
    const [newPlaylist] = await this.drizzle.db
      .insert(playlists)
      .values(dto)
      .returning();

    return newPlaylist;
  }

  async update(id: string, dto: UpdatePlaylistDto) {
    const [updatedPlaylist] = await this.drizzle.db
      .update(playlists)
      .set({
        ...dto,
        updated_at: new Date(),
      })
      .where(eq(playlists.id, id))
      .returning();

    if (!updatedPlaylist) {
      throw new NotFoundException('Playlist not found');
    }

    return updatedPlaylist;
  }

  async delete(id: string) {
    // Use transaction to delete playlist and its videos atomically
    return await this.drizzle.db.transaction(async (tx) => {
      // First delete all playlist videos
      await tx
        .delete(playlistVideos)
        .where(eq(playlistVideos.playlist_id, id));

      // Then delete the playlist
      const [deletedPlaylist] = await tx
        .delete(playlists)
        .where(eq(playlists.id, id))
        .returning();

      if (!deletedPlaylist) {
        throw new NotFoundException('Playlist not found');
      }

      return deletedPlaylist;
    });
  }

  /**
   * Add videos to playlist
   * Optimized: Combined existence check with max position query
   */
  async addVideos(playlistId: string, dto: AddVideosDto) {
    // Single query to check existence and get max position
    const [playlistCheck] = await this.drizzle.db
      .select({
        id: playlists.id,
        max_position: sql<number>`coalesce((
          select max(${playlistVideos.position}) 
          from ${playlistVideos} 
          where ${playlistVideos.playlist_id} = ${playlists.id}
        ), 0)`,
      })
      .from(playlists)
      .where(eq(playlists.id, playlistId))
      .limit(1);

    if (!playlistCheck) {
      throw new NotFoundException('Playlist not found');
    }

    const startPosition = playlistCheck.max_position + 1;

    const newPlaylistVideos = dto.video_ids.map((videoId, index) => ({
      playlist_id: playlistId,
      video_id: videoId,
      position: startPosition + index,
    }));

    // Use transaction for atomicity
    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .insert(playlistVideos)
        .values(newPlaylistVideos)
        .onConflictDoNothing(); // Ignore duplicates

      await tx
        .update(playlists)
        .set({
          video_count: sql`(
            select count(*) from ${playlistVideos} 
            where ${playlistVideos.playlist_id} = ${playlistId}
          )`,
          updated_at: new Date(),
        })
        .where(eq(playlists.id, playlistId));
    });

    return { added: newPlaylistVideos.length };
  }

  /**
   * Remove video from playlist
   * Optimized: Use transaction and recalculate count
   */
  async removeVideo(playlistId: string, videoId: string) {
    return await this.drizzle.db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlist_id, playlistId),
            eq(playlistVideos.video_id, videoId),
          ),
        )
        .returning();

      if (deleted) {
        // Recalculate actual count instead of decrementing
        await tx
          .update(playlists)
          .set({
            video_count: sql`(
              select count(*) from ${playlistVideos} 
              where ${playlistVideos.playlist_id} = ${playlistId}
            )`,
            updated_at: new Date(),
          })
          .where(eq(playlists.id, playlistId));
      }

      return { removed: !!deleted };
    });
  }
}
