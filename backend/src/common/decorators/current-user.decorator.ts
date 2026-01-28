import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return user;
  }
);
