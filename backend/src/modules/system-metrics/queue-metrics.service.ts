import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueMetricsDto, AllQueuesMetricsDto } from './dto';

@Injectable()
export class QueueMetricsService {
  private readonly logger = new Logger(QueueMetricsService.name);

  constructor(
    @InjectQueue('video-processing') private videoQueue: Queue,
    @InjectQueue('media-processing') private mediaQueue: Queue,
  ) {}

  async getQueueMetrics(queue: Queue): Promise<QueueMetricsDto> {
    const [jobCounts, completedCount, failedCount] = await Promise.all([
      queue.getJobCounts(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    // Get recent job processing times
    const completedJobs = await queue.getCompleted(0, 10);
    const processingTimes = completedJobs
      .filter((job) => job.finishedOn && job.processedOn)
      .map((job) => job.finishedOn - job.processedOn);

    const avgProcessingTime =
      processingTimes.length > 0
        ? Math.round(
            processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
          )
        : 0;

    return {
      name: queue.name,
      waiting: jobCounts.waiting,
      active: jobCounts.active,
      completed: completedCount,
      failed: failedCount,
      delayed: jobCounts.delayed,
      paused: 0,
      avgProcessingTimeMs: avgProcessingTime,
    };
  }

  async getAllQueuesMetrics(): Promise<AllQueuesMetricsDto> {
    const [videoMetrics, mediaMetrics] = await Promise.all([
      this.getQueueMetrics(this.videoQueue),
      this.getQueueMetrics(this.mediaQueue),
    ]);

    return {
      queues: [videoMetrics, mediaMetrics],
    };
  }
}
