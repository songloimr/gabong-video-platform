<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    title: string;
    value: string | number;
    subvalue?: string;
    icon: Component;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  }

  let { title, value, subvalue, icon: Icon, color = 'primary' }: Props = $props();

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-500',
    success: 'bg-success-500/10 text-success-500',
    warning: 'bg-warning-500/10 text-warning-500',
    error: 'bg-error-500/10 text-error-500',
    info: 'bg-blue-500/10 text-blue-500',
  };
</script>

<div class="card p-4 variant-soft">
  <div class="flex items-center gap-3">
    <div class="p-2 rounded-lg {colorClasses[color]}">
      <Icon class="w-5 h-5" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm text-surface-600-300-token truncate">{title}</p>
      <p class="text-xl font-bold">{value}</p>
      {#if subvalue}
        <p class="text-xs text-surface-500">{subvalue}</p>
      {/if}
    </div>
  </div>
</div>
