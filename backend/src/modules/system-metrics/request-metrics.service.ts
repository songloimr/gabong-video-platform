import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SystemMetricsService } from './system-metrics.service';
import {
  RequestStatsDto,
  RequestHistoryDto,
  RequestHistoryDataPointDto,
} from './dto';
import { HistoryQueryDto } from './dto';

@Injectable()
export class RequestMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RequestMetricsService.name);
  private redis: Redis;
  private aggregateInterval: NodeJS.Timeout;

  private stats = {
    totalRequests: 0,
    totalErrors: 0,
    activeConnections: 0,
    responseTimes: [] as number[],
    statusCodes: {} as Record<string, number>,
    lastReset: Date.now(),
  };

  private readonly HISTORY_KEY = 'metrics:requests:history';
  private readonly RETENTION_DAYS = 14;
  private readonly AGGREGATE_INTERVAL_MS = 15000; // 15s

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

    this.aggregateInterval = setInterval(
      () => this.aggregateAndStore(),
      this.AGGREGATE_INTERVAL_MS,
    );
    this.logger.log('Request metrics service initialized');
  }

  onModuleDestroy() {
    if (this.aggregateInterval) {
      clearInterval(this.aggregateInterval);
    }
    this.redis?.disconnect();
  }

  recordRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.stats.totalRequests++;
    this.stats.responseTimes.push(duration);
    this.stats.statusCodes[statusCode] =
      (this.stats.statusCodes[statusCode] || 0) + 1;

    if (statusCode >= 400) {
      this.stats.totalErrors++;
    }

    // Keep only last 1000 response times for memory
    if (this.stats.responseTimes.length > 1000) {
      this.stats.responseTimes = this.stats.responseTimes.slice(-500);
    }
  }

  incrementActiveConnections() {
    this.stats.activeConnections++;
  }

  decrementActiveConnections() {
    this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
  }

  getStats(): RequestStatsDto {
    const avgResponseTime =
      this.stats.responseTimes.length > 0
        ? Math.round(
            this.stats.responseTimes.reduce((a, b) => a + b, 0) /
              this.stats.responseTimes.length,
          )
        : 0;

    const errorRate =
      this.stats.totalRequests > 0
        ? Math.round(
            (this.stats.totalErrors / this.stats.totalRequests) * 10000,
          ) / 100
        : 0;

    return {
      totalRequests: this.stats.totalRequests,
      activeConnections: this.stats.activeConnections,
      avgResponseTimeMs: avgResponseTime,
      errorRate,
      statusCodes: { ...this.stats.statusCodes },
      uptime: Math.floor((Date.now() - this.stats.lastReset) / 1000),
    };
  }

  private async aggregateAndStore() {
    const stats = this.getStats();
    const timestamp = Date.now();

    const dataPoint: RequestHistoryDataPointDto = {
      timestamp,
      requestsPerSec:
        this.stats.totalRequests / (this.AGGREGATE_INTERVAL_MS / 1000),
      avgResponseTime: stats.avgResponseTimeMs,
      errorRate: stats.errorRate,
      activeConnections: stats.activeConnections,
    };

    try {
      await this.redis.zadd(
        this.HISTORY_KEY,
        timestamp,
        JSON.stringify(dataPoint),
      );

      // Cleanup old data
      const cutoffTime =
        timestamp - this.RETENTION_DAYS * 24 * 60 * 60 * 1000;
      await this.redis.zremrangebyscore(this.HISTORY_KEY, 0, cutoffTime);

      // Reset counters for next interval
      this.stats.totalRequests = 0;
      this.stats.totalErrors = 0;
      this.stats.responseTimes = [];
      this.stats.statusCodes = {};
    } catch (error) {
      this.logger.error('Failed to store request metrics', error);
    }
  }

  async getHistory(query: HistoryQueryDto): Promise<RequestHistoryDto> {
    const range = query.range || '1h';
    const now = Date.now();
    const rangeMs = this.systemMetricsService.parseRange(range);
    const startTime = now - rangeMs;

    const results = await this.redis.zrangebyscore(
      this.HISTORY_KEY,
      startTime,
      now,
    );

    return {
      range,
      dataPoints: results.map((r) => JSON.parse(r)),
    };
  }
}
