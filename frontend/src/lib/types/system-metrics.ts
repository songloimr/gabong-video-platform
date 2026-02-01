export interface CpuMetrics {
  usage: number;
  cores: number;
  model: string;
  perCore: number[];
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface ProcessMetrics {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  uptime: number;
}

export interface StorageMetrics {
  path: string;
  mount: string;
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  process: ProcessMetrics;
  tempStorage: StorageMetrics;
}

export interface QueueMetrics {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  avgProcessingTimeMs: number;
}

export interface RequestStats {
  totalRequests: number;
  activeConnections: number;
  avgResponseTimeMs: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  uptime: number;
}

export interface HistoryDataPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  storage: number;
  processHeap: number;
  processRss: number;
}

export interface RequestHistoryDataPoint {
  timestamp: number;
  requestsPerSec: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface MetricsHistory {
  range: string;
  type: string;
  startTime: string;
  endTime: string;
  dataPoints: HistoryDataPoint[];
}

export interface RequestHistory {
  range: string;
  dataPoints: RequestHistoryDataPoint[];
}

export type RefreshInterval = 5 | 10 | 15 | 30 | 60;
export type HistoryRange = '1h' | '6h' | '24h' | '7d' | '14d';
export type MetricTab = 'cpu' | 'memory' | 'storage' | 'process';
