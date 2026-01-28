export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function generateSlug(title: string, id?: string): string {
  const slug = slugify(title);
  return id ? `${slug}-${id.slice(0, 8)}` : slug;
}
