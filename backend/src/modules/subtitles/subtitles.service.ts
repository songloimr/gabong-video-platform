import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { subtitles } from '../../database/schema';
import { CreateSubtitleDto, UpdateSubtitleDto } from './dto';

@Injectable()
export class SubtitlesService {
  constructor(private readonly drizzle: DrizzleService) { }

  async findByVideoId(videoId: string, isPublic: boolean = false) {
    const selectFields = isPublic
      ? {
        id: subtitles.id,
        label: subtitles.label,
        language_code: subtitles.language_code
      }
      : null;

    return this.drizzle.db
      .select(selectFields)
      .from(subtitles)
      .where(eq(subtitles.video_id, videoId))
      .orderBy(subtitles.sort_order);
  }

  async findById(id: string) {
    const [subtitle] = await this.drizzle.db
      .select()
      .from(subtitles)
      .where(eq(subtitles.id, id));

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    return subtitle;
  }

  async create(dto: CreateSubtitleDto) {
    const [subtitle] = await this.drizzle.db
      .insert(subtitles)
      .values({
        video_id: dto.video_id,
        label: dto.label,
        language_code: dto.language_code,
        vtt_content: dto.vtt_content,
        sort_order: dto.sort_order || 0,
      })
      .returning();

    return subtitle;
  }

  async update(id: string, dto: UpdateSubtitleDto) {
    const [subtitle] = await this.drizzle.db
      .update(subtitles)
      .set({
        ...dto,
        updated_at: new Date(),
      })
      .where(eq(subtitles.id, id))
      .returning();

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    return subtitle;
  }

  async delete(id: string) {
    const [deleted] = await this.drizzle.db
      .delete(subtitles)
      .where(eq(subtitles.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Subtitle not found');
    }

    return { success: true };
  }
}
