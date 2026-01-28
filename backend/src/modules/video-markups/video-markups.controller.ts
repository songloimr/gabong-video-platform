import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { VideoMarkupsService } from './video-markups.service';
import { CreateVideoMarkupDto, UpdateVideoMarkupDto } from './dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../constants/role.enum';

@Controller('video-markups')
export class VideoMarkupsController {
  constructor(private readonly videoMarkupsService: VideoMarkupsService) {}

  @Get()
  @Roles(Role.Admin)
  async findByVideoId(@Query('videoId') videoId: string) {
    return this.videoMarkupsService.findByVideoId(videoId);
  }

  @Get(':id')
  @Roles(Role.Admin)
  async findById(@Param('id') id: string) {
    return this.videoMarkupsService.findById(id);
  }

  @Post()
  @Roles(Role.Admin)
  async create(@Body() dto: CreateVideoMarkupDto) {
    return this.videoMarkupsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateVideoMarkupDto) {
    return this.videoMarkupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async delete(@Param('id') id: string) {
    return this.videoMarkupsService.delete(id);
  }
}
