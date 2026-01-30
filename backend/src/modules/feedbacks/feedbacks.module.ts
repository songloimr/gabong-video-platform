import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { FeedbacksService } from './feedbacks.service';
import {
  FeedbacksController,
  AdminFeedbacksController,
} from './feedbacks.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [FeedbacksController, AdminFeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
