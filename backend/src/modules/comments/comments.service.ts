import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc, and, count, sql, isNull } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { comments, users } from '../../database/schema';
import { CreateCommentDto, HideCommentDto } from './dto';
import { PaginationParams, CommentsListResponse, CommentResponse } from '../../types';
import { calculateOffset } from '../../common/helpers/pagination.helper';

@Injectable()
export class CommentsService {
  constructor(private readonly drizzle: DrizzleService) { }

  async findByVideoId(
    videoId: string,
    parentId: string | null = null,
    limit = 20,
    offset = 0,
    sort = 'newest',
  ): Promise<CommentsListResponse> {
    const orderBy =
      sort === 'newest' ? desc(comments.created_at) : comments.created_at;

    const whereClause = and(
      eq(comments.video_id, videoId),
      parentId === null
        ? isNull(comments.parent_id)
        : eq(comments.parent_id, parentId),
    );

    const items = await this.drizzle.db
      .select({
        comment: comments,
        user: {
          id: users.id,
          username: users.username,
          avatar_url: users.avatar_url,
        },
        replies_count: sql<number>`(SELECT count(*)::int FROM ${comments} as c2 WHERE c2.parent_id = ${comments.id})`,
      })
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const enrichedItems = items.map(({ comment: { user_id, ...restComment }, user, replies_count }) => ({
      ...restComment,
      user,
      replies_count,
    }));

    const [totalResult] = await this.drizzle.db
      .select({ count: count() })
      .from(comments)
      .where(whereClause);

    return {
      data: enrichedItems,
      total: totalResult?.count || 0,
      has_more: offset + limit < (totalResult?.count || 0),
    };
  }

  async create(videoId: string, userId: string, dto: CreateCommentDto) {
    const [newComment] = await this.drizzle.db
      .insert(comments)
      .values({
        video_id: videoId,
        user_id: userId,
        parent_id: dto.parent_id,
        content: dto.content,
      })
      .returning();

    return newComment;
  }

  async delete(id: string) {
    const [comment] = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, id));

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.drizzle.db.delete(comments).where(eq(comments.id, id));
  }

  async hide(id: string, dto: HideCommentDto, adminId: string) {
    const [comment] = await this.drizzle.db
      .update(comments)
      .set({
        is_hidden: dto.is_hidden,
        hidden_by: dto.is_hidden ? adminId : null,
        hidden_at: dto.is_hidden ? new Date() : null,
      })
      .where(eq(comments.id, id))
      .returning();

    return comment;
  }
}
