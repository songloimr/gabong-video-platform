<script lang="ts">
	import { t } from "svelte-i18n";
	import { page } from "$app/state";
	import { usePlaylist } from "$lib/api/queries/playlists";
	import VideoGrid from "$lib/components/video/VideoGrid.svelte";
	import { PlaySquare, Calendar, Library, ArrowLeft } from "@lucide/svelte";
	import moment from "moment";

	const slug = $derived(page.params.slug || "");
	const playlistQuery = usePlaylist(() => slug);

	const playlist = $derived(playlistQuery.data);
	const isLoading = $derived(playlistQuery.isLoading);
	const error = $derived(playlistQuery.error);
</script>

<svelte:head>
	{#if playlist}
		<title>{playlist.title} - {$t("common.playlists")} | Gabong</title>
		<meta name="description" content={playlist.description || ""} />
		<meta property="og:title" content={playlist.title} />
		<meta property="og:description" content={playlist.description || ""} />
		{#if playlist.thumbnail_url}
			<meta property="og:image" content={playlist.thumbnail_url} />
		{/if}
	{:else}
		<title>{$t("common.playlists")} | Gabong</title>
	{/if}
</svelte:head>

<div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
	<!-- Back Button & Breadcrumbs -->
	<div class="mb-8">
		<a
			href="/playlists"
			class="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 font-bold text-xs uppercase tracking-widest transition-colors group"
		>
			<div
				class="p-2 rounded-lg bg-surface-800/50 border border-surface-700/50 group-hover:border-primary-500/30 transition-all"
			>
				<ArrowLeft size={14} strokeWidth={2.5} />
			</div>
			<span>All Playlists</span>
		</a>
	</div>

	{#if isLoading}
		<div class="space-y-8 animate-pulse">
			<div class="flex flex-col md:flex-row gap-6">
				<div
					class="w-full md:w-96 h-54 rounded-3xl bg-surface-800"
				></div>
				<div class="flex-1 space-y-4 pt-4">
					<div class="h-10 bg-surface-800 rounded-xl w-1/2"></div>
					<div class="h-4 bg-surface-800 rounded-lg w-3/4"></div>
					<div class="h-12 bg-surface-800 rounded-xl w-1/4"></div>
				</div>
			</div>
			<div
				class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 pt-8"
			>
				{#each Array(10) as _, i}
					<div class="space-y-3" style="animation-delay: {i * 50}ms">
						<div
							class="aspect-video bg-surface-800 rounded-xl"
						></div>
						<div class="h-4 bg-surface-800 rounded-lg w-3/4"></div>
					</div>
				{/each}
			</div>
		</div>
	{:else if error}
		<div class="text-center py-20">
			<div class="max-w-md mx-auto space-y-4">
				<div
					class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto"
				>
					<Library size={28} class="text-red-400" />
				</div>
				<p class="text-lg font-black text-surface-100">
					{$t("errors.loadFailed")}
				</p>
				<button
					onclick={() => playlistQuery.refetch()}
					class="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
				>
					{$t("common.retry")}
				</button>
			</div>
		</div>
	{:else if playlist}
		<!-- Playlist Header -->
		<div class="mb-12">
			<div class="flex flex-col md:flex-row gap-8 lg:gap-12">
				<!-- Thumbnail -->
				<div class="w-full md:w-96 flex-shrink-0 animate-scale-in">
					<div
						class="aspect-video rounded-3xl overflow-hidden bg-surface-800 border-2 border-surface-700/50 shadow-2xl relative group"
					>
						{#if playlist.thumbnail_url}
							<img
								src={playlist.thumbnail_url}
								alt={playlist.title}
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							/>
						{:else}
							<div
								class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-600/20"
							>
								<Library
									size={64}
									class="text-primary-500/50"
								/>
							</div>
						{/if}
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						></div>
					</div>
				</div>

				<!-- Info -->
				<div class="flex-1 space-y-6">
					<div class="space-y-2">
						<div
							class="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-[0.2em]"
						>
							<div
								class="w-6 h-0.5 bg-current rounded-full"
							></div>
							<span>Video Collection</span>
						</div>
						<h1
							class="text-4xl lg:text-5xl font-black tracking-tighter text-surface-50 uppercase leading-none"
						>
							{playlist.title}
						</h1>
					</div>

					{#if playlist.description}
						<div class="relative">
							<div
								class="absolute -left-4 top-0 bottom-0 w-1 bg-primary-500/20 rounded-full"
							></div>
							<p
								class="text-surface-400 font-medium text-base lg:text-lg leading-relaxed max-w-3xl italic"
							>
								{playlist.description}
							</p>
						</div>
					{/if}

					<div class="flex flex-wrap gap-4 pt-2">
						<div
							class="flex items-center gap-3 px-4 py-2 bg-surface-800/30 backdrop-blur-sm rounded-xl border border-surface-700/50 shadow-sm"
						>
							<div
								class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20"
							>
								<PlaySquare
									size={16}
									class="text-primary-400"
								/>
							</div>
							<div class="flex flex-col">
								<span
									class="text-[10px] font-black text-surface-500 uppercase tracking-widest"
									>Videos</span
								>
								<span
									class="text-sm font-black text-surface-200"
									>{playlist.video_count}</span
								>
							</div>
						</div>

						<div
							class="flex items-center gap-3 px-4 py-2 bg-surface-800/30 backdrop-blur-sm rounded-xl border border-surface-700/50 shadow-sm"
						>
							<div
								class="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center border border-surface-600/50"
							>
								<Calendar size={16} class="text-surface-400" />
							</div>
							<div class="flex flex-col">
								<span
									class="text-[10px] font-black text-surface-500 uppercase tracking-widest"
									>Created</span
								>
								<span
									class="text-sm font-black text-surface-200"
									>{moment(playlist.created_at).format(
										"MMM D, YYYY",
									)}</span
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Videos -->
		<div class="space-y-8 animate-fade-in-up">
			<div class="flex items-center gap-4">
				<h2
					class="text-lg font-black text-surface-100 uppercase tracking-widest flex items-center gap-3"
				>
					<span>Playlist Content</span>
					<div class="h-px flex-1 bg-surface-800 min-w-[100px]"></div>
				</h2>
			</div>

			{#if playlist.videos && playlist.videos.length > 0}
				<VideoGrid videos={playlist.videos} />
			{:else}
				<div
					class="text-center py-24 bg-surface-900/50 rounded-3xl border border-dashed border-surface-800"
				>
					<div class="max-w-md mx-auto space-y-6">
						<div
							class="w-20 h-20 bg-surface-800 rounded-full flex items-center justify-center mx-auto ring-8 ring-surface-800/30"
						>
							<PlaySquare size={32} class="text-surface-500" />
						</div>
						<div class="space-y-2">
							<p
								class="text-xl font-black text-surface-100 uppercase"
							>
								No videos yet
							</p>
							<p class="text-sm font-bold text-surface-500">
								This playlist is currently empty. Check back
								later for new content.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="text-center py-20">
			<div class="max-w-md mx-auto space-y-4">
				<div
					class="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto"
				>
					<Library size={28} class="text-surface-500" />
				</div>
				<p class="text-lg font-black text-surface-100">
					{$t("errors.notFound")}
				</p>
				<a
					href="/playlists"
					class="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all font-heading uppercase tracking-widest text-sm"
				>
					Explore Playlists
				</a>
			</div>
		</div>
	{/if}
</div>
