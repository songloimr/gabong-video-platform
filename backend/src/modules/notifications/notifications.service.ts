import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { notifications, videos, users } from '../../database/schema';
import { PaginationParams } from '../../types';
import {
  calculateOffset,
  buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import type { PaginatedResponse } from '../../types';

@Injectable()
export class NotificationsService {
  constructor(private readonly drizzle: DrizzleService) { }

  async findAll(
    userId: string,
    params: PaginationParams,
    filters?: { is_read?: boolean },
  ): Promise<PaginatedResponse<any> & { unread_count: number }> {
    const offset = calculateOffset(params.page, params.limit);

    const whereConditions = [eq(notifications.user_id, userId)];

    if (filters?.is_read !== undefined) {
      whereConditions.push(eq(notifications.is_read, filters.is_read));
    }

    const whereClause = and(...whereConditions);

    const [items, [totalResult], [unreadResult]] = await Promise.all([
      this.drizzle.db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(notifications.created_at)
        .limit(params.limit)
        .offset(offset),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(whereClause),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.is_read, false),
          ),
        ),
    ]);

    return {
      data: items,
      pagination: buildPaginationMeta(
        totalResult?.count || 0,
        params.page,
        params.limit,
      ),
      unread_count: unreadResult?.count || 0,
    };
  }

  async getUnreadCount(userId: string): Promise<{ unread_count: number }> {
    const [result] = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
        ),
      );

    return { unread_count: result?.count || 0 };
  }

  async markAsRead(id: string, userId: string) {
    const [notification] = await this.drizzle.db
      .update(notifications)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)))
      .returning();

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.drizzle.db
      .update(notifications)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
        ),
      );
  }

  async delete(id: string, userId: string) {
    await this.drizzle.db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)));
  }

  async createVideoApproved(videoId: string) {
    const [video] = await this.drizzle.db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video || !video.user_id) return;

    await this.drizzle.db.insert(notifications).values({
      user_id: video.user_id,
      type: 'video_approved',
      title: 'Video Approved',
      message: `Your video "${video.title}" has been approved and is now public.`,
      link: `/videos/${video.slug}`,
      is_read: false,
    });
  }

  async createVideoRejected(videoId: string, reason: string) {
    const [video] = await this.drizzle.db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video || !video.user_id) return;

    await this.drizzle.db.insert(notifications).values({
      user_id: video.user_id,
      type: 'video_rejected',
      title: 'Video Rejected',
      message: `Your video "${video.title}" was rejected. Reason: ${reason}`,
      link: `/my-videos`,
      is_read: false,
    });
  }


  async createCommentReply(userId: string, commenter: string, videoTitle: string, videoSlug: string) {
    await this.drizzle.db.insert(notifications).values({
      user_id: userId,
      type: 'comment_reply',
      title: 'New Comment Reply',
      message: `${commenter} replied to your comment on "${videoTitle}"`,
      link: `/videos/${videoSlug}#comments`,
      is_read: false,
    });
  }

  async createMassNotification(
    title: string,
    message: string,
    link?: string,
    targetUserIds?: string[],
  ): Promise<{ sent_count: number }> {
    try {
      let userIds: string[];

      if (targetUserIds && targetUserIds.length > 0) {
        // Send to specific users
        userIds = targetUserIds;
      } else {
        // Send to all users
        const allUsers = await this.drizzle.db
          .select({ id: users.id })
          .from(users);
        userIds = allUsers.map((u) => u.id);
      }

      if (userIds.length === 0) {
        return { sent_count: 0 };
      }

      // Batch insert notifications
      const notificationValues = userIds.map((userId) => ({
        user_id: userId,
        type: 'system' as const,
        title,
        message,
        link,
        is_read: false,
      }));

      await this.drizzle.db.insert(notifications).values(notificationValues);

      return { sent_count: userIds.length };
    } catch (error) {
      throw new Error(`Failed to send mass notification: ${error.message}`);
    }
  }
}
