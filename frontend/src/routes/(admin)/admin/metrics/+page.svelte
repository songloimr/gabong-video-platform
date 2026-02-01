<script lang="ts">
  import { Cpu, MemoryStick, HardDrive, Clock, Activity, Server } from '@lucide/svelte';
  import {
    useCurrentMetrics,
    useMetricsHistory,
    useQueueMetrics,
    useRequestStats,
  } from '$lib/api/queries/system-metrics';
  import type { RefreshInterval, HistoryRange, MetricTab } from '$lib/types/system-metrics';
  import {
    MetricCard,
    MetricsToolbar,
    QueueStatusCard,
    RequestStatsCard,
    HistoryLineChart,
    MemoryDoughnutChart,
  } from '$lib/components/admin/metrics';

  let refreshInterval = $state<RefreshInterval>(5);
  let historyRange = $state<HistoryRange>('1h');
  let activeTab = $state<MetricTab>('cpu');

  const currentMetrics = useCurrentMetrics(() => refreshInterval * 1000);
  const history = useMetricsHistory(() => historyRange);
  const queueMetrics = useQueueMetrics(() => refreshInterval * 1000);
  const requestStats = useRequestStats(() => refreshInterval * 1000);

  function formatBytes(bytes: number): string {
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(0)} MB`;
  }

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${seconds % 60}s`;
  }

  const tabs: { id: MetricTab; label: string; color: string }[] = [
    { id: 'cpu', label: 'CPU', color: 'bg-error-500' },
    { id: 'memory', label: 'Memory', color: 'bg-primary-500' },
    { id: 'storage', label: 'Storage', color: 'bg-success-500' },
    { id: 'process', label: 'Process', color: 'bg-violet-500' },
  ];

  function getColorForCpu(usage: number): 'success' | 'warning' | 'error' {
    if (usage > 80) return 'error';
    if (usage > 60) return 'warning';
    return 'success';
  }

  function getColorForMemory(usage: number): 'primary' | 'error' {
    if (usage > 80) return 'error';
    return 'primary';
  }

  function getColorForStorage(usage: number): 'success' | 'error' {
    if (usage > 80) return 'error';
    return 'success';
  }
</script>

<svelte:head>
  <title>System Metrics | Admin</title>
</svelte:head>

<div class="container mx-auto p-4 space-y-6">
  <!-- Header -->
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-bold flex items-center gap-2">
      <Server class="w-7 h-7" />
      System Metrics
    </h1>
    <MetricsToolbar
      {refreshInterval}
      {historyRange}
      onRefreshChange={(v) => (refreshInterval = v)}
      onRangeChange={(v) => (historyRange = v)}
    />
  </div>

  {#if currentMetrics.isLoading}
    <!-- Loading skeleton -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each Array(6) as _}
        <div class="card p-4 variant-soft animate-pulse">
          <div class="h-16 bg-surface-300 dark:bg-surface-600 rounded"></div>
        </div>
      {/each}
    </div>
  {:else if currentMetrics.data}
    {@const data = currentMetrics.data}

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        title="CPU Usage"
        value="{data.cpu.usage.toFixed(1)}%"
        subvalue="{data.cpu.cores} cores"
        icon={Cpu}
        color={getColorForCpu(data.cpu.usage)}
      />
      <MetricCard
        title="Memory"
        value={formatBytes(data.memory.used)}
        subvalue="{data.memory.usagePercent.toFixed(1)}% used"
        icon={MemoryStick}
        color={getColorForMemory(data.memory.usagePercent)}
      />
      <MetricCard
        title="Temp Storage"
        value={formatBytes(data.tempStorage.used)}
        subvalue="{data.tempStorage.usagePercent.toFixed(1)}% used"
        icon={HardDrive}
        color={getColorForStorage(data.tempStorage.usagePercent)}
      />
      <MetricCard
        title="Heap Memory"
        value={formatBytes(data.process.heapUsed)}
        subvalue="of {formatBytes(data.process.heapTotal)}"
        icon={Server}
        color="info"
      />
      <MetricCard
        title="Uptime"
        value={formatUptime(data.process.uptime)}
        icon={Clock}
        color="primary"
      />
      <MetricCard
        title="Active Conn."
        value={requestStats.data?.activeConnections ?? 0}
        subvalue="connections"
        icon={Activity}
        color="info"
      />
    </div>

    <!-- History Chart Section -->
    <div class="card p-4 variant-soft">
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        {#each tabs as tab}
          <button
            class="btn btn-sm {activeTab === tab.id ? 'variant-filled' : 'variant-ghost'}"
            onclick={() => (activeTab = tab.id)}
          >
            <span class="w-2 h-2 rounded-full {tab.color}"></span>
            {tab.label}
          </button>
        {/each}
      </div>

      {#if history.data?.dataPoints && history.data.dataPoints.length > 0}
        <HistoryLineChart dataPoints={history.data.dataPoints} {activeTab} />
      {:else if history.isLoading}
        <div class="h-64 flex items-center justify-center text-surface-500">
          <div class="animate-pulse">Loading chart data...</div>
        </div>
      {:else}
        <div class="h-64 flex items-center justify-center text-surface-500">
          No history data available yet. Data will appear after a few seconds.
        </div>
      {/if}
    </div>

    <!-- Bottom Grid: Memory Chart + Queues + Requests -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Memory Doughnut -->
      <div class="card p-4 variant-soft">
        <h3 class="font-semibold mb-2">Memory Breakdown</h3>
        <MemoryDoughnutChart memory={data.memory} process={data.process} />
      </div>

      <!-- Queue Status -->
      {#if queueMetrics.data?.queues}
        <QueueStatusCard queues={queueMetrics.data.queues} />
      {:else}
        <div class="card p-4 variant-soft animate-pulse">
          <div class="h-48 bg-surface-300 dark:bg-surface-600 rounded"></div>
        </div>
      {/if}

      <!-- Request Stats -->
      {#if requestStats.data}
        <RequestStatsCard stats={requestStats.data} />
      {:else}
        <div class="card p-4 variant-soft animate-pulse">
          <div class="h-48 bg-surface-300 dark:bg-surface-600 rounded"></div>
        </div>
      {/if}
    </div>
  {:else if currentMetrics.error}
    <div class="card p-8 variant-soft-error text-center">
      <p class="text-error-500 font-semibold">Failed to load metrics</p>
      <p class="text-sm text-surface-500 mt-2">{currentMetrics.error.message}</p>
      <button class="btn variant-filled-primary mt-4" onclick={() => currentMetrics.refetch()}>
        Retry
      </button>
    </div>
  {/if}
</div>
