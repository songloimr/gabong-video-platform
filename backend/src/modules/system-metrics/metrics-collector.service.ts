import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SystemMetricsService } from './system-metrics.service';
import { HistoryDataPointDto } from './dto';

@Injectable()
export class MetricsCollectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private redis: Redis;
  private collectInterval: NodeJS.Timeout;

  private readonly HISTORY_KEY = 'metrics:history';
  private readonly RETENTION_DAYS = 14;
  private readonly COLLECT_INTERVAL_MS = 15000; // 15 seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly systemMetricsService: SystemMetricsService,
  ) {}

  onModuleInit() {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });

    this.startCollecting();
    this.logger.log('Metrics collector initialized - collecting every 15s');
  }

  onModuleDestroy() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
    }
    this.redis?.disconnect();
  }

  private startCollecting() {
    // Collect immediately on start
    this.collectAndStore();

    this.collectInterval = setInterval(async () => {
      await this.collectAndStore();
    }, this.COLLECT_INTERVAL_MS);
  }

  private async collectAndStore() {
    try {
      const metrics = await this.systemMetricsService.getCurrentMetrics();
      const timestamp = Date.now();

      const dataPoint: HistoryDataPointDto = {
        timestamp,
        cpu: metrics.cpu.usage,
        memory: metrics.memory.usagePercent,
        storage: metrics.tempStorage.usagePercent,
        processHeap: metrics.process.heapUsed,
        processRss: metrics.process.rss,
      };

      await this.redis.zadd(
        this.HISTORY_KEY,
        timestamp,
        JSON.stringify(dataPoint),
      );

      // Cleanup old data (older than 14 days)
      const cutoffTime = timestamp - this.RETENTION_DAYS * 24 * 60 * 60 * 1000;
      await this.redis.zremrangebyscore(this.HISTORY_KEY, 0, cutoffTime);
    } catch (error) {
      this.logger.error('Failed to collect metrics', error);
    }
  }

  async getHistoryData(
    startTime: number,
    endTime: number,
  ): Promise<HistoryDataPointDto[]> {
    const results = await this.redis.zrangebyscore(
      this.HISTORY_KEY,
      startTime,
      endTime,
    );
    return results.map((r) => JSON.parse(r));
  }

  async getDownsampledHistory(
    startTime: number,
    endTime: number,
    maxPoints: number = 200,
  ): Promise<HistoryDataPointDto[]> {
    const allData = await this.getHistoryData(startTime, endTime);

    if (allData.length <= maxPoints) {
      return allData;
    }

    // Downsample by averaging
    const step = Math.ceil(allData.length / maxPoints);
    const downsampled: HistoryDataPointDto[] = [];

    for (let i = 0; i < allData.length; i += step) {
      const chunk = allData.slice(i, i + step);
      const avg: HistoryDataPointDto = {
        timestamp: chunk[Math.floor(chunk.length / 2)].timestamp,
        cpu: this.average(chunk.map((c) => c.cpu)),
        memory: this.average(chunk.map((c) => c.memory)),
        storage: this.average(chunk.map((c) => c.storage)),
        processHeap: Math.round(
          this.average(chunk.map((c) => c.processHeap)),
        ),
        processRss: Math.round(this.average(chunk.map((c) => c.processRss))),
      };
      downsampled.push(avg);
    }

    return downsampled;
  }

  private average(arr: number[]): number {
    return (
      Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100
    );
  }
}
