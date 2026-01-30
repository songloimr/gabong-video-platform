import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto';
import { Roles, User } from '../../common/decorators';
import { Role } from '../../constants/role.enum';
import { JwtPayload } from '../../types';
import { FeedbackRateLimitGuard } from '../../common/guards/feedback-rate-limit.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard, FeedbackRateLimitGuard)
  async create(
    @Body() dto: CreateFeedbackDto,
    @User() user: JwtPayload,
    @Req() req: any,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.ip;

    return this.feedbacksService.create(dto, user?.sub, ipAddress);
  }
}

@Controller('admin/feedbacks')
@Roles(Role.Admin)
export class AdminFeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  async getAllFeedbacks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    return this.feedbacksService.findAll(page, limit, type);
  }

  @Delete(':id')
  async deleteFeedback(@Param('id') id: string) {
    return this.feedbacksService.remove(id);
  }
}
