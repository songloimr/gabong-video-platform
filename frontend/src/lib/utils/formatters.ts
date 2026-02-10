import moment from 'moment';
import { PUBLIC_CDN_URL } from '$env/static/public';


export function formatDate(date: string | Date): string {
  return moment(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | Date): string {
  return moment(date).format('DD/MM/YYYY HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return moment(date).fromNow();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getAvatarUrl(avatarFilename: string): string {
  if (avatarFilename.startsWith('http'))
    return avatarFilename;
  return `${PUBLIC_CDN_URL}/${avatarFilename}`;
}
