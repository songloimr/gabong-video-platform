import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

import { Request } from 'express';
import { Role } from '../../constants/role.enum';
import { JwtPayload } from '../../types';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        );

        if (!requiredRoles) {
            return true;
        }
        await super.canActivate(context);
        const { user } = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
        const hasRole = requiredRoles.some((role) => user.roles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException(
                `You don't have permission to access this resource`,
            );
        }

        return true;
    }
}
