<script lang="ts">
  import VideoCard from "./VideoCard.svelte";
  import { Star } from "@lucide/svelte";
  import { t } from "$lib/stores/i18n";
  import type { Video } from "$lib/types";

  let { videos = [] }: { videos: Video[] } = $props();
</script>

{#if videos.length > 0}
  <section class="space-y-4">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-yellow-500/20">
        <Star size={20} class="text-yellow-400" fill="currentColor" />
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-surface-50">
          {$t("video.featured")}
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {#each videos as video (video.id)}
        <VideoCard {video} />
      {/each}
    </div>
  </section>
{/if}
