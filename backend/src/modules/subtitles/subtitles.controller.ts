import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { CreateSubtitleDto, UpdateSubtitleDto } from './dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../constants/role.enum';

@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @Get()
  @Roles(Role.Admin)
  async findByVideoId(@Query('videoId') videoId: string) {
    return this.subtitlesService.findByVideoId(videoId);
  }

  @Get(':id')
  @Roles(Role.Admin)
  async findById(@Param('id') id: string) {
    return this.subtitlesService.findById(id);
  }

  @Post()
  @Roles(Role.Admin)
  async create(@Body() dto: CreateSubtitleDto) {
    return this.subtitlesService.create(dto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateSubtitleDto) {
    return this.subtitlesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async delete(@Param('id') id: string) {
    return this.subtitlesService.delete(id);
  }
}
