// Default SEO configuration
const DEFAULT_BRANDING = {
  site_name: 'Gabong',
  site_url: 'https://gabong.net',
  site_description:
    'Xem video thể thao, highlight bóng đá, bóng rổ và nhiều nội dung hấp dẫn khác trên Gabong.',
  twitter_handle: '@gabongnet',
};

// SEO Config with getters for reactivity
export const SEO_CONFIG = {
  get siteName() {
    return DEFAULT_BRANDING.site_name;
  },
  get siteUrl() {
    return DEFAULT_BRANDING.site_url;
  },
  get defaultImage() {
    return `${DEFAULT_BRANDING.site_url}/og-default.jpg`;
  },
  get locale() {
    return 'vi_VN';
  },
  get twitterHandle() {
    return DEFAULT_BRANDING.twitter_handle;
  },
  get defaultDescription() {
    return DEFAULT_BRANDING.site_description;
  },
};

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// JSON-LD Schema Generators (return objects, not strings)
// ============================================================================

/**
 * Generate JSON-LD VideoObject schema for video pages
 */
export function generateVideoJsonLd(video: VideoSEO): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || `Xem ${video.title} trên ${SEO_CONFIG.siteName}`,
    thumbnailUrl: video.thumbnail_url || SEO_CONFIG.defaultImage,
    uploadDate: video.created_at || new Date().toISOString(),
    ...(video.duration && { duration: formatDurationISO8601(video.duration) }),
    ...(video.view_count && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'WatchAction' },
        userInteractionCount: video.view_count,
      },
    }),
    contentUrl: video.video_url,
    embedUrl: `${SEO_CONFIG.siteUrl}/embed/${video.slug}`,
    url: `${SEO_CONFIG.siteUrl}/videos/${video.slug}`,
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
}

/**
 * Generate JSON-LD WebSite schema for home page
 */
export function generateWebsiteJsonLd(): object {
  return {
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
}

/**
 * Generate JSON-LD BreadcrumbList schema
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate JSON-LD ItemList schema for category/playlist pages
 */
export function generateVideoListJsonLd(
  videos: VideoSEO[],
  listName: string,
  listUrl: string
): object {
  return {
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
}

/**
 * Generate JSON-LD CollectionPage schema for playlist pages
 */
export function generatePlaylistJsonLd(
  playlist: { name: string; description?: string; slug: string },
  videos: VideoSEO[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: playlist.name,
    description: playlist.description || `Playlist ${playlist.name}`,
    url: `${SEO_CONFIG.siteUrl}/playlists/${playlist.slug}`,
    mainEntity: {
      '@type': 'ItemList',
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
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Truncate description to SEO-friendly length (default 160 chars)
 */
export function truncateDescription(text: string | undefined | null, maxLength = 160): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Format duration in ISO 8601 format for schema.org
 */
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
 * Build full canonical URL from path
 */
export function buildCanonical(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
}
