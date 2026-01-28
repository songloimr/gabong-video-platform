import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles, User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { Role } from '../../constants/role.enum';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @Roles(Role.User, Role.Admin)
  async findAll(
    @User() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('is_read') is_read?: boolean,
  ) {
    return this.notificationsService.findAll(
      user.sub,
      { page, limit },
      { is_read },
    );
  }

  @Get('count')
  @Roles(Role.User, Role.Admin)
  async getUnreadCount(@User() user: JwtPayload) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Put(':id/read')
  @Roles(Role.User, Role.Admin)
  async markAsRead(@Param('id') id: string, @User() user: JwtPayload) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Put('read-all')
  @Roles(Role.User, Role.Admin)
  async markAllAsRead(@User() user: JwtPayload) {
    await this.notificationsService.markAllAsRead(user.sub);
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User() user: JwtPayload) {
    await this.notificationsService.delete(id, user.sub);
  }
}
