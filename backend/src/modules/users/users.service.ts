import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { eq, sql, or, ilike, and } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { users } from '../../database/schema';
import { UpdateProfileDto, UserFilterDto } from './dto';
import { PaginationParams } from '../../types';
import sharp = require('sharp');

import {
  calculateOffset,
  buildPaginationMeta,
} from '../../common/helpers/pagination.helper';
import type { PaginatedResponse, UserProfileResponse, UserAdminListItemResponse, UserStatusUpdateResponse } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

  constructor(
    private readonly drizzle: DrizzleService,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findByUsername(username: string): Promise<UserProfileResponse> {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      bio: user.bio,
      created_at: user.created_at,
    };
  }

  async findById(id: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.bio !== undefined) updateData.bio = dto.bio;

    const [updatedUser] = await this.drizzle.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar_url: updatedUser.avatar_url,
      bio: updatedUser.bio,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
    };
  }

  getAvatar(fileName?: string) {
    if (!fileName) {
      throw new NotFoundException('Avatar not found');
    }
    const filePath = path.join(this.uploadDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Avatar not found');
    }
    return path.resolve(filePath);
  }

  async updateAvatar(userId: string, avatarFile: Express.Multer.File) {
    const ext = avatarFile.originalname.split('.').pop() || 'jpg';
    const filename = `${userId}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    await sharp(avatarFile.buffer)
      .resize(200, 200)
      .jpeg({ quality: 70 })
      .toFile(filepath);

    await this.drizzle.db
      .update(users)
      .set({ avatar_url: filename, updated_at: new Date() })
      .where(eq(users.id, userId));

    return {
      avatar_url: filename
    };
  }

  async findAllForAdmin(
    params: PaginationParams,
    filters: UserFilterDto,
  ): Promise<PaginatedResponse<UserAdminListItemResponse>> {
    const offset = calculateOffset(params.page, params.limit);

    const whereConditions = [];

    if (filters.status) {
      whereConditions.push(eq(users.status, filters.status));
    }

    if (filters.search) {
      const emailClause = users.email
        ? or(ilike(users.username, `%${filters.search}%`), ilike(users.email, `%${filters.search}%`))
        : sql`TRUE`;

      whereConditions.push(emailClause);
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          status: users.status,
          avatar_url: users.avatar_url,
          created_at: users.created_at,
        })
        .from(users)
        .where(whereClause)
        .orderBy(users.created_at)
        .limit(params.limit)
        .offset(offset),

      this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(whereClause),
    ]);

    return {
      data: items,
      pagination: buildPaginationMeta(count, params.page, params.limit),
    };
  }

  async updateUserStatus(
    id: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string,
  ): Promise<UserStatusUpdateResponse> {
    const [existingUser] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    const bioValue = reason
      ? (existingUser?.bio || '') + `\n\nStatus changed: ${reason}`
      : existingUser?.bio;

    const [user] = await this.drizzle.db
      .update(users)
      .set({
        status,
        bio: bioValue,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
