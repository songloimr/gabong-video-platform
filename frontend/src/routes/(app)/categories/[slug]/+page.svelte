<script lang="ts">
	import { t } from "$lib/stores/i18n";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import VideoGrid from "$lib/components/video/VideoGrid.svelte";
	import QueryError from "$lib/components/ui/QueryError.svelte";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import { FolderOpen } from "@lucide/svelte";
	import type { PageData } from "./$types";
	import { generateVideoListJsonLd, generateBreadcrumbJsonLd, truncateDescription } from "$lib/utils/seo";

	let { data }: { data: PageData } = $props();

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		if (newPage === 1) {
			params.delete("page");
		} else {
			params.set("page", String(newPage));
		}
		goto(`?${params.toString()}`);
	}

	const categoryName = $derived(
		data.category?.name || (data.slug || "").replace(/-/g, " "),
	);
	
	const canonical = $derived(`/categories/${data.slug}`);
	const description = $derived(
		truncateDescription(
			`Xem các video ${categoryName} hay nhất. Cập nhật liên tục các video mới nhất.`
		)
	);

	const pagination = $derived.by(() => {
		if (!data.videos?.pagination) return undefined;
		const p = data.videos.pagination;
		return {
			prev: p.page > 1 ? `?page=${p.page - 1}` : undefined,
			next: p.has_next ? `?page=${p.page + 1}` : undefined,
		};
	});

	const jsonLd = $derived.by(() => {
		if (!data.siteSettings?.site_url) return undefined;
		
		const schemas: object[] = [
			generateBreadcrumbJsonLd([
				{ name: 'Trang chủ', url: '/' },
				{ name: 'Danh mục', url: '/categories' },
				{ name: categoryName, url: canonical }
			], data.siteSettings.site_url)
		];
		
		if (data.videos?.data?.length) {
			schemas.push(
				generateVideoListJsonLd(
					data.videos.data.map(v => ({ id: v.id, slug: v.slug, title: v.title, thumbnail_url: v.thumbnail_url })),
					categoryName,
					canonical,
					data.siteSettings.site_url
				)
			);
		}
		
		return schemas;
	});
</script>

<Seo
	title={categoryName}
	{description}
	{canonical}
	{jsonLd}
	{pagination}
/>

<div class="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
	<div class="flex flex-col gap-6 sm:gap-10 mb-8 sm:mb-12">
		<div class="space-y-1">
			<div
				class="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest"
			>
				<FolderOpen size={12} strokeWidth={3} />
				<span>{$t("common.categoryArchive")}</span>
			</div>
			<h1
				class="text-3xl sm:text-4xl font-black tracking-tighter text-surface-100 uppercase"
			>
				{categoryName}
			</h1>
			{#if data.videos?.pagination}
				<p
					class="text-xs text-surface-500 font-bold uppercase tracking-widest mt-3"
				>
					{$t("common.totalVideos", { values: { count: data.videos.pagination.total } })} • {$t("common.pageOf", { values: { current: data.videos.pagination.page, total: data.videos.pagination.total_pages } })}
				</p>
			{/if}
		</div>
	</div>

	{#if data.error}
		<QueryError
			error={new Error($t(data.error))}
			reset={() => goto(page.url.pathname)}
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
					<FolderOpen size={28} class="text-surface-400" />
				</div>
				<p class="text-lg font-black text-surface-100">
					{$t("common.noResults")}
				</p>
				<p class="text-sm font-bold text-surface-400">
					{$t("common.noVideosInCategory")}
				</p>
			</div>
		</div>
	{/if}
</div>
