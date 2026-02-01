<script lang="ts">
  import type { RefreshInterval, HistoryRange } from '$lib/types/system-metrics';

  interface Props {
    refreshInterval: RefreshInterval;
    historyRange: HistoryRange;
    onRefreshChange: (interval: RefreshInterval) => void;
    onRangeChange: (range: HistoryRange) => void;
  }

  let { refreshInterval, historyRange, onRefreshChange, onRangeChange }: Props = $props();

  const refreshOptions: { value: RefreshInterval; label: string }[] = [
    { value: 5, label: '5 giây' },
    { value: 10, label: '10 giây' },
    { value: 15, label: '15 giây' },
    { value: 30, label: '30 giây' },
    { value: 60, label: '1 phút' },
  ];

  const rangeOptions: { value: HistoryRange; label: string }[] = [
    { value: '1h', label: '1 giờ' },
    { value: '6h', label: '6 giờ' },
    { value: '24h', label: '24 giờ' },
    { value: '7d', label: '7 ngày' },
    { value: '14d', label: '14 ngày' },
  ];

  function handleRefreshChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onRefreshChange(parseInt(target.value) as RefreshInterval);
  }

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onRangeChange(target.value as HistoryRange);
  }
</script>

<div class="flex flex-wrap gap-4 items-center">
  <div class="flex items-center gap-2">
    <label class="text-sm font-medium" for="refresh-select">Auto refresh:</label>
    <select
      id="refresh-select"
      class="select select-sm w-28"
      value={refreshInterval}
      onchange={handleRefreshChange}
    >
      {#each refreshOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <div class="flex items-center gap-2">
    <label class="text-sm font-medium" for="range-select">Lịch sử:</label>
    <select
      id="range-select"
      class="select select-sm w-28"
      value={historyRange}
      onchange={handleRangeChange}
    >
      {#each rangeOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>
</div>
