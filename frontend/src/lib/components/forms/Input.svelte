<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label?: string;
    error?: string;
    value?: string | number | null;
  }

  let {
    label,
    error,
    value = $bindable(),
    class: className,
    ...rest
  }: Props = $props();
</script>

<div class="space-y-1.5 w-full">
  {#if label}
    <label
      for={rest.id}
      class="block text-[10px] font-black uppercase tracking-widest text-surface-400 px-1"
    >
      {label}
    </label>
  {/if}

  <div class="relative group">
    <input
      bind:value
      {...rest}
      class="w-full px-3 py-2 bg-surface-950 border {error
        ? 'border-red-500'
        : 'border-surface-800'} rounded-lg text-sm text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-950 transition-all {className}"
    />
  </div>

  {#if error}
    <p class="text-[10px] font-bold text-red-500 px-1 animate-fade-in">
      {error}
    </p>
  {/if}
</div>
