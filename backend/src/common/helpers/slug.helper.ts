/**
   * Generate URL-safe slug from title
   */
export function generateSlug(title: string): string {
    const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const suffix = Math.random().toString(36).substring(2, 11);
    return `${baseSlug}-${suffix}`;
}