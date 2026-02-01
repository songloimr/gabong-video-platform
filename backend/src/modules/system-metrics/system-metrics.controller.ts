import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../constants/role.enum';
import { SystemMetricsService } from './system-metrics.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { QueueMetricsService } from './queue-metrics.service';
import { RequestMetricsService } from './request-metrics.service';
import { HistoryQueryDto } from './dto';

@Controller('system-metrics')
@UseGuards(JwtAuthGuard)
@Roles(Role.Admin)
export class SystemMetricsController {
  constructor(
    private readonly systemMetricsService: SystemMetricsService,
    private readonly metricsCollectorService: MetricsCollectorService,
    private readonly queueMetricsService: QueueMetricsService,
    private readonly requestMetricsService: RequestMetricsService,
  ) {}

  @Get('current')
  async getCurrentMetrics() {
    return this.systemMetricsService.getCurrentMetrics();
  }

  @Get('history')
  async getHistory(@Query() query: HistoryQueryDto) {
    const { range = '1h', type = 'all' } = query;
    const now = Date.now();
    const rangeMs = this.systemMetricsService.parseRange(range);
    const startTime = now - rangeMs;

    const dataPoints = await this.metricsCollectorService.getDownsampledHistory(
      startTime,
      now,
    );

    return {
      range,
      type,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(now).toISOString(),
      dataPoints,
    };
  }

  @Get('queues')
  async getQueueMetrics() {
    return this.queueMetricsService.getAllQueuesMetrics();
  }

  @Get('requests')
  async getRequestMetrics() {
    return this.requestMetricsService.getStats();
  }

  @Get('requests/history')
  async getRequestHistory(@Query() query: HistoryQueryDto) {
    return this.requestMetricsService.getHistory(query);
  }
}
