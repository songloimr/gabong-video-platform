import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { SitemapService } from './sitemap.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';

@Controller('sitemap')
@SkipThrottle()
export class SitemapController {
  constructor(
    private readonly sitemapService: SitemapService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  /**
   * Generate sitemaps on demand (for admin/manual trigger)
   */
  @Get('generate')
  async generateSitemaps() {
    const result = await this.sitemapService.generateAllSitemaps();
    return {
      success: true,
      message: 'Sitemaps generated successfully',
      files: result,
    };
  }

  /**
   * Serve pages sitemap (proxied from R2)
   */
  @Get('sitemap.xml')
  async getPagesSitemap(@Res() res: Response) {
    try {
      // Generate fresh sitemap (in production, this would read from R2)
      await this.sitemapService.generatePagesSitemap();
      
      // For now, regenerate on request since we need GetObject to read from R2
      const urls = await this.generatePagesSitemapContent();
      
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.status(HttpStatus.OK).send(urls);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to generate sitemap',
      });
    }
  }

  /**
   * Serve videos sitemap (proxied from R2)
   */
  @Get('sitemap-videos.xml')
  async getVideosSitemap(@Res() res: Response) {
    try {
      await this.sitemapService.generateVideosSitemap();
      
      // For now, regenerate on request
      const content = await this.generateVideosSitemapContent();
      
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.status(HttpStatus.OK).send(content);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to generate video sitemap',
      });
    }
  }

  // Helper to generate content inline (temporary until R2 read is implemented)
  private async generatePagesSitemapContent(): Promise<string> {
    // This triggers generation and upload, then we'd read from R2
    // For now, we'll let the service handle the full generation
    await this.sitemapService.generatePagesSitemap();
    
    const siteUrl = await this.siteSettings.getSetting<string>('site_url') || '';
    
    // Return a redirect or proxy response in production
    // For now, generate inline
    return this.sitemapService['buildSitemapXml']([
      { loc: '/', changefreq: 'daily', priority: 1.0 },
    ], siteUrl);
  }

  private async generateVideosSitemapContent(): Promise<string> {
    await this.sitemapService.generateVideosSitemap();
    return '<?xml version="1.0"?><urlset></urlset>';
  }
}
