<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';
  import 'chartjs-adapter-date-fns';
  import type { HistoryDataPoint, MetricTab } from '$lib/types/system-metrics';

  interface Props {
    dataPoints: HistoryDataPoint[];
    activeTab: MetricTab;
  }

  let { dataPoints, activeTab }: Props = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    Filler,
  );

  const colors: Record<MetricTab, { border: string; background: string }> = {
    cpu: { border: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
    memory: { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' },
    storage: { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
    process: { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' },
  };

  const labels: Record<MetricTab, string> = {
    cpu: 'CPU %',
    memory: 'Memory %',
    storage: 'Storage %',
    process: 'Heap (MB)',
  };

  function getDataForTab(tab: MetricTab, points: HistoryDataPoint[]) {
    return points.map((p) => {
      switch (tab) {
        case 'cpu':
          return { x: p.timestamp, y: p.cpu };
        case 'memory':
          return { x: p.timestamp, y: p.memory };
        case 'storage':
          return { x: p.timestamp, y: p.storage };
        case 'process':
          return { x: p.timestamp, y: p.processHeap / 1024 / 1024 };
      }
    });
  }

  function createChart() {
    if (!canvas || !dataPoints?.length) return;

    const color = colors[activeTab];

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [
          {
            label: labels[activeTab],
            data: getDataForTab(activeTab, dataPoints),
            borderColor: color.border,
            backgroundColor: color.background,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { tooltipFormat: 'HH:mm:ss' },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            max: activeTab === 'process' ? undefined : 100,
            grid: { color: 'rgba(128, 128, 128, 0.1)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    });
  }

  function updateChart() {
    if (!chart || !dataPoints?.length) return;

    const color = colors[activeTab];

    chart.data.datasets[0].data = getDataForTab(activeTab, dataPoints);
    chart.data.datasets[0].label = labels[activeTab];
    chart.data.datasets[0].borderColor = color.border;
    chart.data.datasets[0].backgroundColor = color.background;

    if (chart.options.scales?.y) {
      chart.options.scales.y.max = activeTab === 'process' ? undefined : 100;
    }

    chart.update('none');
  }

  onMount(() => {
    createChart();
  });

  onDestroy(() => {
    chart?.destroy();
  });

  $effect(() => {
    if (dataPoints && activeTab) {
      if (chart) {
        updateChart();
      } else {
        createChart();
      }
    }
  });
</script>

<div class="h-64">
  <canvas bind:this={canvas}></canvas>
</div>
