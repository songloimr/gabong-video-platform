import { Injectable } from '@nestjs/common';
import { eq, and, or, sql, lte, gte } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { announcements } from '../../database/schema';
import {
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { PaginationParams } from '../../types';
import {
    calculateOffset,
    buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import type { PaginatedResponse } from '../../types';

@Injectable()
export class AnnouncementsService {
    constructor(private readonly drizzle: DrizzleService) { }

    async findAll(
        params: PaginationParams,
    ): Promise<PaginatedResponse<any>> {
        const offset = calculateOffset(params.page, params.limit);

        const [items, [totalResult]] = await Promise.all([
            this.drizzle.db
                .select()
                .from(announcements)
                .orderBy(announcements.created_at)
                .limit(params.limit)
                .offset(offset),

            this.drizzle.db
                .select({ count: sql<number>`count(*)::int` })
                .from(announcements),
        ]);

        return {
            data: items,
            pagination: buildPaginationMeta(
                totalResult?.count || 0,
                params.page,
                params.limit,
            ),
        };
    }

    async findActive(position?: string): Promise<any[]> {
        const now = new Date();

        const conditions = [
            eq(announcements.is_active, true),
            or(
                eq(announcements.start_date, null),
                lte(announcements.start_date, now),
            ),
            or(
                eq(announcements.end_date, null),
                gte(announcements.end_date, now),
            ),
        ];

        if (position) {
            conditions.push(eq(announcements.position, position as any));
        }

        const items = await this.drizzle.db
            .select()
            .from(announcements)
            .where(and(...conditions))
            .orderBy(announcements.created_at);

        return items;
    }

    async findOne(id: string): Promise<any | null> {
        const [announcement] = await this.drizzle.db
            .select()
            .from(announcements)
            .where(eq(announcements.id, id))
            .limit(1);

        return announcement || null;
    }

    async create(
        dto: CreateAnnouncementDto,
        createdBy: string,
    ): Promise<any> {
        const [announcement] = await this.drizzle.db
            .insert(announcements)
            .values({
                title: dto.title,
                content: dto.content,
                type: dto.type || 'info',
                position: dto.position || 'header_bar',
                is_active: dto.is_active ?? true,
                start_date: dto.start_date ? new Date(dto.start_date) : null,
                end_date: dto.end_date ? new Date(dto.end_date) : null,
                created_by: createdBy,
            })
            .returning();

        return announcement;
    }

    async update(id: string, dto: UpdateAnnouncementDto): Promise<any> {
        const updateData: any = {
            updated_at: new Date(),
        };

        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.type !== undefined) updateData.type = dto.type;
        if (dto.position !== undefined) updateData.position = dto.position;
        if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
        if (dto.start_date !== undefined)
            updateData.start_date = dto.start_date ? new Date(dto.start_date) : null;
        if (dto.end_date !== undefined)
            updateData.end_date = dto.end_date ? new Date(dto.end_date) : null;

        const [announcement] = await this.drizzle.db
            .update(announcements)
            .set(updateData)
            .where(eq(announcements.id, id))
            .returning();

        return announcement;
    }

    async remove(id: string): Promise<void> {
        await this.drizzle.db
            .delete(announcements)
            .where(eq(announcements.id, id));
    }
}
