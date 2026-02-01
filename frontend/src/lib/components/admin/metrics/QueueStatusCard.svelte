<script lang="ts">
  import type { QueueMetrics } from '$lib/types/system-metrics';
  import { Layers, Clock, CheckCircle, XCircle, Pause, Timer } from '@lucide/svelte';

  interface Props {
    queues: QueueMetrics[];
  }

  let { queues }: Props = $props();

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
</script>

<div class="card p-4 variant-soft">
  <h3 class="font-semibold mb-4 flex items-center gap-2">
    <Layers class="w-5 h-5" />
    Job Queues
  </h3>

  <div class="space-y-4">
    {#each queues as queue}
      <div class="border-b border-surface-300 dark:border-surface-600 pb-3 last:border-0 last:pb-0">
        <div class="font-medium text-sm mb-2 capitalize">{queue.name.replace('-', ' ')}</div>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div class="flex items-center gap-1">
            <Clock class="w-3.5 h-3.5 text-warning-500" />
            <span class="text-surface-600-300-token">Wait:</span>
            <span class="font-semibold">{queue.waiting}</span>
          </div>
          <div class="flex items-center gap-1">
            <Timer class="w-3.5 h-3.5 text-primary-500" />
            <span class="text-surface-600-300-token">Active:</span>
            <span class="font-semibold">{queue.active}</span>
          </div>
          <div class="flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5 text-success-500" />
            <span class="text-surface-600-300-token">Done:</span>
            <span class="font-semibold">{queue.completed.toLocaleString()}</span>
          </div>
          <div class="flex items-center gap-1">
            <XCircle class="w-3.5 h-3.5 text-error-500" />
            <span class="text-surface-600-300-token">Failed:</span>
            <span class="font-semibold">{queue.failed}</span>
          </div>
          <div class="flex items-center gap-1">
            <Pause class="w-3.5 h-3.5 text-surface-500" />
            <span class="text-surface-600-300-token">Delay:</span>
            <span class="font-semibold">{queue.delayed}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-surface-600-300-token">Avg:</span>
            <span class="font-semibold">{formatDuration(queue.avgProcessingTimeMs)}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
