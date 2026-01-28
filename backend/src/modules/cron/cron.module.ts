import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CronTasks } from './cron-tasks.service';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
  imports: [DrizzleModule, ScheduleModule.forRoot()],
  providers: [CronService, CronTasks],
})
export class CronModule {}
