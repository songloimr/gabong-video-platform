import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Role } from '../../constants/role.enum';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis';

const DEFAULT_COOLDOWN_SECONDS = 30;
const DEFAULT_DAILY_LIMIT = 30;

@Injectable()
export class CommentRateLimitGuard implements CanActivate {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (user.roles?.includes(Role.Admin)) {
      return true;
    }

    const settings = await this.siteSettingsService.getSettings([
      'comment_cooldown_seconds',
      'comment_daily_limit',
    ]);

    const cooldownSeconds = settings.comment_cooldown_seconds ?? DEFAULT_COOLDOWN_SECONDS;
    const dailyLimit = settings.comment_daily_limit ?? DEFAULT_DAILY_LIMIT;

    await this.checkCooldown(user.sub, cooldownSeconds);
    await this.checkDailyLimit(user.sub, dailyLimit);

    return true;
  }

  private async checkCooldown(userId: string, cooldownSeconds: number): Promise<void> {
    const cooldownKey = `comment_cooldown:${userId}`;
    const exists = await this.redis.get(cooldownKey);

    if (exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Vui lòng đợi ${cooldownSeconds} giây trước khi bình luận tiếp`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.redis.set(cooldownKey, '1', 'EX', cooldownSeconds);
  }

  private async checkDailyLimit(userId: string, dailyLimit: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `comment_daily:${userId}:${today}`;
    
    const currentCount = await this.redis.get(dailyKey);
    const count = parseInt(currentCount || '0', 10);

    if (count >= dailyLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Bạn đã đạt giới hạn ${dailyLimit} bình luận/ngày`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.redis.incr(dailyKey);
    const ttlExists = await this.redis.ttl(dailyKey);
    if (ttlExists === -1) {
      const secondsUntilMidnight = this.getSecondsUntilMidnightUTC();
      await this.redis.expire(dailyKey, secondsUntilMidnight);
    }
  }

  private getSecondsUntilMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  }
}
