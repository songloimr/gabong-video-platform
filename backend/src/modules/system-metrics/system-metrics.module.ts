import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SystemMetricsController } from './system-metrics.controller';
import { SystemMetricsService } from './system-metrics.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { QueueMetricsService } from './queue-metrics.service';
import { RequestMetricsService } from './request-metrics.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'video-processing' },
      { name: 'media-processing' },
    ),
  ],
  controllers: [SystemMetricsController],
  providers: [
    SystemMetricsService,
    MetricsCollectorService,
    QueueMetricsService,
    RequestMetricsService,
  ],
  exports: [RequestMetricsService],
})
export class SystemMetricsModule {}
