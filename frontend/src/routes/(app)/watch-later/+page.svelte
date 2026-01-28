<script lang="ts">
  import { t } from "svelte-i18n";
  import { useWatchLater } from "$lib/api/queries/watch-later";
  import VideoGrid from "$lib/components/video/VideoGrid.svelte";
  import QueryError from "$lib/components/ui/QueryError.svelte";
  import AuthGuard from "$lib/components/auth/AuthGuard.svelte";
  import type { Video } from "$lib/types";
  import { Clock } from "@lucide/svelte";

  const watchLater = useWatchLater();
</script>

<AuthGuard>
  <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
    <div class="flex flex-col gap-6 sm:gap-10 mb-8 sm:mb-12">
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest"
        >
          <Clock size={12} strokeWidth={3} />
          <span>Your Library</span>
        </div>
        <h1
          class="text-3xl sm:text-4xl font-black tracking-tighter text-surface-100 uppercase"
        >
          {$t("video.watchLater")}
        </h1>
      </div>
    </div>

    {#if watchLater.isError}
      <div class="py-8">
        <QueryError
          error={watchLater.error}
          reset={() => watchLater.refetch()}
        />
      </div>
    {:else if watchLater.isLoading}
      <div
        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
      >
        {#each Array(10) as _, i}
          <div
            class="space-y-3 animate-pulse"
            style="animation-delay: {i * 100}ms"
          >
            <div class="aspect-video bg-surface-800 rounded-lg"></div>
            <div class="space-y-2">
              <div class="h-4 bg-surface-800 rounded-lg w-3/4"></div>
              <div class="h-3 bg-surface-800 rounded-lg w-1/2"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if !watchLater.data || watchLater.data.data.length === 0}
      <div class="text-center py-20 animate-fade-in">
        <p class="text-lg font-black text-surface-100 italic">
          {$t("video.noWatchLater")}
        </p>
      </div>
    {:else}
      <VideoGrid videos={watchLater.data.data as unknown as Video[]} />
    {/if}
  </div>
</AuthGuard>
