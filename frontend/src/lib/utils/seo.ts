import { getBrandingConfig } from '$lib/stores/branding.svelte';
import type { BrandingSettings } from '$lib/types';

// Default SEO configuration (fallback when branding not loaded)
const DEFAULT_BRANDING: BrandingSettings = {
  site_name: 'Gabong',
  site_url: 'https://gabong.net',
  site_description: 'Xem video thể thao, highlight bóng đá, bóng rổ và nhiều nội dung hấp dẫn khác trên Gabong.',
  site_logo_url: '',
  site_og_image: '',
  twitter_handle: '@gabongnet',
};

// Helper to get current SEO config (uses branding store if available)
function getSeoConfig() {
  try {
    const branding = getBrandingConfig();
    return {
      siteName: branding.site_name || DEFAULT_BRANDING.site_name,
      siteUrl: branding.site_url || DEFAULT_BRANDING.site_url,
      defaultImage: branding.site_og_image || `${branding.site_url || DEFAULT_BRANDING.site_url}/og-default.jpg`,
      locale: 'vi_VN',
      twitterHandle: branding.twitter_handle || DEFAULT_BRANDING.twitter_handle,
      defaultDescription: branding.site_description || DEFAULT_BRANDING.site_description,
      logoUrl: branding.site_logo_url || '',
    };
  } catch {
    // Fallback for SSR or when store not available
    return {
      siteName: DEFAULT_BRANDING.site_name!,
      siteUrl: DEFAULT_BRANDING.site_url!,
      defaultImage: `${DEFAULT_BRANDING.site_url}/og-default.jpg`,
      locale: 'vi_VN',
      twitterHandle: DEFAULT_BRANDING.twitter_handle!,
      defaultDescription: DEFAULT_BRANDING.site_description!,
      logoUrl: '',
    };
  }
}

// Export for backward compatibility
export const SEO_CONFIG = {
  get siteName() { return getSeoConfig().siteName; },
  get siteUrl() { return getSeoConfig().siteUrl; },
  get defaultImage() { return getSeoConfig().defaultImage; },
  get locale() { return getSeoConfig().locale; },
  get twitterHandle() { return getSeoConfig().twitterHandle; },
  get defaultDescription() { return getSeoConfig().defaultDescription; },
};

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'video.other' | 'article';
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  keywords?: string;
}

export interface VideoSEO {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string | null;
  video_url?: string;
  duration?: number;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
  uploader?: {
    username: string;
    display_name?: string;
  };
  tags?: Array<{ name: string }>;
}

/**
 * Generate comprehensive meta tags for a page
 */
export function generateMeta(options: Partial<SEOMeta> & { title: string }): SEOMeta {
  const {
    title,
    description = SEO_CONFIG.defaultDescription,
    canonical,
    ogImage = SEO_CONFIG.defaultImage,
    ogType = 'website',
    robots = 'index, follow',
  } = options;

  const fullTitle = title.includes(SEO_CONFIG.siteName) 
    ? title 
    : `${title} - ${SEO_CONFIG.siteName}`;

  return {
    title: fullTitle,
    description: truncateDescription(description),
    canonical: canonical || undefined,
    ogTitle: options.ogTitle || title,
    ogDescription: options.ogDescription || truncateDescription(description),
    ogImage,
    ogType,
    ogUrl: canonical,
    twitterCard: options.twitterCard || 'summary_large_image',
    twitterTitle: options.twitterTitle || title,
    twitterDescription: options.twitterDescription || truncateDescription(description),
    twitterImage: options.twitterImage || ogImage,
    robots,
    keywords: options.keywords,
  };
}

/**
 * Generate comprehensive meta tags for video pages
 */
export function generateVideoMeta(video: VideoSEO): SEOMeta & { jsonLd: string } {
  const canonical = `${SEO_CONFIG.siteUrl}/videos/${video.slug}`;
  const description = video.description || `Xem ${video.title} trên Gabong`;
  const thumbnail = video.thumbnail_url || SEO_CONFIG.defaultImage;
  
  const meta = generateMeta({
    title: video.title,
    description,
    canonical,
    ogImage: thumbnail,
    ogType: 'video.other',
    twitterCard: 'summary_large_image',
    keywords: video.tags?.map(t => t.name).join(', '),
  });

  // Generate JSON-LD structured data for VideoObject
  const jsonLd = generateVideoJsonLd(video, canonical, thumbnail);

  return { ...meta, jsonLd };
}

/**
 * Generate JSON-LD VideoObject schema for rich snippets
 */
export function generateVideoJsonLd(
  video: VideoSEO, 
  canonical: string, 
  thumbnail: string
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || `Xem ${video.title} trên Gabong`,
    thumbnailUrl: thumbnail,
    uploadDate: video.created_at || new Date().toISOString(),
    ...(video.duration && { duration: formatDurationISO8601(video.duration) }),
    ...(video.view_count && { interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.view_count,
    }}),
    contentUrl: video.video_url,
    embedUrl: `${SEO_CONFIG.siteUrl}/embed/${video.slug}`,
    url: canonical,
    ...(video.uploader && {
      author: {
        '@type': 'Person',
        name: video.uploader.display_name || video.uploader.username,
        url: `${SEO_CONFIG.siteUrl}/users/${video.uploader.username}`,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.siteUrl}/logo.png`,
      },
    },
  };

  return JSON.stringify(schema);
}

/**
 * Generate JSON-LD for WebSite (for home page)
 */
export function generateWebsiteJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(schema);
}

/**
 * Generate JSON-LD for BreadcrumbList
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Generate JSON-LD for ItemList (for category/playlist pages)
 */
export function generateVideoListJsonLd(
  videos: VideoSEO[],
  listName: string,
  listUrl: string
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    url: listUrl.startsWith('http') ? listUrl : `${SEO_CONFIG.siteUrl}${listUrl}`,
    numberOfItems: videos.length,
    itemListElement: videos.slice(0, 10).map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: video.title,
        url: `${SEO_CONFIG.siteUrl}/videos/${video.slug}`,
        thumbnailUrl: video.thumbnail_url,
      },
    })),
  };

  return JSON.stringify(schema);
}

// Helper functions

function truncateDescription(text: string, maxLength = 160): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

function formatDurationISO8601(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;
  
  return duration;
}

/**
 * Build canonical URL
 */
export function buildCanonical(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
}
