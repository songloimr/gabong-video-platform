<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { Play, ThumbsUp, Pin } from "@lucide/svelte";
  import moment from "moment";
  import type { Video } from "$lib/types";
  import { PUBLIC_CDN_URL } from "$env/static/public";

  let { video, showStats = true }: { video: Video; showStats?: boolean } =
    $props();

  let displayDate = $state("");
  let isHovering = $state(false);
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  function getPreviewGifUrl() {
    return `${PUBLIC_CDN_URL}/${video.video_key}/preview.gif`;
  }

  function handleMouseEnter() {
    hoverTimeout = setTimeout(() => {
      isHovering = true;
    }, 200);
  }

  function handleMouseLeave() {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    isHovering = false;
  }

  $effect(() => {
    if (!video.published_at) return;
    const date = moment(video.published_at);
    const now = moment();
    const yearsDiff = now.diff(date, "years");

    if (yearsDiff < 3) {
      displayDate = date.fromNow();
    } else {
      displayDate = date.format("DD/MM/YYYY");
    }
  });

  function getThumbnailUrl() {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }

    return `${PUBLIC_CDN_URL}/${video.video_key}/thumbnail.jpg`;
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }
</script>

<a
  href={`/videos/${video.slug}`}
  class="group relative flex flex-col w-full bg-transparent transition-all duration-500 animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 rounded-lg"
  aria-label={$t("video.watch", { values: { title: video.title } })}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative aspect-video overflow-hidden bg-surface-800 rounded-md border border-surface-800/50 group-hover:border-primary-500/50 transition-colors"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    ontouchstart={handleMouseEnter}
    ontouchend={handleMouseLeave}
  >
    {#if video.thumbnail_url || video.video_key}
      <img
        src={getThumbnailUrl()}
        alt={video.title}
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      {#if isHovering && video.video_key}
        <img
          src={getPreviewGifUrl()}
          alt={video.title}
          class="absolute inset-0 w-full h-full object-cover z-10 animate-fade-in"
        />
      {/if}
      <div
        class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"
      ></div>
    {:else}
      <div
        class="flex items-center justify-center w-full h-full bg-linear-to-br from-surface-800 to-surface-900"
      >
        <Play
          class="text-surface-400 group-hover:text-primary-500 group-hover:scale-110 transition-all duration-300 w-12 h-12"
          strokeWidth={1.5}
        />
      </div>
    {/if}

    {#if video.duration}
      <div
        class="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md border border-white/10"
      >
        {formatDuration(video.duration)}
      </div>
    {/if}

    {#if video.is_pinned}
      <div
        class="absolute top-2 left-2 bg-yellow-500/90 text-yellow-950 p-1.5 rounded-md z-20"
        title={$t("video.featured")}
      >
        <Pin size={12} strokeWidth={2.5} />
      </div>
    {/if}
  </div>

  <div class="py-2 flex flex-col flex-1 gap-1">
    <div class="flex-1 space-y-1.5">
      {#if showStats}
        <div
          class="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] text-surface-500 font-bold uppercase tracking-widest"
        >
          <div
            class="flex items-center gap-1.5 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <ThumbsUp size={12} strokeWidth={2.5} />
            <span>{video.likes_count}</span>
          </div>

          {#if displayDate}
            <div class="flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-surface-700"></span>
              <time
                datetime={video.published_at}
                class="hover:text-surface-100 transition-colors"
              >
                {displayDate}
              </time>
            </div>
          {/if}
        </div>
      {/if}
      <h3
        class="text-sm font-black text-surface-50 line-clamp-2 leading-[1.3] group-hover:text-primary-400 transition-colors duration-200 font-heading tracking-tight"
      >
        {video.title}
      </h3>
    </div>
  </div>
</a>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
