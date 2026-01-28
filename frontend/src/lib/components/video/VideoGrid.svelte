<script lang="ts">
  import VideoCard from "./VideoCard.svelte";
  import type { Video } from "$lib/types";
  import { t } from "svelte-i18n";
  import { PlaySquare } from "@lucide/svelte";

  let {
    videos,
    loading = false,
    cols = 5,
  }: {
    videos: Video[];
    loading?: boolean;
    cols?: number;
  } = $props();
</script>

<div
  class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
>
  {#if loading}
    {#each Array(cols * 2) as _, i}
      <div
        class="flex flex-col gap-3 animate-pulse"
        style="animation-delay: {i * 50}ms"
      >
        <div class="aspect-video bg-surface-800 rounded-xl"></div>
        <div class="space-y-2">
          <div class="h-4 bg-surface-800 rounded-full w-3/4"></div>
          <div class="h-3 bg-surface-800 rounded-full w-1/2"></div>
        </div>
      </div>
    {/each}
  {:else if videos && videos.length > 0}
    {#each videos as video, i (video.id)}
      <div class="animate-fade-in" style="animation-delay: {i * 30}ms">
        <VideoCard {video} />
      </div>
    {/each}
  {:else}
    <div class="col-span-full py-20 text-center animate-fade-in">
      <div class="max-w-md mx-auto space-y-4">
        <div
          class="w-16 h-16 bg-surface-900 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <PlaySquare size={28} class="text-surface-400" />
        </div>
        <p class="text-lg font-black text-surface-100">
          {$t("common.noResults")}
        </p>
        <p class="text-sm font-bold text-surface-400">
          {$t("common.noResultsDescription")}
        </p>
      </div>
    </div>
  {/if}
</div>
