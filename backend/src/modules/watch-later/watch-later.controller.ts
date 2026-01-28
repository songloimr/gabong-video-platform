import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WatchLaterService } from './watch-later.service';
import { Roles, User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { Role } from '../../constants/role.enum';

@Controller('watch-later')
export class WatchLaterController {
  constructor(private readonly watchLaterService: WatchLaterService) { }

  @Get()
  @Roles(Role.User, Role.Admin)
  async findAll(
    @User() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.watchLaterService.findAll(user.sub, { page, limit });
  }

  @Post(':videoId')
  @Roles(Role.User, Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Param('videoId') videoId: string,
    @User() user: JwtPayload,
  ) {
    return this.watchLaterService.add(user.sub, videoId);
  }

  @Put(':videoId')
  @Roles(Role.User, Role.Admin)
  async updatePosition(
    @Param('videoId') videoId: string,
    @Body() body: { watch_position: number },
    @User() user: JwtPayload,
  ) {
    return this.watchLaterService.updatePosition(
      user.sub,
      videoId,
      body.watch_position,
    );
  }

  @Delete(':videoId')
  @Roles(Role.User, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('videoId') videoId: string,
    @User() user: JwtPayload,
  ) {
    await this.watchLaterService.remove(user.sub, videoId);
  }
}
