import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { Roles, User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { RATE_LIMIT_CONSTANTS } from '../../constants';
import { Role } from '../../constants/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @Throttle({
    default: {
      limit: RATE_LIMIT_CONSTANTS.AUTH.REGISTER_LIMIT,
      ttl: RATE_LIMIT_CONSTANTS.AUTH.REGISTER_TTL,
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({
    default: {
      limit: RATE_LIMIT_CONSTANTS.AUTH.LOGIN_LIMIT,
      ttl: RATE_LIMIT_CONSTANTS.AUTH.LOGIN_TTL,
    },
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refresh_token);
  }

  @Get('session')
  @Roles(Role.User, Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getSession(@User() user: JwtPayload) {
    return { user };
  }
}
