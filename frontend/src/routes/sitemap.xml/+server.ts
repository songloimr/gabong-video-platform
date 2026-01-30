import type { RequestHandler } from './$types';
import { PUBLIC_VITE_API_URL } from '$env/static/public';

// Hardcoded site URL since VITE_APP_URL is not exposed as PUBLIC_
const SITE_URL = 'https://gabong.net';

interface Video {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface Category {
  slug: string;
}

interface Playlist {
  id: string;
  updated_at?: string;
}

export const GET: RequestHandler = async ({ fetch }) => {
  const urls: string[] = [];
  
  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/search', priority: '0.8', changefreq: 'daily' },
    { loc: '/most-liked', priority: '0.8', changefreq: 'daily' },
  ];

  for (const page of staticPages) {
    urls.push(`
    <url>
      <loc>${SITE_URL}${page.loc}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
  }

  try {
    // Fetch videos
    const videosRes = await fetch(`${PUBLIC_VITE_API_URL}/api/videos?limit=1000&status=approved`);
    if (videosRes.ok) {
      const videosData = await videosRes.json();
      const videos: Video[] = videosData.data || [];
      
      for (const video of videos) {
        const lastmod = video.updated_at || video.created_at;
        urls.push(`
    <url>
      <loc>${SITE_URL}/videos/${video.slug}</loc>
      ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`);
      }
    }

    // Fetch categories
    const categoriesRes = await fetch(`${PUBLIC_VITE_API_URL}/api/categories`);
    if (categoriesRes.ok) {
      const categories: Category[] = await categoriesRes.json();
      
      for (const category of categories) {
        urls.push(`
    <url>
      <loc>${SITE_URL}/categories/${category.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
      }
    }

    // Fetch public playlists
    const playlistsRes = await fetch(`${PUBLIC_VITE_API_URL}/api/playlists?is_public=true&limit=500`);
    if (playlistsRes.ok) {
      const playlistsData = await playlistsRes.json();
      const playlists: Playlist[] = playlistsData.data || [];
      
      for (const playlist of playlists) {
        const lastmod = playlist.updated_at;
        urls.push(`
    <url>
      <loc>${SITE_URL}/playlists/${playlist.id}</loc>
      ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('')}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600, s-maxage=3600',
    },
  });
};
