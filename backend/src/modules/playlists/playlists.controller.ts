import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto, UpdatePlaylistDto, AddVideosDto } from './dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../constants/role.enum';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) { }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.playlistsService.findAll({ page, limit });
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.playlistsService.findBySlug(slug);
  }

  @Get('id/:id')
  @Roles(Role.Admin)
  async findById(@Param('id') id: string) {
    return this.playlistsService.findById(id);
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    return this.playlistsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.playlistsService.delete(id);
  }

  @Post(':id/videos')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async addVideos(@Param('id') id: string, @Body() dto: AddVideosDto) {
    return this.playlistsService.addVideos(id, dto);
  }

  @Delete(':id/videos/:videoId')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async removeVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
  ) {
    return this.playlistsService.removeVideo(id, videoId);
  }
}
