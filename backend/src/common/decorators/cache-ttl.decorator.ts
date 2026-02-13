import { SetMetadata } from '@nestjs/common';
import { CACHE_TTL_KEY } from '../interceptors/http-cache.interceptor';

/**
 * Set cache TTL in minutes for HTTP responses
 * Works with HttpCacheInterceptor
 * @param minutes - Time to live in minutes
 */
export const CacheTTL = (minutes: number) => SetMetadata(CACHE_TTL_KEY, minutes);
