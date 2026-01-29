import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorage, ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { SiteSettingsService } from '../../modules/site-settings/site-settings.service';
import { Role } from '../../constants/role.enum';
import { Request } from 'express';
import { JwtPayload } from '../../types';


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
    const request = context.switchToHttp().getRequest<Request & {
      user: JwtPayload
    }>();
    
    const user = request.user;

    if (user?.roles?.includes(Role.Admin) || request.headers["ssr"]) {
      return true;
    }

    return super.canActivate(context);
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const limit = await this.siteSettingsService.getSetting<number>(
      'global_rate_limit_requests',
    );
    return limit;
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    const ttlSeconds = await this.siteSettingsService.getSetting<number>(
      'global_rate_limit_seconds',
    );
    return (ttlSeconds) * 1000;
  }
}
