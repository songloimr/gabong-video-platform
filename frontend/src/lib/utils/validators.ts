export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,50}$/.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateFileSize(size: number, maxSize: number = 500 * 1024 * 1024): boolean {
  return size <= maxSize;
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'File must be a video' };
  }
  if (!validateFileSize(file.size)) {
    return { valid: false, error: 'File size exceeds 500MB limit' };
  }
  return { valid: true };
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}
