export class RequestStatsDto {
  totalRequests: number;
  activeConnections: number;
  avgResponseTimeMs: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  uptime: number;
}

export class RequestHistoryDataPointDto {
  timestamp: number;
  requestsPerSec: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
}

export class RequestHistoryDto {
  range: string;
  dataPoints: RequestHistoryDataPointDto[];
}
