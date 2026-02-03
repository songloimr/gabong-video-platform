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
export function generateVideoJsonLd(video: VideoSEO, siteUrl: string, siteName: string): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: video.title,
		description: video.description || `Xem ${video.title} trên ${siteName}`,
		thumbnailUrl: video.thumbnail_url,
		uploadDate: video.created_at || new Date().toISOString(),
		...(video.duration && { duration: formatDurationISO8601(video.duration) }),
		...(video.view_count && {
			interactionStatistic: {
				'@type': 'InteractionCounter',
				interactionType: { '@type': 'WatchAction' },
				userInteractionCount: video.view_count
			}
		}),
		contentUrl: video.video_url,
		embedUrl: `${siteUrl}/embed/${video.slug}`,
		url: `${siteUrl}/videos/${video.slug}`,
		...(video.uploader && {
			author: {
				'@type': 'Person',
				name: video.uploader.display_name || video.uploader.username,
				url: `${siteUrl}/users/${video.uploader.username}`
			}
		}),
		publisher: {
			'@type': 'Organization',
			name: siteName,
			url: siteUrl,
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/logo.png`
			}
		}
	};
}

/**
 * Generate JSON-LD WebSite schema for home page
 */
export function generateWebsiteJsonLd(siteUrl: string, siteName: string, description?: string): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteName,
		url: siteUrl,
		description:
			description ||
			`Xem video thể thao, highlight bóng đá, bóng rổ và nhiều nội dung hấp dẫn khác trên ${siteName}.`,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteUrl}/search?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};
}

/**
 * Generate JSON-LD BreadcrumbList schema
 */
export function generateBreadcrumbJsonLd(
	items: Array<{ name: string; url: string }>,
	siteUrl: string
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
		}))
	};
}

/**
 * Generate JSON-LD ItemList schema for category/playlist pages
 */
export function generateVideoListJsonLd(
	videos: VideoSEO[],
	listName: string,
	listUrl: string,
	siteUrl: string
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: listName,
		url: listUrl.startsWith('http') ? listUrl : `${siteUrl}${listUrl}`,
		numberOfItems: videos.length,
		itemListElement: videos.slice(0, 10).map((video, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'VideoObject',
				name: video.title,
				url: `${siteUrl}/videos/${video.slug}`,
				thumbnailUrl: video.thumbnail_url
			}
		}))
	};
}

/**
 * Generate JSON-LD CollectionPage schema for playlist pages
 */
export function generatePlaylistJsonLd(
	playlist: { name: string; description?: string; slug: string },
	videos: VideoSEO[],
	siteUrl: string
): object {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: playlist.name,
		description: playlist.description || `Playlist ${playlist.name}`,
		url: `${siteUrl}/playlists/${playlist.slug}`,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: videos.length,
			itemListElement: videos.slice(0, 10).map((video, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'VideoObject',
					name: video.title,
					url: `${siteUrl}/videos/${video.slug}`,
					thumbnailUrl: video.thumbnail_url
				}
			}))
		}
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
export function buildCanonical(path: string, siteUrl: string): string {
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return `${siteUrl}${cleanPath}`;
}
