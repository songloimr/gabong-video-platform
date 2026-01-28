import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { users, refreshTokens } from '../../database/schema';
import { RegisterDto, LoginDto } from './dto';
import { JwtPayload, TokensResponse } from '../../types';
import { AUTH_CONSTANTS } from '../../constants';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from '../../constants/role.enum';

@Injectable()
export class AuthService {
  private readonly avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FF9800', '#FF5722', '#795548',
  ];
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private generateDefaultAvatarSvg(username: string): string {
    const initial = username?.charAt(0)?.toUpperCase() || '?';
    const colorIndex = username.charCodeAt(0) % this.avatarColors.length;
    const bgColor = this.avatarColors[colorIndex];

    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${bgColor}"/>
      <text x="100" y="125" text-anchor="middle" fill="white" font-size="100" font-family="Arial, sans-serif" font-weight="bold">${initial}</text>
    </svg>`;
  }

  private saveDefaultAvatar(userId: string, username: string): string {
    const svg = this.generateDefaultAvatarSvg(username);
    const filename = `${userId}-${uuidv4()}.svg`;
    const filepath = path.join(this.uploadsDir, filename);

    fs.writeFileSync(filepath, svg);

    return `/uploads/avatars/${filename}`;
  }

  async register(dto: RegisterDto) {
    const [existingUser] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.username, dto.username));

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    if (dto.email) {
      const [existingEmail] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.email, dto.email));

      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    const password_hash = await bcrypt.hash(dto.password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);

    const [newUser] = await this.drizzle.db
      .insert(users)
      .values({
        username: dto.username,
        email: dto.email || null,
        password_hash,
        role: 'user',
        status: 'active',
      })
      .returning();

    const avatarUrl = this.saveDefaultAvatar(newUser.id, newUser.username);

    await this.drizzle.db
      .update(users)
      .set({ avatar_url: avatarUrl })
      .where(eq(users.id, newUser.id));

    const tokens = await this.generateTokens({
      sub: newUser.id,
      username: newUser.username,
      roles: [Role.User],
    });

    await this.storeRefreshToken(newUser.id, tokens.refresh_token);

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar_url: avatarUrl,
        created_at: newUser.created_at,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.username, dto.username));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      if (user.status === 'suspended') {
        throw new ForbiddenException('Account is suspended');
      }
      if (user.status === 'banned') {
        throw new ForbiddenException('Account is banned');
      }
    }

    await this.drizzle.db
      .update(users)
      .set({ last_login_at: new Date() })
      .where(eq(users.id, user.id));

    const tokens = await this.generateTokens({
      sub: user.id,
      username: user.username,
      roles: [user.role as Role],
    });

    await this.storeRefreshToken(user.id, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const [tokenRecord] = await this.drizzle.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > tokenRecord.expires_at) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const tokens = await this.generateTokens({
        sub: payload.sub as string,
        username: payload.username as string,
        roles: payload.roles,
      });

      await this.drizzle.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));

      await this.storeRefreshToken(payload.sub as string, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.drizzle.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));
  }

  private async generateTokens(payload: JwtPayload): Promise<TokensResponse> {
    const accessTokenExpiresIn = this.configService.get<string>(
      'jwt.accessTokenExpiresIn',
      '30m',
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
      '7d',
    );
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    const access_token = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn as any,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshTokenExpiresIn as any,
    });

    return { access_token, refresh_token };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
      '7d',
    );
    const expiresAt = new Date(Date.now() + this.parseDuration(expiresIn));

    await this.drizzle.db.insert(refreshTokens).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
