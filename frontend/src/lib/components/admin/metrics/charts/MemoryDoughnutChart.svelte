<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
  import type { MemoryMetrics, ProcessMetrics } from '$lib/types/system-metrics';

  interface Props {
    memory: MemoryMetrics;
    process: ProcessMetrics;
  }

  let { memory, process: processMetrics }: Props = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

  function formatBytes(bytes: number): string {
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(0)} MB`;
  }

  function createChart() {
    if (!canvas || !memory || !processMetrics) return;

    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Heap Used', 'Heap Free', 'System Used', 'System Free'],
        datasets: [
          {
            data: [
              processMetrics.heapUsed,
              processMetrics.heapTotal - processMetrics.heapUsed,
              Math.max(0, memory.used - processMetrics.rss),
              memory.free,
            ],
            backgroundColor: ['#8b5cf6', '#c4b5fd', '#3b82f6', '#bfdbfe'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatBytes(ctx.raw as number)}`,
            },
          },
        },
      },
    });
  }

  onMount(createChart);
  onDestroy(() => chart?.destroy());

  $effect(() => {
    if (chart && memory && processMetrics) {
      chart.data.datasets[0].data = [
        processMetrics.heapUsed,
        processMetrics.heapTotal - processMetrics.heapUsed,
        Math.max(0, memory.used - processMetrics.rss),
        memory.free,
      ];
      chart.update('none');
    }
  });
</script>

<div class="h-48">
  <canvas bind:this={canvas}></canvas>
</div>
