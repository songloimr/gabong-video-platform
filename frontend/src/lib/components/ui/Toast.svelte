<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher, onMount } from 'svelte';

  export let message = '';
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let duration = 3000;

  const dispatch = createEventDispatcher();

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  let isVisible = false;

  onMount(() => {
    isVisible = true;

    if (duration > 0) {
      setTimeout(() => {
        hide();
      }, duration);
    }
  });

  function hide() {
    isVisible = false;
    setTimeout(() => {
      dispatch('close');
    }, 200);
  }
</script>

{#if isVisible}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white flex items-center gap-3 {colors[type]}"
  >
    <span class="text-xl">{icons[type]}</span>
    <span>{message}</span>
    <button
      on:click={hide}
      class="ml-2 hover:opacity-80"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
{/if}
