import {
  Controller,
  Get,
  Post,
  Put,
  Head,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Body,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AdminService } from './admin.service';

import { Roles } from '../../common/decorators';
import { User } from '../../common/decorators';
import { JwtPayload, VideoStatus } from '../../types';
import { VideosService } from '../videos/videos.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';
import {
  UpdateVisibilityDto,
  UpdateUploadDateDto,
  RejectVideoDto,
} from '../videos/dto';
import { Role } from '../../constants/role.enum';
import { VideoSourceType } from '../../types/video.types';
import { VideoProcessingProcessor } from '../video-processing/video-processing.processor';

@Controller('admin')
@Roles(Role.Admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly videosService: VideosService,
    private readonly notificationsService: NotificationsService,
    private readonly storageService: StorageService,
    private readonly videoProcessingProcessor: VideoProcessingProcessor,
  ) { }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('settings/test-r2')
  async testR2Connection() {
    return this.storageService.testConnection();
  }

  @Get('users')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('status') status?: 'active' | 'suspended' | 'banned',
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({ page, limit }, { status, search });
  }

  // Video management endpoints
  @Get('videos')
  async getAdminVideos(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('status') status?: VideoStatus,
    @Query('search') search?: string,
    @Query('sort') sort?: 'newest' | 'oldest' | 'views' | 'likes',
  ) {
    return this.videosService.getVideosForAdmin({ page, limit }, { status, search, sort });
  }


  @Get('videos/pending')
  async getPendingVideos(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.videosService.getPendingVideos({ page, limit });
  }

  @Post('videos/:id/approve')
  async approveVideo(@Param('id') id: string, @User() user: JwtPayload) {
    const video = await this.videosService.approve(id, user.sub);

    // Only process through queue if it's an upload
    if (video.source_type === VideoSourceType.UPLOAD) {
      await this.videoProcessingProcessor.addToQueue(id);
    } else {
      // For embeds, we can mark as approved immediately
      await this.videosService.updateStatus(id, 'approved');
    }

    return video;
  }

  @Post('videos/:id/reject')
  async rejectVideo(@Param('id') id: string, @Body() dto: RejectVideoDto) {
    return this.videosService.reject(id, dto.reason);
  }

  @Put('videos/:id/visibility')
  async updateVideoVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.videosService.updateVisibility(id, dto);
  }

  @Put('videos/:id/upload-date')
  async updateVideoUploadDate(
    @Param('id') id: string,
    @Body() dto: UpdateUploadDateDto,
  ) {
    return this.videosService.updateUploadDate(id, dto);
  }

  // User management endpoint
  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'active' | 'suspended' | 'banned'; reason?: string },
  ) {
    return this.adminService.updateUserStatus(id, dto.status, dto.reason);
  }

  // Playlist management endpoints
  @Get('playlists')
  async getAdminPlaylists(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllPlaylists({ page, limit });
  }

  // Mass notification endpoint
  @Post('notifications/mass')
  async sendMassNotification(
    @Body() dto: { title: string; message: string; link?: string; target_user_ids?: string[] },
  ) {
    const result = await this.notificationsService.createMassNotification(
      dto.title,
      dto.message,
      dto.link,
      dto.target_user_ids,
    );
    return result;
  }

  @Get('videos/:id/preview')
  @Head('videos/:id/preview')
  async previewOriginalVideo(@Param('id') id: string, @Res() res: Response) {
    const video = await this.videosService.findOne(id);

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (!video.local_path || !fs.existsSync(video.local_path)) {
      throw new NotFoundException('Original video file not found');
    }

    return res.sendFile(path.resolve(video.local_path));
  }
}
