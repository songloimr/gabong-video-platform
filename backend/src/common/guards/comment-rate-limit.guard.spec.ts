import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { CommentRateLimitGuard } from './comment-rate-limit.guard';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Role } from '../../constants/role.enum';

describe('CommentRateLimitGuard', () => {
  let guard: CommentRateLimitGuard;
  let mockSiteSettingsService: jest.Mocked<SiteSettingsService>;
  let mockRedis: any;

  const createMockExecutionContext = (
    user?: { sub: string; roles: Role[] },
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    mockSiteSettingsService = {
      getSettings: jest.fn(),
    } as any;

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
    };

    guard = new CommentRateLimitGuard(mockSiteSettingsService, mockRedis);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should bypass for admin users', async () => {
    const context = createMockExecutionContext({
      sub: 'admin-user-id',
      roles: [Role.Admin],
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockRedis.get).not.toHaveBeenCalled();
  });

  it('should block comment within 30s of previous', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 30,
      comment_daily_limit: 30,
    });

    mockRedis.get.mockResolvedValueOnce('1');

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
  });

  it('should allow comment after 30s cooldown', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 30,
      comment_daily_limit: 30,
    });

    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('5');

    mockRedis.incr.mockResolvedValue(6);
    mockRedis.ttl.mockResolvedValue(-1);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should block after 30 comments per day', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 30,
      comment_daily_limit: 30,
    });

    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('30');

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
  });

  it('should use configurable limits from settings', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 60,
      comment_daily_limit: 50,
    });

    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('10');

    mockRedis.incr.mockResolvedValue(11);
    mockRedis.ttl.mockResolvedValue(-1);

    await guard.canActivate(context);

    expect(mockSiteSettingsService.getSettings).toHaveBeenCalledWith([
      'comment_cooldown_seconds',
      'comment_daily_limit',
    ]);
  });

  it('should set cooldown key after comment', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 30,
      comment_daily_limit: 30,
    });

    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('5');

    mockRedis.incr.mockResolvedValue(6);
    mockRedis.ttl.mockResolvedValue(-1);

    await guard.canActivate(context);

    expect(mockRedis.set).toHaveBeenCalledWith(
      expect.stringContaining('cooldown'),
      '1',
      'EX',
      30,
    );
  });

  it('should use UTC midnight for daily reset', async () => {
    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockSiteSettingsService.getSettings.mockResolvedValue({
      comment_cooldown_seconds: 30,
      comment_daily_limit: 30,
    });

    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('5');

    mockRedis.incr.mockResolvedValue(6);
    mockRedis.ttl.mockResolvedValue(-1);

    await guard.canActivate(context);

    const todayKey = expect.stringContaining(
      new Date().toISOString().split('T')[0],
    );
    expect(mockRedis.get).toHaveBeenCalledWith(todayKey);
  });
});
