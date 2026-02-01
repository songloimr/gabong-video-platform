export class CpuMetricsDto {
  usage: number;
  cores: number;
  model: string;
  perCore: number[];
}

export class MemoryMetricsDto {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export class ProcessMetricsDto {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  uptime: number;
}

export class StorageMetricsDto {
  path: string;
  mount: string;
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export class SystemMetricsDto {
  timestamp: string;
  cpu: CpuMetricsDto;
  memory: MemoryMetricsDto;
  process: ProcessMetricsDto;
  tempStorage: StorageMetricsDto;
}

export class HistoryDataPointDto {
  timestamp: number;
  cpu: number;
  memory: number;
  storage: number;
  processHeap: number;
  processRss: number;
}

export class MetricsHistoryDto {
  range: string;
  type: string;
  startTime: string;
  endTime: string;
  dataPoints: HistoryDataPointDto[];
}
