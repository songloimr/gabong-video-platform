import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, count } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { feedbacks, users } from '../../database/schema';
import { CreateFeedbackDto } from './dto';

@Injectable()
export class FeedbacksService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateFeedbackDto, userId?: string, ipAddress?: string) {
    const [newFeedback] = await this.drizzle.db
      .insert(feedbacks)
      .values({
        type: dto.type,
        title: dto.title,
        content: dto.content,
        user_id: userId || null,
        ip_address: ipAddress,
      })
      .returning();

    return newFeedback;
  }

  async findAll(page = 1, limit = 20, type?: string) {
    const offset = (page - 1) * limit;

    let query = this.drizzle.db
      .select({
        feedback: feedbacks,
        user: {
          id: users.id,
          username: users.username,
          avatar_url: users.avatar_url,
        },
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.user_id, users.id))
      .orderBy(desc(feedbacks.created_at))
      .limit(limit)
      .offset(offset);

    if (type) {
      query = query.where(eq(feedbacks.type, type as any)) as typeof query;
    }

    const items = await query;

    let countQuery = this.drizzle.db
      .select({ count: count() })
      .from(feedbacks);

    if (type) {
      countQuery = countQuery.where(eq(feedbacks.type, type as any)) as typeof countQuery;
    }

    const [totalResult] = await countQuery;

    return {
      data: items.map(({ feedback, user }) => ({
        ...feedback,
        user,
      })),
      total: totalResult?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((totalResult?.count || 0) / limit),
    };
  }

  async remove(id: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Feedback not found');
    }

    await this.drizzle.db.delete(feedbacks).where(eq(feedbacks.id, id));

    return { message: 'Feedback deleted successfully' };
  }
}
