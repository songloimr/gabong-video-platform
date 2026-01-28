import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { mvCategoryStats, mvDashboardStats, mvVideoStats } from '../../database/schema';

@Injectable()
export class CronService {
  constructor(private readonly drizzle: DrizzleService) { }

  async refreshVideoStats() {
    await this.drizzle.db.refreshMaterializedView(mvVideoStats);
  }

  async refreshDashboardStats() {
    await this.drizzle.db.refreshMaterializedView(mvDashboardStats);
  }

  async refreshCategoryStats() {
    await this.drizzle.db.refreshMaterializedView(mvCategoryStats);
  }
}
