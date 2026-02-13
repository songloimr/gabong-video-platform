import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { VideosService } from './videos.service';
import { VideoListParams } from './dto';
import { ValidateIdentifierPipe } from '../../common/pipes';
import { SubtitlesService } from '../subtitles/subtitles.service';
import { VideoMarkupsService } from '../video-markups/video-markups.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly subtitlesService: SubtitlesService,
    private readonly videoMarkupsService: VideoMarkupsService,
  ) {}

  @Get()
  async findAll(@Query() params: VideoListParams) {
    const { page = 1, limit = 25, ...filters } = params;
    return this.videosService.findAll({ page, limit }, filters);
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    return this.videosService.getFeaturedVideos(limit ? parseInt(limit, 10) : 10);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(@Param('slug') slug: string) {
    return this.videosService.findBySlug(slug);
  }

  @Get(':videoId/subtitles')
  async getSubtitles(@Param('videoId', ValidateIdentifierPipe) videoId: string) {
    const isPublic = true;
    
    return this.subtitlesService.findByVideoId(videoId, isPublic);
  }

  @Get(':videoId/subtitles/:subtitleId')
  @Header('Content-Type', 'text/vtt; charset=utf-8')
  async getSubtitleVtt(
    @Param('subtitleId') subtitleId: string,
    @Res() res: Response,
  ) {
    if(!subtitleId || !subtitleId.endsWith(".vtt")) {
      throw new NotFoundException('Subtitle not found');
    }

    subtitleId = subtitleId.replace(".vtt", "");

    const subtitle = await this.subtitlesService.findById(subtitleId);
    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }
    res.send(subtitle.vtt_content);
  }

  @Get(':videoId/markups')
  async getMarkups(@Param('videoId', ValidateIdentifierPipe) videoId: string) {
    const isPublic = true;
    return this.videoMarkupsService.findByVideoId(videoId, isPublic);
  }
}
