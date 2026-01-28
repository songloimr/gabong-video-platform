<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/client';

  export let position: 'header_top' | 'header_bottom' | 'sidebar_top' | 'content_top' | 'footer_top';
  export let className = '';

  let banner: any = null;
  let isLoaded = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
    fetchBanner(position);
  });

  $: if (mounted && position) {
    fetchBanner(position);
  }

  async function fetchBanner(pos: string) {
    try {
      const { data } = await api.get(`/banner-ads/position/${pos}`);
      if (data?.is_active && data?.content) {
        banner = data;
        isLoaded = true;
        trackImpression(banner.id);
      }
    } catch (e) {
      console.error('Failed to fetch banner:', e);
    }
  }

  async function trackImpression(bannerId: string) {
    try {
      await api.post(`/banner-ads/track-impression/${bannerId}`);
    } catch (e) {
      // Silently fail - don't break UI for tracking errors
    }
  }

  async function handleClick(linkUrl: string) {
    try {
      await api.post(`/banner-ads/track-click/${banner.id}`);
    } catch (e) {
      // Silently fail - don't break UI for tracking errors
    }
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  }
</script>

{#if isLoaded && banner}
  <div class="{className} ad-banner">
    <div
      class="w-full overflow-hidden cursor-pointer"
      on:click={() => handleClick(banner.link_url || '')}
    >
      {@html banner.content}
    </div>
  </div>
{/if}

<style>
  .ad-banner {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
