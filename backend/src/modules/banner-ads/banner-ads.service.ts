import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { bannerAds } from '../../database/schema';
import { CreateBannerAdDto, UpdateBannerAdDto } from './dto';

@Injectable()
export class BannerAdsService {
  private readonly logger = new Logger(BannerAdsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async getActiveAds() {
    const ads = await this.drizzle.db
      .select()
      .from(bannerAds)
      .where(eq(bannerAds.is_active, true))
      .orderBy(bannerAds.position);

    return { data: ads };
  }

  async getAdsByPosition(position: string) {
    const [ad] = await this.drizzle.db
      .select()
      .from(bannerAds)
      .where(eq(bannerAds.position, position));

    if (!ad) {
      throw new NotFoundException('Banner ad not found');
    }

    return ad;
  }

  async create(dto: CreateBannerAdDto) {
    const [newAd] = await this.drizzle.db
      .insert(bannerAds)
      .values({
        name: dto.name,
        content: dto.content,
        link_url: dto.link_url,
        position: dto.position,
      })
      .returning();

    return newAd;
  }

  async update(id: string, dto: UpdateBannerAdDto) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.link_url !== undefined) updateData.link_url = dto.link_url;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const [updatedAd] = await this.drizzle.db
      .update(bannerAds)
      .set(updateData)
      .where(eq(bannerAds.id, id))
      .returning();

    if (!updatedAd) {
      throw new NotFoundException('Banner ad not found');
    }

    return updatedAd;
  }

  async delete(id: string) {
    const [deletedAd] = await this.drizzle.db
      .delete(bannerAds)
      .where(eq(bannerAds.id, id))
      .returning();

    if (!deletedAd) {
      throw new NotFoundException('Banner ad not found');
    }

    return deletedAd;
  }

  async trackClick(id: string) {
    const result = await this.drizzle.db
      .update(bannerAds)
      .set({
        clicks: sql`${bannerAds.clicks} + 1`,
      })
      .where(eq(bannerAds.id, id))
      .returning({ id: bannerAds.id });

    if (result.length === 0) {
      this.logger.warn(`Attempted to track click for non-existent banner ad: ${id}`);
    }
  }

  async trackImpression(id: string) {
    const result = await this.drizzle.db
      .update(bannerAds)
      .set({
        impressions: sql`${bannerAds.impressions} + 1`,
      })
      .where(eq(bannerAds.id, id))
      .returning({ id: bannerAds.id });

    if (result.length === 0) {
      this.logger.warn(`Attempted to track impression for non-existent banner ad: ${id}`);
    }
  }
}
