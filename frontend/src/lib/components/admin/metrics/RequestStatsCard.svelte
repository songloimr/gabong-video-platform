<script lang="ts">
  import type { RequestStats } from '$lib/types/system-metrics';
  import { Activity, Users, Clock, AlertTriangle } from '@lucide/svelte';

  interface Props {
    stats: RequestStats;
  }

  let { stats }: Props = $props();

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
</script>

<div class="card p-4 variant-soft">
  <h3 class="font-semibold mb-4 flex items-center gap-2">
    <Activity class="w-5 h-5" />
    Request Statistics
  </h3>

  <div class="grid grid-cols-2 gap-4">
    <div class="text-center">
      <Users class="w-6 h-6 mx-auto text-primary-500 mb-1" />
      <div class="text-2xl font-bold">{stats.activeConnections}</div>
      <div class="text-xs text-surface-600-300-token">Active Conn.</div>
    </div>

    <div class="text-center">
      <Clock class="w-6 h-6 mx-auto text-success-500 mb-1" />
      <div class="text-2xl font-bold">{stats.avgResponseTimeMs}ms</div>
      <div class="text-xs text-surface-600-300-token">Avg Response</div>
    </div>

    <div class="text-center">
      <AlertTriangle
        class="w-6 h-6 mx-auto mb-1 {stats.errorRate > 5 ? 'text-error-500' : 'text-warning-500'}"
      />
      <div class="text-2xl font-bold">{stats.errorRate}%</div>
      <div class="text-xs text-surface-600-300-token">Error Rate</div>
    </div>

    <div class="text-center">
      <Activity class="w-6 h-6 mx-auto text-blue-500 mb-1" />
      <div class="text-2xl font-bold">{formatUptime(stats.uptime)}</div>
      <div class="text-xs text-surface-600-300-token">Stats Uptime</div>
    </div>
  </div>
</div>
