import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { videoMarkups } from '../../database/schema';
import { CreateVideoMarkupDto, UpdateVideoMarkupDto } from './dto';

@Injectable()
export class VideoMarkupsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findByVideoId(videoId: string, isPublic: boolean = false) {
    const selectFields = isPublic
    ? {
      time: videoMarkups.time,
      text: videoMarkups.text,
      width: videoMarkups.width
    } : null
    
    return this.drizzle.db
      .select(selectFields)
      .from(videoMarkups)
      .where(eq(videoMarkups.video_id, videoId))
      .orderBy(videoMarkups.time);
  }

  async findById(id: string) {
    const [markup] = await this.drizzle.db
      .select()
      .from(videoMarkups)
      .where(eq(videoMarkups.id, id));

    if (!markup) {
      throw new NotFoundException('Video markup not found');
    }

    return markup;
  }

  async create(dto: CreateVideoMarkupDto) {
    const [markup] = await this.drizzle.db
      .insert(videoMarkups)
      .values({
        video_id: dto.video_id,
        time: dto.time,
        text: dto.text,
        width: dto.width || '5s',
        sort_order: dto.sort_order || 0,
      })
      .returning();

    return markup;
  }

  async update(id: string, dto: UpdateVideoMarkupDto) {
    const [markup] = await this.drizzle.db
      .update(videoMarkups)
      .set({
        ...dto,
        updated_at: new Date(),
      })
      .where(eq(videoMarkups.id, id))
      .returning();

    if (!markup) {
      throw new NotFoundException('Video markup not found');
    }

    return markup;
  }

  async delete(id: string) {
    const [deleted] = await this.drizzle.db
      .delete(videoMarkups)
      .where(eq(videoMarkups.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Video markup not found');
    }

    return { success: true };
  }
}
