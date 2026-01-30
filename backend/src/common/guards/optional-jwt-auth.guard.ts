import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Ignore auth errors - user will be undefined for guests
    }
    return true;
  }

  handleRequest(err: any, user: any) {
    // Don't throw on error, just return null user
    return user || null;
  }
}
