export class QueueMetricsDto {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  avgProcessingTimeMs: number;
}

export class AllQueuesMetricsDto {
  queues: QueueMetricsDto[];
}
