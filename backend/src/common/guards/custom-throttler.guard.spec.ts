import { ExecutionContext } from '@nestjs/common';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Role } from '../../constants/role.enum';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;
  let mockSiteSettingsService: jest.Mocked<SiteSettingsService>;

  const createMockExecutionContext = (
    user?: { roles: Role[] },
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          ip: '127.0.0.1',
          headers: {},
        }),
        getResponse: () => ({
          header: jest.fn(),
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      getType: () => 'http',
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    mockSiteSettingsService = {
      getSetting: jest.fn(),
    } as any;

    guard = new CustomThrottlerGuard(
      { throttlers: [{ name: 'default', ttl: 60000, limit: 15 }] } as any,
      { increment: jest.fn() } as any,
      { getAllAndOverride: jest.fn() } as any,
      mockSiteSettingsService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should bypass for admin users', async () => {
    const context = createMockExecutionContext({ roles: [Role.Admin] });
    
    const result = await guard.canActivate(context);
    
    expect(result).toBe(true);
  });

  it('should return correct limit from settings', async () => {
    mockSiteSettingsService.getSetting.mockResolvedValue(20);
    const context = createMockExecutionContext({ roles: [Role.User] });
    
    const limit = await (guard as any).getLimit(context);
    
    expect(limit).toBe(20);
    expect(mockSiteSettingsService.getSetting).toHaveBeenCalledWith(
      'global_rate_limit_requests',
    );
  });

  it('should return default limit when setting is null', async () => {
    mockSiteSettingsService.getSetting.mockResolvedValue(null);
    const context = createMockExecutionContext({ roles: [Role.User] });
    
    const limit = await (guard as any).getLimit(context);
    
    expect(limit).toBe(15);
  });

  it('should return correct TTL from settings', async () => {
    mockSiteSettingsService.getSetting.mockResolvedValue(120);
    const context = createMockExecutionContext({ roles: [Role.User] });
    
    const ttl = await (guard as any).getTtl(context);
    
    expect(ttl).toBe(120 * 1000);
    expect(mockSiteSettingsService.getSetting).toHaveBeenCalledWith(
      'global_rate_limit_seconds',
    );
  });

  it('should return default TTL when setting is null', async () => {
    mockSiteSettingsService.getSetting.mockResolvedValue(null);
    const context = createMockExecutionContext({ roles: [Role.User] });
    
    const ttl = await (guard as any).getTtl(context);
    
    expect(ttl).toBe(60 * 1000);
  });
});
