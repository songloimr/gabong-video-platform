import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SitemapService } from './sitemap.service';

@Injectable()
export class SitemapCron {
  private readonly logger = new Logger(SitemapCron.name);

  constructor(private readonly sitemapService: SitemapService) {}

  /**
   * Regenerate sitemaps every hour
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async regenerateSitemaps() {
    this.logger.log('Starting scheduled sitemap regeneration...');
    
    try {
      const result = await this.sitemapService.generateAllSitemaps();
      this.logger.log(`Sitemaps regenerated successfully: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to regenerate sitemaps: ${error.message}`);
    }
  }
}
