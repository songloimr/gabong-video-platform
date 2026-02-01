import { Injectable, Logger } from '@nestjs/common';
import * as si from 'systeminformation';
import * as path from 'path';
import { SystemMetricsDto } from './dto';

@Injectable()
export class SystemMetricsService {
  private readonly logger = new Logger(SystemMetricsService.name);
  private readonly tempStoragePath = path.join(process.cwd(), 'uploads');
  private cpuModel: string | null = null;

  async getCurrentMetrics(): Promise<SystemMetricsDto> {
    const [cpu, mem, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
    ]);

    // Cache CPU model to avoid repeated calls
    if (!this.cpuModel) {
      const cpuInfo = await si.cpu();
      this.cpuModel = cpuInfo.brand;
    }

    // Find disk containing temp storage path
    const tempDisk =
      fsSize.find((fs) => this.tempStoragePath.startsWith(fs.mount)) ||
      fsSize[0];

    const processMemory = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: Math.round(cpu.currentLoad * 100) / 100,
        cores: cpu.cpus.length,
        model: this.cpuModel,
        perCore: cpu.cpus.map((c) => Math.round(c.load * 100) / 100),
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: Math.round((mem.used / mem.total) * 10000) / 100,
      },
      process: {
        heapUsed: processMemory.heapUsed,
        heapTotal: processMemory.heapTotal,
        rss: processMemory.rss,
        external: processMemory.external,
        uptime: Math.floor(process.uptime()),
      },
      tempStorage: {
        path: this.tempStoragePath,
        mount: tempDisk.mount,
        total: tempDisk.size,
        used: tempDisk.used,
        free: tempDisk.available,
        usagePercent: Math.round(tempDisk.use * 100) / 100,
      },
    };
  }

  parseRange(range: string): number {
    const units: Record<string, number> = { h: 3600000, d: 86400000 };
    const match = range.match(/^(\d+)(h|d)$/);
    if (!match) return 3600000; // default 1h
    return parseInt(match[1]) * units[match[2]];
  }
}
