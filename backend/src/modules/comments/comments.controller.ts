import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, HideCommentDto } from './dto';
import { JwtAuthGuard, CommentRateLimitGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { Role } from '../../constants/role.enum';

@Controller('videos/:videoId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Get()
  async findByVideoId(
    @Param('videoId') videoId: string,
    @Query('parent_id') parentId: string | null = null,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('sort') sort: 'newest' | 'oldest' = 'newest',
  ) {
    return this.commentsService.findByVideoId(
      videoId,
      parentId,
      limit,
      offset,
      sort,
    );
  }

  @Post()
  @Roles(Role.User, Role.Admin)
  @UseGuards(CommentRateLimitGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('videoId') videoId: string,
    @Body() dto: CreateCommentDto,
    @User() user: JwtPayload,
  ) {
    return this.commentsService.create(videoId, user.sub, dto);
  }
}

@Controller('comments')
export class CommentsAdminController {
  constructor(private readonly commentsService: CommentsService) { }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.commentsService.delete(id);
  }

  @Put(':id/hide')
  @Roles(Role.Admin)
  async hide(
    @Param('id') id: string,
    @Body() dto: HideCommentDto,
    @User() user: JwtPayload,
  ) {
    return this.commentsService.hide(id, dto, user.sub);
  }
}
