import { API_URL } from '$env/static/private';
import { PUBLIC_VITE_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch }) => {
  try {
    // Proxy sitemap from backend
    const response = await fetch(`${API_URL}/api/sitemap/sitemap.xml`);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const sitemap = await response.text();

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching sitemap from backend:', error);

    // Return minimal sitemap as fallback
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${PUBLIC_VITE_API_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallback, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
};
