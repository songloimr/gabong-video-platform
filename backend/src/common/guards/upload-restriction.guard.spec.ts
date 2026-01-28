import { ExecutionContext, ForbiddenException, HttpException } from '@nestjs/common';
import { UploadRestrictionGuard } from './upload-restriction.guard';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { UsersService } from '../../modules/users/users.service';
import { Role } from '../../constants/role.enum';
import { REDIS_CLIENT } from '../redis';

describe('UploadRestrictionGuard', () => {
  let guard: UploadRestrictionGuard;
  let mockSiteSettingsService: jest.Mocked<SiteSettingsService>;
  let mockUsersService: jest.Mocked<UsersService>;
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

    mockUsersService = {
      findById: jest.fn(),
    } as any;

    mockRedis = {
      get: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
    } as any;

    guard = new UploadRestrictionGuard(
      mockSiteSettingsService,
      mockUsersService,
      mockRedis,
    );

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
    expect(mockUsersService.findById).not.toHaveBeenCalled();
  });

  it('should block user with account < 24h old', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'new-user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'new-user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 24,
      daily_upload_limit: 2,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should return remaining time in error response for new accounts', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'new-user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'new-user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 24,
      daily_upload_limit: 2,
    });

    try {
      await guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toMatch(/\d+/);
    }
  });

  it('should allow user with account >= 24h old', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'old-user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'old-user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 24,
      daily_upload_limit: 2,
    });

    mockRedis.get.mockResolvedValue('1');
    mockRedis.incr.mockResolvedValue(2);
    mockRedis.ttl.mockResolvedValue(-1);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should block user who exceeded daily upload limit', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 24,
      daily_upload_limit: 2,
    });

    mockRedis.get.mockResolvedValue('2');

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
  });

  it('should use configurable limits from settings', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 48,
      daily_upload_limit: 5,
    });

    mockRedis.get.mockResolvedValue('3');
    mockRedis.incr.mockResolvedValue(4);
    mockRedis.ttl.mockResolvedValue(-1);

    await guard.canActivate(context);

    expect(mockSiteSettingsService.getSettings).toHaveBeenCalledWith([
      'new_account_wait_hours',
      'daily_upload_limit',
    ]);
  });

  it('should increment upload count on successful upload', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const context = createMockExecutionContext({
      sub: 'user-id',
      roles: [Role.User],
    });

    mockUsersService.findById.mockResolvedValue({
      id: 'user-id',
      created_at: createdAt,
    } as any);

    mockSiteSettingsService.getSettings.mockResolvedValue({
      new_account_wait_hours: 24,
      daily_upload_limit: 2,
    });

    mockRedis.get.mockResolvedValue('0');
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(-1);

    await guard.canActivate(context);

    expect(mockRedis.incr).toHaveBeenCalled();
    expect(mockRedis.expire).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number),
    );
  });
});
