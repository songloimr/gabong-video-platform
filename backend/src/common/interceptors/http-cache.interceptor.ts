import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';

const CACHE_KEY_PREFIX = 'http_cache:';
const DEFAULT_TTL_MINUTES = 15;

export const CACHE_TTL_KEY = 'cache_ttl';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      response.setHeader('x-cache', 'HIT');
      return of(cachedResponse);
    }

    response.setHeader('x-cache', 'MISS');

    const ttlFromDecorator = this.reflector.getAllAndOverride<number>(
      CACHE_TTL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const ttlMinutes = ttlFromDecorator ?? await this.getTtlFromSettings();
    const ttlMs = ttlMinutes * 60 * 1000;

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, ttlMs);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const url = request.originalUrl || request.url;
    return `${CACHE_KEY_PREFIX}${url}`;
  }

  private async getTtlFromSettings(): Promise<number> {
    const ttl = await this.siteSettingsService.getSetting<number>(
      'cache_ttl_minutes',
    );
    return ttl ?? DEFAULT_TTL_MINUTES;
  }
}
