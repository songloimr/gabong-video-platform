<script lang="ts">
  import { t } from "svelte-i18n";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api/client";
  import VideoGrid from "$lib/components/video/VideoGrid.svelte";
  import type { Video } from "$lib/types";
  import AuthGuard from "$lib/components/auth/AuthGuard.svelte";

  const myVideos = createQuery(() => ({
    queryKey: ["my-videos"],
    queryFn: async () => {
      const { data } = await api.get("/videos/me");
      return data;
    },
  }));
</script>

<AuthGuard>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-surface-100">
        {$t("video.myVideos")}
      </h1>
      <a
        href="/videos/upload"
        class="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
      >
        {$t("video.upload")}
      </a>
    </div>

    {#if myVideos.isLoading}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {#each Array(8) as _}
          <div class="animate-pulse">
            <div class="aspect-video bg-surface-700 rounded-lg mb-4"></div>
            <div class="h-4 bg-surface-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-surface-700 rounded w-1/2"></div>
          </div>
        {/each}
      </div>
    {:else if !myVideos.data || myVideos.data.length === 0}
      <div class="text-center py-20">
        <p class="text-surface-400 mb-4">
          {$t("video.noVideos")}
        </p>
        <a
          href="/videos/upload"
          class="inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition-colors"
        >
          {$t("video.uploadFirst")}
        </a>
      </div>
    {:else if myVideos.data}
      <VideoGrid videos={myVideos.data} />
    {/if}
  </div>
</AuthGuard>
