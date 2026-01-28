import { Injectable } from '@nestjs/common';
import { eq, ilike, desc } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tags } from '../../database/schema';
import { CreateTagDto, TagSearchParams } from './dto';
import { slugify } from '../../common/utils';

@Injectable()
export class TagsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(params: TagSearchParams = {}) {
    const limit = params.limit || 50;

    if (params.search) {
      // Use proper parameterized query with ilike from drizzle-orm
      const searchPattern = `${params.search}%`;
      const items = await this.drizzle.db
        .select()
        .from(tags)
        .where(ilike(tags.name, searchPattern))
        .orderBy(desc(tags.usage_count))
        .limit(limit);

      return { data: items };
    }

    const items = await this.drizzle.db
      .select()
      .from(tags)
      .orderBy(desc(tags.usage_count))
      .limit(limit);

    return { data: items };
  }

  async findOrCreate(name: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(tags)
      .where(eq(tags.slug, slugify(name)));

    if (existing) {
      return existing;
    }

    const [newTag] = await this.drizzle.db
      .insert(tags)
      .values({ name, slug: slugify(name) })
      .returning();

    return newTag;
  }

  async create(dto: CreateTagDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(tags)
      .where(eq(tags.slug, slugify(dto.name)));

    if (existing) {
      return existing;
    }

    const [newTag] = await this.drizzle.db
      .insert(tags)
      .values({ name: dto.name, slug: slugify(dto.name) })
      .returning();

    return newTag;
  }
}
