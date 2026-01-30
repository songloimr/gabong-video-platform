import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { eq, desc, sql, and, ilike, inArray, ne, SQL } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  videos,
  likes,
  watchLater,
  categories,
  tags,
  users,
  videoTags as vt,
} from '../../database/schema';
import { PaginationParams } from '../../types';
import {
  calculateOffset,
  buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import { generateShortCode } from '../../common/helpers/short-code.helper';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoListParams,
  UpdateVisibilityDto,
  UpdateUploadDateDto,
} from './dto';
import type {
  PaginatedResponse,
  VideoListItemResponse,
  VideoDetailResponse,
  VideoCreateResponse,
  LikeResponse,
  VideoAdminResponse,
  VideoStatus,
} from '../../types';
import { generateSlug } from '../../common/helpers/slug.helper';
import fs = require('fs');
import path = require('path');
import { VideoProcessingProcessor } from '../video-processing/video-processing.processor';
import { StorageService } from '../storage/storage.service';
import { PgColumn } from 'drizzle-orm/pg-core';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => VideoProcessingProcessor))
    private readonly videoProcessingProcessor: VideoProcessingProcessor,
  ) { }

  /**
   * Get paginated list of approved videos with filters
   * Uses LEFT JOIN to fetch user and category in a single query
   */
  async findAll(
    params: PaginationParams,
    filters: VideoListParams
  ): Promise<PaginatedResponse<VideoListItemResponse>> {
    const offset = calculateOffset(params.page, params.limit);
    const orderBy = this.getOrderBy(filters.sort);
    const whereConditions = await this.buildWhereConditions(filters);
    const whereClause = and(...whereConditions);

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
          video_key: videos.video_key,
          published_at: videos.published_at,
          is_pinned: videos.is_pinned,
          // User fields (joined)
          user: {
            id: users.id,
            username: users.username,
            avatar_url: users.avatar_url,
          },
          // Category fields (joined)
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(videos)
        .leftJoin(users, eq(videos.user_id, users.id))
        .leftJoin(categories, eq(videos.category_id, categories.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(params.limit)
        .offset(offset),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(videos)
        .where(whereClause),
    ]);

    // Transform to expected format (handle null user/category from LEFT JOIN)
    // const data: VideoListItemResponse[] = items.map((item) => ({
    //   id: item.id,
    //   title: item.title,
    //   slug: item.slug,
    //   short_code: item.short_code,
    //   thumbnail_url: item.thumbnail_url,
    //   duration: item.duration,
    //   likes_count: item.likes_count,
    //   published_at: item.published_at,
    //   user: item.user?.id ? item.user : null,
    //   category: item.category?.id ? item.category : null,
    // }));

    return {
      data: items,
      pagination: buildPaginationMeta(count, params.page, params.limit),
    };
  }

  /**
   * Get video details by slug
   * Uses LEFT JOIN to fetch user and category in a single query
   */
  async findBySlug(slug: string, userId?: string): Promise<VideoDetailResponse> {

    const [result] = await this.drizzle.db
      .select({
        // Video fields
        id: videos.id,
        title: videos.title,
        slug: videos.slug,
        short_code: videos.short_code,
        description: videos.description,
        source_type: videos.source_type,
        video_url: videos.video_url,
        video_key: videos.video_key,
        embed_url: videos.embed_url,
        embed_platform: videos.embed_platform,
        thumbnail_url: videos.thumbnail_url,
        storyboard_url: videos.storyboard_url,
        duration: videos.duration,
        resolution: videos.resolution,
        likes_count: videos.likes_count,
        comments_count: videos.comments_count,
        published_at: videos.published_at,
        status: videos.status,
        is_pinned: videos.is_pinned,
        // User fields (joined)
        user: {
          id: users.id,
          username: users.username,
          avatar_url: users.avatar_url,
        },
        // Category fields (joined)
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        // tags: {
        //   id: tags.id,
        //   name: tags.name,
        //   slug: tags.slug,
        // },
      })
      .from(videos)
      .leftJoin(users, eq(videos.user_id, users.id))
      .leftJoin(categories, eq(videos.category_id, categories.id))
      // .leftJoin(vt, eq(videos.id, vt.video_id))
      // .leftJoin(tags, eq(vt.tag_id, tags.id))
      .where(eq(videos.slug, slug));

    if (!result) {
      throw new NotFoundException('Video not found');
    }

    // Fetch tags and watch_position in parallel
    const [tagData] = await Promise.all([
      this.fetchVideoTags(result.id),
      // userId ? this.getWatchPosition(result.id, userId) : 0,
    ]);

    return { ...result, tags: tagData, watch_position: 0 };
  }

  /**
   * Find video by ID
   */
  async findOne(id: string) {
    const [video] = await this.drizzle.db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    return video;
  }

  /**
   * Redirect short code to slug
   */
  async findByShortCode(shortCode: string): Promise<string> {
    const [video] = await this.drizzle.db
      .select({ slug: videos.slug })
      .from(videos)
      .where(eq(videos.short_code, shortCode));

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video.slug;
  }

  /**
   * Create new video (pending status)
   */
  async create(dto: CreateVideoDto, userId: string): Promise<VideoCreateResponse> {
    const short_code = generateShortCode();
    const slug = generateSlug(dto.title);

    const [newVideo] = await this.drizzle.db
      .insert(videos)
      .values({
        ...dto,
        short_code,
        slug,
        user_id: userId,
        status: 'pending_approval',
      })
      .returning({
        id: videos.id,
        short_code: videos.short_code,
        slug: videos.slug,
      });

    return newVideo;
  }

  /**
   * Update video (owner or admin only)
   * Regenerates slug if title is changed
   */
  async update(id: string, dto: UpdateVideoDto) {
    const updateData: any = {
      ...dto,
      updated_at: new Date(),
    };

    // Regenerate slug if title is being updated
    if (dto.title) {
      updateData.slug = generateSlug(dto.title);
    }

    const [updatedVideo] = await this.drizzle.db
      .update(videos)
      .set(updateData)
      .where(eq(videos.id, id))
      .returning();

    return updatedVideo;
  }


  /**
   * Update video status
   */
  async updateStatus(id: string, status: any, rejectionReason?: string) {
    await this.drizzle.db
      .update(videos)
      .set({
        status,
        rejection_reason: rejectionReason,
        updated_at: new Date(),
      })
      .where(eq(videos.id, id));
  }

  /**
   * Delete video (admin only)
   */
  async delete(id: string) {
    const [deletedVideo] = await this.drizzle.db.delete(videos).where(
      and(
        eq(videos.id, id),
        ne(videos.status, 'processing')
      )
    ).returning()

    if (!deletedVideo) {
      throw new NotFoundException('Video not found');
    }
    if (["pending_approval", "pending_processing", "rejected"].includes(deletedVideo.status)) {
      try {
        console.log(deletedVideo.local_path)
        console.log(path.resolve(deletedVideo.local_path))
        fs.rmSync(path.resolve(deletedVideo.local_path), { force: true, recursive: true });
      } catch (error) {
        this.logger.error(`Error cleaning up local path ${deletedVideo.local_path}: ${error.message}`);
      }
    }
    if (deletedVideo.status === 'pending_processing') {
      // Remove from processing queue if pending
      await this.videoProcessingProcessor.removeFromQueue(id);
    } else if (deletedVideo.status === 'approved') {
      // Delete from storage if processed
      await this.storageService.deleteDirectory(deletedVideo.video_key)
    }

    return deletedVideo;
  }

  /**
   * Toggle like on video
   */
  async like(id: string, userId: string): Promise<LikeResponse> {
    const [existingLike] = await this.drizzle.db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.video_id, id), eq(likes.user_id, userId)));

    if (existingLike) {
      // Unlike: delete and decrement
      const [, updatedLikeCount] = await Promise.all([
        this.drizzle.db.delete(likes).where(eq(likes.id, existingLike.id)),
        this.drizzle.db
          .update(videos)
          .set({ likes_count: sql`GREATEST(${videos.likes_count} - 1, 0)` })
          .where(eq(videos.id, id)),
      ]);

      console.log({ updatedLikeCount })

      const [video] = await this.drizzle.db
        .select({ likes_count: videos.likes_count })
        .from(videos)
        .where(eq(videos.id, id));

      return { is_liked: false, likes_count: video?.likes_count ?? 0 };
    }

    // Like: insert and increment
    await Promise.all([
      this.drizzle.db.insert(likes).values({ video_id: id, user_id: userId }),
      this.drizzle.db
        .update(videos)
        .set({ likes_count: sql`${videos.likes_count} + 1` })
        .where(eq(videos.id, id)),
    ]);

    const [video] = await this.drizzle.db
      .select({ likes_count: videos.likes_count })
      .from(videos)
      .where(eq(videos.id, id));

    return { is_liked: true, likes_count: video?.likes_count ?? 0 };
  }

  /**
   * Update view count and optionally save watch position
   * Uses upsert pattern for efficiency
   */
  async updateView(id: string, userId?: string, watchPosition?: number): Promise<void> {
    // Increment view count
    await this.drizzle.db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));

    // Save watch position if user is logged in and position provided
    if (userId && watchPosition !== undefined && watchPosition > 0) {
      await this.drizzle.db
        .insert(watchLater)
        .values({
          user_id: userId,
          video_id: id,
          watch_position: watchPosition,
        })
        .onConflictDoUpdate({
          target: [watchLater.user_id, watchLater.video_id],
          set: {
            watch_position: watchPosition,
            updated_at: new Date(),
          },
        });
    }
  }

  /**
   * Get videos for admin panel
   */
  async getVideosForAdmin(
    params: PaginationParams,
    filters?: {
      status?: VideoStatus;
      search?: string;
      sort?: 'newest' | 'oldest' | 'views' | 'likes';
    },
  ): Promise<PaginatedResponse<VideoAdminResponse>> {
    const offset = calculateOffset(params.page, params.limit);

    // Build where conditions
    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(videos.status, filters.status));
    }
    if (filters?.search) {
      conditions.push(
        sql`(${videos.title} ILIKE ${'%' + filters.search + '%'} OR ${videos.slug} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by clause
    let orderByClause: SQL | PgColumn;
    switch (filters?.sort) {
      case 'oldest':
        orderByClause = videos.created_at;
        break;
      case 'views':
        orderByClause = desc(videos.views);
        break;
      case 'likes':
        orderByClause = desc(videos.likes_count);
        break;
      default:
        orderByClause = desc(videos.created_at);
    }

    const [items, [{ count }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: videos.id,
          title: videos.title,
          slug: videos.slug,
          short_code: videos.short_code,
          description: videos.description,
          source_type: videos.source_type,
          video_url: videos.video_url,
          embed_url: videos.embed_url,
          embed_platform: videos.embed_platform,
          thumbnail_url: videos.thumbnail_url,
          storyboard_url: videos.storyboard_url,
          duration: videos.duration,
          resolution: videos.resolution,
          file_size: videos.file_size,
          views: videos.views,
          likes_count: videos.likes_count,
          comments_count: videos.comments_count,
          status: videos.status,
          rejection_reason: videos.rejection_reason,
          local_path: videos.local_path,
          approved_at: videos.approved_at,
          user_id: videos.user_id,
          category_id: videos.category_id,
          published_at: videos.published_at,
          created_at: videos.created_at,
          updated_at: videos.updated_at,
          custom_upload_date: videos.custom_upload_date,
          is_pinned: videos.is_pinned,
          pinned_at: videos.pinned_at,
          user: {
            id: users.id,
            username: users.username,
            avatar_url: users.avatar_url,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(videos)
        .leftJoin(users, eq(videos.user_id, users.id))
        .leftJoin(categories, eq(videos.category_id, categories.id))
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(params.limit)
        .offset(offset),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(videos)
        .where(whereClause),
    ]);

    return {
      data: items,
      pagination: buildPaginationMeta(count, params.page, params.limit),
    };
  }


  /**
   * Get pending videos for moderation
   */
  async getPendingVideos(params: PaginationParams) {
    return this.getVideosForAdmin(params, { status: 'pending_approval' });
  }

  /**
   * Get videos waiting for processing
   */
  async getPendingProcessing(params: PaginationParams) {
    return this.getVideosForAdmin(params, { status: 'pending_processing' });
  }

  /**
   * Approve video
   */
  async approve(id: string, adminId: string) {
    const [video] = await this.drizzle.db
      .update(videos)
      .set({
        status: 'pending_processing',
        approved_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();

    return video;
  }

  /**
   * Reject video with reason
   */
  async reject(id: string, reason: string) {
    const [video] = await this.drizzle.db
      .update(videos)
      .set({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();

    return video;
  }

  /**
   * Update video visibility status
   */
  async updateVisibility(id: string, dto: UpdateVisibilityDto) {
    const [video] = await this.drizzle.db
      .update(videos)
      .set({
        status: dto.status,
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();

    return video;
  }

  /**
   * Update custom upload/publish date
   */
  async updateUploadDate(id: string, dto: UpdateUploadDateDto) {
    const publishDate = new Date(dto.custom_upload_date);

    const [video] = await this.drizzle.db
      .update(videos)
      .set({
        custom_upload_date: publishDate,
        published_at: publishDate,
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();

    return video;
  }

  /**
   * Pin a video to featured section
   */
  async pinVideo(id: string) {
    await this.drizzle.db
      .update(videos)
      .set({
        is_pinned: true,
        pinned_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))

    return true;
  }

  /**
   * Unpin a video from featured section
   */
  async unpinVideo(id: string) {
    const [video] = await this.drizzle.db
      .update(videos)
      .set({
        is_pinned: false,
        pinned_at: null,
        updated_at: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  /**
   * Get featured (pinned) videos
   */
  async getFeaturedVideos(limit: number = 10) {
    const items = await this.drizzle.db
      .select({
        id: videos.id,
        title: videos.title,
        slug: videos.slug,
        short_code: videos.short_code,
        thumbnail_url: videos.thumbnail_url,
        duration: videos.duration,
        likes_count: videos.likes_count,
        video_key: videos.video_key,
        is_pinned: videos.is_pinned,
        published_at: videos.published_at,
        user: {
          id: users.id,
          username: users.username,
          avatar_url: users.avatar_url,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(videos)
      .leftJoin(users, eq(videos.user_id, users.id))
      .leftJoin(categories, eq(videos.category_id, categories.id))
      .where(and(eq(videos.is_pinned, true), eq(videos.status, 'approved')))
      .orderBy(desc(videos.pinned_at))
      .limit(limit);

    return items;
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Get order by clause based on sort parameter
   */
  private getOrderBy(sort?: string) {
    switch (sort) {
      case 'views':
        return desc(videos.views);
      case 'likes':
        return desc(videos.likes_count);
      case 'newest':
      default:
        return desc(sql`COALESCE(${videos.published_at}, ${videos.created_at})`);
    }
  }

  /**
   * Build where conditions for video list query
   */
  private async buildWhereConditions(filters: VideoListParams) {
    const conditions = [eq(videos.status, 'approved')];

    // Category filter
    if (filters.category) {
      const [category] = await this.drizzle.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, filters.category));

      if (category) {
        conditions.push(eq(videos.category_id, category.id));
      }
    }

    // Tag filter - uses INNER JOIN approach
    if (filters.tag) {
      const [tag] = await this.drizzle.db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.slug, filters.tag));

      if (tag) {
        const videoIds = await this.drizzle.db
          .select({ video_id: vt.video_id })
          .from(vt)
          .where(eq(vt.tag_id, tag.id));

        if (videoIds.length > 0) {
          conditions.push(inArray(videos.id, videoIds.map((v) => v.video_id)));
        } else {
          conditions.push(sql`FALSE`);
        }
      }
    }

    // Search filter
    if (filters.search) {
      conditions.push(ilike(videos.title, `%${filters.search}%`));
    }

    return conditions;
  }

  /**
   * Fetch tags for a video using INNER JOIN
   */
  private async fetchVideoTags(videoId: string) {
    return this.drizzle.db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(vt)
      .innerJoin(tags, eq(vt.tag_id, tags.id))
      .where(eq(vt.video_id, videoId));
  }

  /**
   * Get watch position for a user on a video
   */
  private async getWatchPosition(videoId: string, userId: string): Promise<number> {
    const [result] = await this.drizzle.db
      .select({ watch_position: watchLater.watch_position })
      .from(watchLater)
      .where(and(eq(watchLater.video_id, videoId), eq(watchLater.user_id, userId)));

    return result?.watch_position ?? 0;
  }

  /**
   * Find video by ID or throw NotFoundException
   */
  private async findVideoById(id: string) {
    const [video] = await this.drizzle.db
      .select({ id: videos.id, user_id: videos.user_id })
      .from(videos)
      .where(eq(videos.id, id));

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }


}
