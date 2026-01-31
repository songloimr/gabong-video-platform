<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { useAdminPlaylistById } from "$lib/api/queries/playlists";
	import { useAdminVideos } from "$lib/api/queries/videos";
	import {
		useAddVideosToPlaylist,
		useRemoveVideoFromPlaylist,
	} from "$lib/api/mutations/playlists";
	import {
		ArrowLeft,
		Plus,
		Trash2,
		Search,
		ListVideo,
		Play,
	} from "@lucide/svelte";
	import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";

	const playlistId = page.params.id!;
	const playlistQuery = useAdminPlaylistById(() => playlistId);

	let searchQuery = $state("");
	let debouncedSearch = $state("");

	function debounce(fn: Function, delay: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	}

	const updateSearch = debounce((q: string) => {
		debouncedSearch = q;
	}, 500);

	$effect(() => {
		updateSearch(searchQuery);
	});

	const searchVideosQuery = useAdminVideos(() => ({
		search: debouncedSearch,
		limit: 10,
		status: "approved",
	}));

	const addVideoMutation = useAddVideosToPlaylist();
	const removeVideoMutation = useRemoveVideoFromPlaylist();

	let showRemoveConfirm = $state(false);
	let videoToRemove = $state<string | null>(null);

	async function handleAddVideo(videoId: string) {
		if (!playlistId) return;
		await addVideoMutation.mutateAsync({
			playlistId,
			videoIds: [videoId],
		});
		playlistQuery.refetch();
	}

	async function handleRemoveVideo(videoId: string) {
		if (!playlistId) return;
		videoToRemove = videoId;
		showRemoveConfirm = true;
	}

	async function confirmRemoveVideo() {
		if (!playlistId || !videoToRemove) return;
		await removeVideoMutation.mutateAsync({
			playlistId,
			videoId: videoToRemove,
		});
		playlistQuery.refetch();
		videoToRemove = null;
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	}

	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case "approved":
				return "bg-green-500/20 text-green-400 border-green-500/30";
			case "pending_approval":
				return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
			case "pending_processing":
				return "bg-blue-500/20 text-blue-400 border-blue-500/30";
			case "processing":
				return "bg-purple-500/20 text-purple-400 border-purple-500/30";
			default:
				return "bg-surface-600 text-surface-300";
		}
	}
</script>

{#snippet thumbnailCell(url: string | null, title: string)}
	{#if url}
		<img src={url} alt={title} loading="lazy" decoding="async" class="w-16 h-10 object-cover rounded-sm" />
	{:else}
		<div
			class="w-16 h-10 bg-surface-700 rounded-sm flex items-center justify-center"
		>
			<Play class="h-4 w-4 text-surface-400" />
		</div>
	{/if}
{/snippet}

<svelte:head>
	<title>Manage Playlist - Gabong Admin</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<button
			onclick={() => goto("/admin/playlists")}
			class="p-1.5 rounded-sm bg-surface-600 text-surface-300 hover:bg-surface-500 transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
		</button>
		<div>
			{#if playlistQuery.data}
				<h1 class="text-xl font-bold text-surface-100">
					{playlistQuery.data.title}
				</h1>
			{:else}
				<div class="h-7 w-48 bg-surface-700 animate-pulse rounded-sm"></div>
			{/if}
		</div>
	</div>

	<div
		class="bg-surface-800/50 backdrop-blur rounded-sm border border-surface-700"
	>
		<div
			class="flex items-center justify-between px-3 py-2 border-b border-surface-700"
		>
			<div class="flex items-center gap-2">
				<ListVideo class="h-4 w-4 text-primary-400" />
				<h2
					class="text-sm font-black uppercase tracking-wider text-surface-100"
				>
					Videos
					{#if playlistQuery.data}
						<span class="text-surface-500 font-bold">
							({playlistQuery.data.videos.length})
						</span>
					{/if}
				</h2>
			</div>

			<div class="relative w-72">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search videos to add..."
					class="w-full px-3 py-1.5 pl-9 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-xs placeholder-surface-400 focus:outline-none focus:border-primary-500 transition-colors"
				/>

				{#if debouncedSearch}
					<div
						class="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-sm shadow-xl z-50 overflow-hidden"
					>
						{#if searchVideosQuery.isLoading}
							<div class="p-3 flex justify-center">
								<div
									class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
								></div>
							</div>
						{:else if searchVideosQuery.data?.data && searchVideosQuery.data.data.length > 0}
							<div class="max-h-60 overflow-y-auto p-1 space-y-0.5">
								{#each searchVideosQuery.data.data as video (video.id)}
									<div
										class="flex items-center gap-2 p-1.5 rounded-sm hover:bg-surface-700/50 transition-colors"
									>
										<div
											class="w-12 h-8 rounded-sm overflow-hidden bg-surface-700 flex-shrink-0"
										>
											{#if video.thumbnail_url}
									<img
											src={video.thumbnail_url}
											alt={video.title}
											loading="lazy"
											decoding="async"
											class="w-full h-full object-cover"
										/>
											{:else}
												<div
													class="w-full h-full flex items-center justify-center"
												>
													<Play
														class="h-3 w-3 text-surface-500"
													/>
												</div>
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p
												class="text-[10px] font-bold text-surface-100 truncate"
											>
												{video.title}
											</p>
											<p
												class="text-[9px] text-surface-500 font-mono"
											>
												{formatDuration(
													video.duration || 0,
												)}
											</p>
										</div>
										<button
											onclick={() =>
												handleAddVideo(video.id)}
											disabled={addVideoMutation.isPending ||
												(playlistQuery.data?.videos.some(
													(v) => v.id === video.id,
												) ?? false)}
											class="p-1 rounded-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors disabled:opacity-30"
										>
											<Plus class="h-3.5 w-3.5" />
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<div
								class="p-3 text-center text-surface-500 italic text-[10px]"
							>
								No results
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="table w-full text-xs">
				<thead class="bg-surface-900/80">
					<tr>
						<th
							class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-12 text-center"
							>#</th
						>
						<th
							class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-20"
						></th>
						<th
							class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
							>Title</th
						>
						<th
							class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-24"
							>Status</th
						>
						<th
							class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-20"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-700">
					{#if playlistQuery.isLoading}
						{#each Array(5) as _}
							<tr>
								<td class="px-3 py-3" colspan="5">
									<div
										class="h-8 bg-surface-700 animate-pulse rounded-sm"
									></div>
								</td>
							</tr>
						{/each}
					{:else if (playlistQuery.data?.videos.length ?? 0) === 0}
						<tr>
							<td
								colspan="5"
								class="px-3 py-8 text-center text-surface-400 italic"
							>
								This playlist is empty
							</td>
						</tr>
					{:else if playlistQuery.data}
						{#each playlistQuery.data.videos as video (video.id)}
							<tr class="hover:bg-surface-700/50 transition-colors">
								<td
									class="px-3 py-2 text-center text-surface-500 font-bold"
								>
									{video.position}
								</td>
								<td class="px-3 py-2">
									{@render thumbnailCell(
										video.thumbnail_url,
										video.title,
									)}
								</td>
								<td class="px-3 py-2">
									<div class="max-w-[300px]">
										<p
											class="font-bold text-surface-100 truncate"
											title={video.title}
										>
											{video.title}
										</p>
										<p
											class="text-[10px] text-surface-500 truncate font-mono"
										>
											/{video.slug}
										</p>
									</div>
								</td>
								<td class="px-3 py-2">
									<span
										class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border {getStatusBadgeClass(
											video.status,
										)}"
									>
										{video.status.replace("_", " ")}
									</span>
								</td>
								<td class="px-3 py-2">
									<button
										onclick={() =>
											handleRemoveVideo(video.id)}
										disabled={removeVideoMutation.isPending}
										class="p-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
										title="Remove from playlist"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<ConfirmDialog
	bind:open={showRemoveConfirm}
	title="Remove Video"
	message="Remove this video from playlist?"
	onConfirm={confirmRemoveVideo}
	onCancel={() => (videoToRemove = null)}
/>
