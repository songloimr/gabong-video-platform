import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { UsersService } from '../users/users.service';
import { PaginationParams, UserAdminListItemResponse } from '../../types';
import type { PaginatedResponse } from '../../types';
import { mvDashboardStats } from '../../database/schema/materialized-views';

@Injectable()
export class AdminService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly usersService: UsersService,
  ) { }

  async getDashboardStats() {
    const [row] = await this.drizzle.db.select().from(mvDashboardStats);

    if (!row) {
      return {
        total_users: 0,
        total_videos: 0,
        pending_approval_videos: 0,
        pending_processing_videos: 0,
        processing_videos: 0,
        total_views: 0,
        total_comments: 0,
        today_uploads: 0,
        today_registrations: 0,
      };
    }

    return {
      total_users: Number(row.total_users),
      total_videos: Number(row.total_videos),
      pending_approval_videos: Number(row.pending_approval_videos),
      pending_processing_videos: Number(row.pending_processing_videos),
      processing_videos: Number(row.processing_videos),
      total_views: Number(row.total_views),
      total_comments: Number(row.total_comments),
      today_uploads: Number(row.today_uploads),
      today_registrations: Number(row.today_registrations),
    };
  }

  async getUsers(
    params: PaginationParams,
    filters: { status?: 'active' | 'suspended' | 'banned'; search?: string },
  ): Promise<PaginatedResponse<UserAdminListItemResponse>> {
    return this.usersService.findAllForAdmin(params, filters);
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string,
  ) {
    return this.usersService.updateUserStatus(userId, status, reason);
  }

  async getAllPlaylists(params: PaginationParams) {
    // Use raw query to get all playlists including hidden ones
    const offset = (params.page - 1) * params.limit;

    const result = await this.drizzle.db.execute(
      sql`
        SELECT 
          *,
          count(*) over() as total_count
        FROM playlists
        ORDER BY created_at DESC
        LIMIT ${params.limit} OFFSET ${offset}
      `,
    );

    const items = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      is_public: row.is_public,
      video_count: Number(row.video_count),
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    const count = Number(result.rows[0]?.total_count ?? 0);

    return {
      data: items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count,
        total_pages: Math.ceil(count / params.limit),
        has_prev: params.page > 1,
        has_next: params.page * params.limit < count,
      },
    };
  }
}

