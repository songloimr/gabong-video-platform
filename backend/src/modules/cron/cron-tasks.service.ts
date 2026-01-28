import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronService } from './cron.service';

@Injectable()
export class CronTasks {
  constructor(private readonly cronService: CronService) { }

  @Cron('*/5 * * * *')
  async refreshVideoStats() {
    await this.cronService.refreshVideoStats();
  }

  @Cron('0 * * * *')
  async refreshDashboardStats() {
    await this.cronService.refreshDashboardStats();
  }

  @Cron('0 */6 * * *')
  async refreshCategoryStats() {
    await this.cronService.refreshCategoryStats();
  }
}
