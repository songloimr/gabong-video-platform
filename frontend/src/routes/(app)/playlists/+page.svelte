<script lang="ts">
    import { t } from "svelte-i18n";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import QueryError from "$lib/components/ui/QueryError.svelte";
    import AppPagination from "$lib/components/ui/AppPagination.svelte";
    import { Library } from "@lucide/svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    function handlePageChange(newPage: number) {
      const params = new URLSearchParams($page.url.searchParams);
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      goto(`?${params.toString()}`);
    }
</script>

<svelte:head>
  <title>{$t("common.playlists")} - Gabong</title>
  <meta
    name="description"
    content="Browse curated video playlists on Gabong."
  />
  {#if data.playlists?.pagination}
    {#if data.playlists.pagination.page > 1}
      <link rel="prev" href="?page={data.playlists.pagination.page - 1}" />
    {/if}
    {#if data.playlists.pagination.has_next}
      <link rel="next" href="?page={data.playlists.pagination.page + 1}" />
    {/if}
  {/if}
</svelte:head>

<div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
  <div class="flex flex-col gap-6 sm:gap-8 mb-8 sm:mb-10">
    <div class="space-y-3">
      <div
        class="flex items-center gap-2 text-primary-400 font-display font-semibold text-xs uppercase tracking-wider"
      >
        <Library size={14} strokeWidth={2.5} />
        <span>Collections</span>
      </div>
      <h1
        class="text-3xl sm:text-5xl font-display font-black tracking-tighter text-surface-100"
      >
        {$t("common.playlists")}
      </h1>
      {#if data.playlists?.pagination}
        <div class="flex items-center gap-4 flex-wrap">
          <p
            class="text-sm text-surface-400 font-display font-medium"
          >
            <span class="text-surface-200 font-semibold">{data.playlists.pagination.total}</span> playlists
          </p>
          <div class="w-1 h-1 rounded-full bg-surface-700"></div>
          <p class="text-sm text-surface-400 font-display font-medium">
            Page <span class="text-surface-200 font-semibold">{data.playlists.pagination.page}</span> of {data.playlists.pagination.total_pages}
          </p>
        </div>
      {/if}
    </div>
  </div>

  {#if data.error}
    <div class="py-12">
      <QueryError
        error={new Error(data.error)}
        reset={() => goto($page.url.pathname)}
      />
    </div>
  {:else if data.playlists && data.playlists.data.length > 0}
    <div
      class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
    >
      {#each data.playlists.data as playlist (playlist.id)}
        <a
          href={`/playlists/${playlist.slug}`}
          class="group relative flex flex-col bg-surface-900/80 rounded-lg overflow-hidden border border-surface-800/50 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
        >
          <div class="aspect-video bg-surface-800 relative overflow-hidden">
            {#if playlist.thumbnail_url}
              <img
                src={playlist.thumbnail_url}
                alt={playlist.title}
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            {:else}
              <div
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-600/20"
              >
                <Library size={40} strokeWidth={1.5} class="text-primary-500/40" />
              </div>
            {/if}

            <div
              class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
            ></div>

            <!-- Video count badge -->
            <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded flex items-center gap-1.5">
              <Library size={12} strokeWidth={2} class="text-primary-400" />
              <span class="text-xs font-display font-semibold text-white">{playlist.video_count}</span>
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3
                class="text-white text-sm font-display font-bold tracking-tight mb-1"
              >
                {playlist.title}
              </h3>
              {#if playlist.description}
                <p class="text-white/70 text-xs font-body line-clamp-1">
                  {playlist.description}
                </p>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>

    <!-- SSR Pagination -->
    {#if data.playlists.pagination}
      <AppPagination
        count={data.playlists.pagination.total}
        pageSize={data.playlists.pagination.limit}
        page={data.playlists.pagination.page}
        onPageChange={handlePageChange}
      />
    {/if}
  {:else}
    <div class="text-center py-20 animate-fade-in">
      <div class="max-w-md mx-auto space-y-4">
        <div
          class="w-20 h-20 bg-surface-800/50 rounded-lg flex items-center justify-center mx-auto"
        >
          <Library size={32} strokeWidth={1.5} class="text-surface-500" />
        </div>
        <p class="text-xl font-display font-bold text-surface-100">
          {$t("common.noResults")}
        </p>
        <p class="text-sm font-body text-surface-400">
          No playlists available yet.
        </p>
      </div>
    </div>
  {/if}
</div>
