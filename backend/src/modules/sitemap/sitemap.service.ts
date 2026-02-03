import { Injectable, Logger } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { videos, categories, playlists } from '../../database/schema';
import { StorageService } from '../storage/storage.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';

const SITEMAP_R2_PREFIX = 'sitemaps';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface VideoSitemapEntry extends SitemapUrl {
  video?: {
    thumbnail_loc: string;
    title: string;
    description: string;
    player_loc: string;
    duration?: number;
    publication_date?: string;
    view_count?: number;
  };
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  /**
   * Generate and upload the main pages sitemap
   */
  async generatePagesSitemap(): Promise<string> {
    this.logger.log('Generating pages sitemap...');

    const siteUrl = await this.siteSettings.getSetting<string>('site_url') || '';

    const urls: SitemapUrl[] = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/search', changefreq: 'daily', priority: 0.8 },
      { loc: '/most-liked', changefreq: 'daily', priority: 0.8 },
      { loc: '/playlists', changefreq: 'weekly', priority: 0.6 },
    ];

    // Fetch categories
    const categoriesData = await this.drizzle.db
      .select({ slug: categories.slug, created_at: categories.created_at })
      .from(categories);

    for (const cat of categoriesData) {
      urls.push({
        loc: `/categories/${cat.slug}`,
        lastmod: cat.created_at?.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    }

    // Fetch playlists
    const playlistsData = await this.drizzle.db
      .select({ slug: playlists.slug, updated_at: playlists.updated_at })
      .from(playlists)
      .where(eq(playlists.is_public, true));

    for (const pl of playlistsData) {
      urls.push({
        loc: `/playlists/${pl.slug}`,
        lastmod: pl.updated_at?.toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }

    const xml = this.buildSitemapXml(urls, siteUrl);
    const key = `${SITEMAP_R2_PREFIX}/sitemap.xml`;
    
    await this.storage.uploadFile(Buffer.from(xml, 'utf-8'), key, 'application/xml');
    this.logger.log(`Pages sitemap uploaded: ${key}`);
    
    return key;
  }

  /**
   * Generate and upload the video sitemap with video-specific metadata
   */
  async generateVideosSitemap(): Promise<string> {
    this.logger.log('Generating videos sitemap...');

    // Get site settings
    const siteUrl = await this.siteSettings.getSetting<string>('site_url') || '';
    const siteName = await this.siteSettings.getSetting<string>('site_name') || '';

    const videosData = await this.drizzle.db
      .select({
        id: videos.id,
        title: videos.title,
        slug: videos.slug,
        description: videos.description,
        thumbnail_url: videos.thumbnail_url,
        duration: videos.duration,
        views: videos.views,
        created_at: videos.created_at,
        updated_at: videos.updated_at,
      })
      .from(videos)
      .where(eq(videos.status, 'approved'))
      .orderBy(desc(videos.created_at));

    const entries: VideoSitemapEntry[] = videosData.map((video) => ({
      loc: `/videos/${video.slug}`,
      lastmod: video.updated_at?.toISOString() || video.created_at?.toISOString(),
      changefreq: 'weekly' as const,
      priority: 0.8,
      video: {
        thumbnail_loc: video.thumbnail_url || `${siteUrl}/og-default.jpg`,
        title: video.title,
        description: video.description || `Xem ${video.title} trên ${siteName}`,
        player_loc: `${siteUrl}/videos/${video.slug}`,
        duration: video.duration,
        publication_date: video.created_at?.toISOString(),
        view_count: video.views,
      },
    }));

    const xml = this.buildVideoSitemapXml(entries, siteUrl);
    const key = `${SITEMAP_R2_PREFIX}/sitemap-videos.xml`;
    
    await this.storage.uploadFile(Buffer.from(xml, 'utf-8'), key, 'application/xml');
    this.logger.log(`Videos sitemap uploaded: ${key} (${entries.length} videos)`);
    
    return key;
  }

  /**
   * Get sitemap content from R2
   */
  async getSitemap(filename: string): Promise<string | null> {
    try {
      const key = `${SITEMAP_R2_PREFIX}/${filename}`;
      const files = await this.storage.listFiles(key);
      
      if (!files || files.length === 0) {
        return null;
      }

      // For now, regenerate on-demand if file exists but we can't read content
      // In a real implementation, you'd use GetObjectCommand to read the file
      return null;
    } catch (error) {
      this.logger.error(`Error fetching sitemap ${filename}: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate all sitemaps
   */
  async generateAllSitemaps(): Promise<{ pages: string; videos: string }> {
    const [pages, videosKey] = await Promise.all([
      this.generatePagesSitemap(),
      this.generateVideosSitemap(),
    ]);

    return { pages, videos: videosKey };
  }

  /**
   * Build standard sitemap XML
   */
  private buildSitemapXml(urls: SitemapUrl[], siteUrl: string): string {
    const urlEntries = urls
      .map((url) => {
        let entry = `  <url>\n    <loc>${siteUrl}${url.loc}</loc>`;
        if (url.lastmod) entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
        if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
        if (url.priority !== undefined) entry += `\n    <priority>${url.priority}</priority>`;
        entry += '\n  </url>';
        return entry;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  /**
   * Build video sitemap XML with video-specific tags
   */
  private buildVideoSitemapXml(entries: VideoSitemapEntry[], siteUrl: string): string {
    const urlEntries = entries
      .map((entry) => {
        let xml = `  <url>
    <loc>${siteUrl}${entry.loc}</loc>`;
        
        if (entry.lastmod) xml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
        if (entry.changefreq) xml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
        if (entry.priority !== undefined) xml += `\n    <priority>${entry.priority}</priority>`;

        if (entry.video) {
          xml += `
    <video:video>
      <video:thumbnail_loc>${this.escapeXml(entry.video.thumbnail_loc)}</video:thumbnail_loc>
      <video:title>${this.escapeXml(entry.video.title)}</video:title>
      <video:description>${this.escapeXml(entry.video.description)}</video:description>
      <video:player_loc>${this.escapeXml(entry.video.player_loc)}</video:player_loc>`;
          
          if (entry.video.duration) {
            xml += `\n      <video:duration>${entry.video.duration}</video:duration>`;
          }
          if (entry.video.publication_date) {
            xml += `\n      <video:publication_date>${entry.video.publication_date}</video:publication_date>`;
          }
          if (entry.video.view_count !== undefined) {
            xml += `\n      <video:view_count>${entry.video.view_count}</video:view_count>`;
          }
          
          xml += '\n    </video:video>';
        }

        xml += '\n  </url>';
        return xml;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries}
</urlset>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
