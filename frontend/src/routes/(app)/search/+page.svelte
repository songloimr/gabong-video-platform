<script lang="ts">
  import { page } from "$app/state";
  import { t } from "svelte-i18n";
  import VideoCard from "$lib/components/video/VideoCard.svelte";
  import { Search, SlidersHorizontal } from "@lucide/svelte";
  import type { PageData } from "./$types";

  let { data: pageData }: { data: PageData } = $props();

  const { videos: videosData } = pageData;

  const searchQuery = pageData.searchQuery || "";
  const totalResults = videosData?.pagination?.total ?? 0;
  const pageTitle = searchQuery
    ? `${$t("common.search")}: "${searchQuery}" - Gabong`
    : `${$t("common.search")} - Gabong`;
  const pageDescription = searchQuery
    ? `Tìm thấy ${totalResults} kết quả cho "${searchQuery}" trên Gabong. Xem video, phim và nội dung liên quan.`
    : "Tìm kiếm video, phim và nội dung trên Gabong.";

  const nextPageParams = new URLSearchParams();
  nextPageParams.set("q", searchQuery);
  nextPageParams.set("page", `${videosData!.pagination!.page + 1}`);
  nextPageParams.set("sort", pageData.sort || "");
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow" />
  {#if searchQuery}
    <link
      rel="canonical"
      href={`https://gabong.net/search?q=${encodeURIComponent(searchQuery)}`}
    />
  {/if}
</svelte:head>

<div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
  <div
    class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
  >
    <div class="space-y-1">
      <div
        class="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest"
      >
        <Search size={12} strokeWidth={3} />
        <span>Search Results</span>
      </div>
      <h1
        class="text-3xl sm:text-4xl font-black tracking-tighter text-surface-100 uppercase"
      >
        "{searchQuery}"
        {#if totalResults > 0}
          <span class="text-surface-500 text-lg ml-2">({totalResults})</span>
        {/if}
      </h1>
    </div>

    <button
      class="flex items-center gap-2 px-4 py-2 bg-surface-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface-700 transition-all"
    >
      <SlidersHorizontal size={14} />
      <span>Filters</span>
    </button>
  </div>

  {#if pageData.error}
    <div class="py-12">
      <div class="text-center">
        <p class="text-lg font-black text-red-500">{pageData.error}</p>
        <a
          href={page.url.href}
          class="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm"
        >
          {$t("common.retry")}
        </a>
      </div>
    </div>
  {:else if videosData?.data && videosData.data.length > 0}
    <div
      class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
    >
      {#each videosData.data as video (video.id)}
        <VideoCard {video} showStats={true} />
      {/each}
    </div>

    {#if videosData.pagination?.has_next}
      <div class="flex justify-center mt-10">
        <a
          href={`?${nextPageParams.toString()}`}
          class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all active:scale-95 shadow-md shadow-primary-600/20"
        >
          {$t("comment.loadMore")}
        </a>
      </div>
    {/if}
  {:else}
    <div class="text-center py-20 animate-fade-in">
      <div class="max-w-md mx-auto space-y-4">
        <p class="text-lg font-black text-surface-100">
          {$t("common.noResults")}
        </p>
      </div>
    </div>
  {/if}
</div>
