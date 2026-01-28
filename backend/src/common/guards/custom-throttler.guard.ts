import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorage, ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Role } from '../../constants/role.enum';

const DEFAULT_RATE_LIMIT = 15;
const DEFAULT_TTL_SECONDS = 60;

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject('THROTTLER:MODULE_OPTIONS')
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
    private readonly siteSettingsService: SiteSettingsService,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.roles?.includes(Role.Admin)) {
      return true;
    }

    return super.canActivate(context);
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const limit = await this.siteSettingsService.getSetting<number>(
      'global_rate_limit_requests',
    );
    return limit ?? DEFAULT_RATE_LIMIT;
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    const ttlSeconds = await this.siteSettingsService.getSetting<number>(
      'global_rate_limit_seconds',
    );
    return (ttlSeconds ?? DEFAULT_TTL_SECONDS) * 1000;
  }
}
