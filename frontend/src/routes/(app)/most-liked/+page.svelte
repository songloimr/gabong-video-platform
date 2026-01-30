<script lang="ts">
	import { t } from "$lib/stores/i18n";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import VideoGrid from "$lib/components/video/VideoGrid.svelte";
	import QueryError from "$lib/components/ui/QueryError.svelte";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import { PlaySquare, Filter } from "@lucide/svelte";
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
	<title>{$t("common.mostLiked")} - Gabong</title>
	<meta name="description" content={$t("common.mostLikedDescription")} />
	{#if data.videos?.pagination}
		{#if data.videos.pagination.page > 1}
			<link rel="prev" href="?page={data.videos.pagination.page - 1}" />
		{/if}
		{#if data.videos.pagination.has_next}
			<link rel="next" href="?page={data.videos.pagination.page + 1}" />
		{/if}
	{/if}
</svelte:head>

<div class="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
	<div
		class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12"
	>
		<div class="space-y-1">
			<h1
				class="text-3xl sm:text-4xl font-black tracking-tighter text-surface-100 uppercase"
			>
				{$t("common.mostLiked")}
			</h1>
			{#if data.videos?.pagination}
				<p
					class="text-xs text-surface-500 font-bold uppercase tracking-widest mt-2"
				>
					{$t("common.totalVideos", { values: { count: data.videos.pagination.total } })} • {$t("common.pageOf", { values: { current: data.videos.pagination.page, total: data.videos.pagination.total_pages } })}
				</p>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<button
				class="flex items-center gap-2 px-4 py-2 bg-surface-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface-700 transition-all border border-surface-700/50"
			>
				<Filter size={14} />
				<span>{$t("common.refine")}</span>
			</button>
		</div>
	</div>

	{#if data.error}
		<QueryError
			error={new Error($t(data.error))}
			reset={() => goto($page.url.pathname)}
		/>
	{:else if data.videos && data.videos.data.length > 0}
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
	{:else}
		<div class="text-center py-20 animate-fade-in">
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
					{$t("common.noVideosYet")}
				</p>
			</div>
		</div>
	{/if}
</div>
