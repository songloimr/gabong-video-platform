import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Role } from '../../constants/role.enum';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class FeedbackRateLimitGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Bypass for Admin users and SSR requests from frontend server
    if (user?.roles?.includes(Role.Admin) || request.headers['ssr']) {
      return true;
    }

    // Identifier: user_id if logged in, IP if guest
    const identifier = user?.sub || this.getClientIp(request);

    const dailyLimit = this.configService.get<number>('rateLimit.feedback.dailyLimit')

    await this.checkDailyLimit(identifier, dailyLimit);

    return true;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private async checkDailyLimit(identifier: string, dailyLimit: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `feedback_daily:${identifier}:${today}`;

    const currentCount = await this.redis.get(dailyKey);
    const count = parseInt(currentCount || '0', 10);

    if (count >= dailyLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Bạn đã đạt giới hạn ${dailyLimit} feedback/ngày`,
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
