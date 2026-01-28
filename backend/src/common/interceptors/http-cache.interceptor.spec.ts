import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpCacheInterceptor } from './http-cache.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Reflector } from '@nestjs/core';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let cacheManager: any;
  let siteSettingsService: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockSiteSettingsService = {
    getSetting: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCacheInterceptor,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: SiteSettingsService, useValue: mockSiteSettingsService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    interceptor = module.get<HttpCacheInterceptor>(HttpCacheInterceptor);
    cacheManager = mockCacheManager;
    siteSettingsService = mockSiteSettingsService;

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    method: string = 'GET',
    url: string = '/api/categories',
  ): ExecutionContext => {
    const mockRequest = {
      method,
      url,
      originalUrl: url,
    };
    const mockResponse = {
      setHeader: jest.fn(),
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (data: any = { items: [] }): CallHandler => ({
    handle: () => of(data),
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add x-cache: MISS header on first request (cache miss)', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    siteSettingsService.getSetting.mockResolvedValue(15);
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const handler = createMockCallHandler({ items: ['category1'] });
    const response = context.switchToHttp().getResponse();

    const obs$ = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      obs$.subscribe({ complete: () => resolve() });
    });

    expect(response.setHeader).toHaveBeenCalledWith('x-cache', 'MISS');
  });

  it('should add x-cache: HIT header on cached request', async () => {
    const cachedData = { items: ['cached-category'] };
    cacheManager.get.mockResolvedValue(cachedData);
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const handler = createMockCallHandler();
    const response = context.switchToHttp().getResponse();

    const obs$ = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      obs$.subscribe({ complete: () => resolve() });
    });

    expect(response.setHeader).toHaveBeenCalledWith('x-cache', 'HIT');
  });

  it('should not cache POST requests', async () => {
    const context = createMockExecutionContext('POST', '/api/categories');
    const handler = createMockCallHandler();

    const result = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      result.subscribe({ complete: () => resolve() });
    });

    expect(cacheManager.get).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should use TTL from site settings', async () => {
    const customTtl = 20;
    cacheManager.get.mockResolvedValue(undefined);
    siteSettingsService.getSetting.mockResolvedValue(customTtl);
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const handler = createMockCallHandler({ items: ['category1'] });

    const obs$ = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      obs$.subscribe({ complete: () => resolve() });
    });

    expect(siteSettingsService.getSetting).toHaveBeenCalledWith(
      'cache_ttl_minutes',
    );
    expect(cacheManager.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      customTtl * 60 * 1000,
    );
  });

  it('should use default TTL of 15 minutes when setting is not available', async () => {
    cacheManager.get.mockResolvedValue(undefined);
    siteSettingsService.getSetting.mockResolvedValue(null);
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const handler = createMockCallHandler({ items: ['category1'] });

    const obs$ = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      obs$.subscribe({ complete: () => resolve() });
    });

    expect(cacheManager.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      15 * 60 * 1000,
    );
  });

  it('should generate cache key from URL', async () => {
    const testUrl = '/api/categories?page=1&limit=10';
    cacheManager.get.mockResolvedValue(undefined);
    siteSettingsService.getSetting.mockResolvedValue(15);
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockExecutionContext('GET', testUrl);
    const handler = createMockCallHandler();

    const obs$ = await interceptor.intercept(context, handler);
    await new Promise<void>((resolve) => {
      obs$.subscribe({ complete: () => resolve() });
    });

    expect(cacheManager.get).toHaveBeenCalledWith(expect.stringContaining(testUrl));
  });
});
