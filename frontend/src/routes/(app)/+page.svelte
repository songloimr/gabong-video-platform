<script lang="ts">
  import VideoGrid from "$lib/components/video/VideoGrid.svelte";
  import FeaturedVideos from "$lib/components/video/FeaturedVideos.svelte";
  import QueryError from "$lib/components/ui/QueryError.svelte";
  import AppPagination from "$lib/components/ui/AppPagination.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { t } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Filter, Clock, Calendar, FolderOpen, Rss, LayoutGrid } from "@lucide/svelte";
  import type { PageData } from "./$types";
  import { generateWebsiteJsonLd } from "$lib/utils/seo";

  let { data }: { data: PageData } = $props();

  const currentDuration = $derived(
    $page.url.searchParams.get("duration") || "all",
  );
  const currentYear = $derived($page.url.searchParams.get("year") || "all");
  const currentCategory = $derived(
    $page.url.searchParams.get("category") || "all",
  );

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams($page.url.searchParams);

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    params.delete("page");

    goto(`?${params.toString()}`, { replaceState: true });
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams($page.url.searchParams);
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    goto(`?${params.toString()}`);
  }

  const pagination = $derived.by(() => {
    if (!data.videos?.pagination) return undefined;
    const p = data.videos.pagination;
    return {
      prev: p.page > 1 ? `?page=${p.page - 1}` : undefined,
      next: p.has_next ? `?page=${p.page + 1}` : undefined,
    };
  });
</script>

<Seo
  title={$t("common.home")}
  canonical="/"
  jsonLd={generateWebsiteJsonLd()}
  {pagination}
/>

<div
  class="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-500"
>
  <div class="flex flex-col gap-6 sm:gap-10 mb-8 sm:mb-12">
    <div>
      <h1
        class="text-3xl sm:text-5xl font-black tracking-tighter text-surface-50 uppercase"
      >
        {$t("common.home")}
      </h1>
    </div>

    <!-- Filter Bar - Redesigned -->
    <div class="flex flex-col gap-4">
      <div
        class="flex items-center gap-2 text-surface-400 text-xs font-display font-semibold uppercase tracking-wider"
      >
        <Filter size={14} strokeWidth={2.5} />
        <span>{$t("common.filters")}</span>
      </div>

      <div class="relative">
        <!-- Scroll indicators -->
        <div
          class="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-surface-950 to-transparent pointer-events-none z-10 md:hidden"
        ></div>
        <div
          class="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-surface-950 to-transparent pointer-events-none z-10 md:hidden"
        ></div>

        <div
          class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-nowrap"
        >

          <!-- Year Filter -->
          <div class="relative shrink-0">
            <div
              class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10"
            >
              <Calendar size={16} strokeWidth={2} />
            </div>
            <select
              value={currentYear}
              onchange={(e) => updateFilters("year", e.currentTarget.value)}
              class="appearance-none bg-surface-900/80 border border-surface-800/50 pl-10 pr-10 py-2.5 rounded text-xs font-display font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-900 text-surface-300 hover:text-surface-100 hover:border-surface-700 transition-all cursor-pointer min-h-10"
            >
              <option value="all">{$t("common.anyYear")}</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                class="opacity-60"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="relative shrink-0">
            <div
              class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10"
            >
              <FolderOpen size={16} strokeWidth={2} />
            </div>
            <select
              value={currentCategory}
              onchange={(e) => updateFilters("category", e.currentTarget.value)}
              class="appearance-none bg-surface-900/80 border border-surface-800/50 pl-10 pr-10 py-2.5 rounded text-xs font-display font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-900 text-surface-300 hover:text-surface-100 hover:border-surface-700 transition-all cursor-pointer min-h-10 max-w-50"
            >
              <option value="all">{$t("common.allCategories")}</option>
              {#each data.categories as cat}
                <option value={cat.slug}>{cat.name}</option>
              {/each}
            </select>
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                class="opacity-60"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if data.error}
    <div class="mt-8">
      <QueryError
        error={new Error($t(data.error))}
        reset={() => goto($page.url.pathname)}
      />
    </div>
  {:else if data.videos}
    <div class="space-y-6 lg:space-y-8 animate-fade-in">
      <!-- Featured Videos Section -->
      <FeaturedVideos videos={data.featuredVideos} />

      <!-- Hero Section -->
      <header class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-yellow-500/20">
          <LayoutGrid size={20} class="text-green-400" fill="currentColor" />
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black tracking-tight text-surface-50">
            {$t("common.latestVideos")}
          </h2>
        </div>
      </header>

      <VideoGrid videos={data.videos.data} />

      <!-- SSR Pagination -->
      {#if data.videos.pagination}
        <AppPagination
          count={data.videos.pagination.total}
          pageSize={data.videos.pagination.limit}
          page={data.videos.pagination.page}
          onPageChange={handlePageChange}
        />
      {/if}
    </div>
  {/if}
</div>
