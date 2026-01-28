export function generateMeta(title: string, description: string, image?: string) {
  return {
    title: `${title} - Gabong`,
    description,
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  };
}

export function generateVideoMeta(video: any) {
  return generateMeta(
    video.title,
    video.description || 'Watch this video on Gabong',
    video.thumbnail_url
  );
}
