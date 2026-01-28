import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { categories, videos } from '../../database/schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll() {
    const items = await this.drizzle.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        sort_order: categories.sort_order,
        created_at: categories.created_at,
        video_count: sql<number>`(
          SELECT COUNT(*)::int FROM videos 
          WHERE videos.category_id = ${categories.id} 
          AND videos.status = 'approved'
        )`,
      })
      .from(categories)
      .orderBy(categories.sort_order, categories.name);

    return items;
  }

  async findBySlug(slug: string) {
    const [category] = await this.drizzle.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const [newCategory] = await this.drizzle.db
      .insert(categories)
      .values(dto)
      .returning();

    return newCategory;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const [updatedCategory] = await this.drizzle.db
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }

  async delete(id: string) {
    const [deletedCategory] = await this.drizzle.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }

    return deletedCategory;
  }
}
