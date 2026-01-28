import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { UsersService } from '../../modules/users/users.service';
import { Role } from '../../constants/role.enum';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis';

const DEFAULT_ACCOUNT_WAIT_HOURS = 24;
const DEFAULT_DAILY_UPLOAD_LIMIT = 2;
const REDIS_KEY_PREFIX = 'upload_daily:';

@Injectable()
export class UploadRestrictionGuard implements CanActivate {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.roles?.includes(Role.Admin)) {
      return true;
    }

    const settings = await this.siteSettingsService.getSettings([
      'new_account_wait_hours',
      'daily_upload_limit',
    ]);

    const waitHours = settings.new_account_wait_hours ?? DEFAULT_ACCOUNT_WAIT_HOURS;
    const dailyLimit = settings.daily_upload_limit ?? DEFAULT_DAILY_UPLOAD_LIMIT;

    await this.checkAccountAge(user.sub, waitHours);
    await this.checkDailyLimit(user.sub, dailyLimit);

    return true;
  }

  private async checkAccountAge(userId: string, waitHours: number): Promise<void> {
    const userRecord = await this.usersService.findById(userId);
    if (!userRecord?.created_at) {
      throw new ForbiddenException('User not found');
    }

    const accountAgeMs = Date.now() - new Date(userRecord.created_at).getTime();
    const requiredAgeMs = waitHours * 60 * 60 * 1000;

    if (accountAgeMs < requiredAgeMs) {
      const remainingMs = requiredAgeMs - accountAgeMs;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      throw new ForbiddenException(
        `Tài khoản mới cần đợi thêm ${remainingHours} giờ nữa để upload video`,
      );
    }
  }

  private async checkDailyLimit(userId: string, dailyLimit: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const redisKey = `${REDIS_KEY_PREFIX}${userId}:${today}`;
    
    const currentCount = await this.redis.get(redisKey);
    const count = parseInt(currentCount || '0', 10);

    if (count >= dailyLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Bạn đã đạt giới hạn ${dailyLimit} video/ngày. Vui lòng thử lại sau.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.redis.incr(redisKey);
    const ttlExists = await this.redis.ttl(redisKey);
    if (ttlExists === -1) {
      const secondsUntilMidnight = this.getSecondsUntilMidnightUTC();
      await this.redis.expire(redisKey, secondsUntilMidnight);
    }
  }

  private getSecondsUntilMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }
}
