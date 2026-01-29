<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { useAdminVideos } from "$lib/api/queries/videos";
	import { useCategories } from "$lib/api/queries/categories";
	import {
		useUpdateVideoVisibility,
		useUpdateVideoUploadDate,
		useDeleteVideo,
		useUpdateVideoDetails,
		usePinVideo,
		useUnpinVideo,
	} from "$lib/api/mutations/admin";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import Modal from "$lib/components/ui/Modal.svelte";
	import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
	import TipTapEditor from "$lib/components/forms/TipTapEditor.svelte";
	import {
		Trash2,
		Search,
		Check,
		X,
		ExternalLink,
		Pencil,
		Clock,
		Tag,
		Play,
		Subtitles,
		Pin,
		PinOff,
	} from "@lucide/svelte";
	import type { Video } from "$lib/types";
	import moment from "moment";
    import { PUBLIC_CDN_URL } from "$env/static/public";

	const currentPage = $derived.by(
		() => Number($page.url.searchParams.get("page")) || 1,
	);
	const searchQuery = $derived.by(
		() => $page.url.searchParams.get("search") || "",
	);
	const statusFilter = $derived.by(
		() => $page.url.searchParams.get("status") || "all",
	);
	const sortBy = $derived.by(
		() => $page.url.searchParams.get("sort") || "newest",
	);

	const params = $derived.by(() => {
		const p: any = {
			page: currentPage,
			limit: 25,
			sort: sortBy,
		};

		if (searchQuery) p.search = searchQuery;
		if (statusFilter !== "all") p.status = statusFilter;

		return p;
	});

	const videosQuery = useAdminVideos(() => params);
	const categoriesQuery = useCategories();
	const videos = $derived.by(() => videosQuery.data?.data || []);
	const pagination = $derived.by(() => videosQuery.data?.pagination);
	const isLoading = $derived.by(() => videosQuery.isLoading);
	const categories = $derived.by(() => categoriesQuery.data?.data || []);

	const visibilityMutation = useUpdateVideoVisibility();
	const uploadDateMutation = useUpdateVideoUploadDate();
	const deleteMutation = useDeleteVideo();
	const updateDetailsMutation = useUpdateVideoDetails();
	const pinMutation = usePinVideo();
	const unpinMutation = useUnpinVideo();

	async function handlePin(video: Video) {
		if ((video as any).is_pinned) {
			await unpinMutation.mutateAsync(video.id);
		} else {
			await pinMutation.mutateAsync(video.id);
		}
	}

	let showEditModal = $state(false);
	let showDeleteConfirm = $state(false);
	let videoToDelete = $state<Video | null>(null);
	let selectedVideo: Video | null = $state(null);
	let searchInput = $state($page.url.searchParams.get("search") || "");

	// Edit form state
	let editTitle = $state("");
	let editDescription = $state("");
	let editCategoryId = $state("");
	let editIsHidden = $state(false);
	let editPublishedAt = $state("");

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set("page", String(newPage));
		goto(`?${params.toString()}`);
	}

	function handleSearch() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchInput) {
			params.set("search", searchInput);
		} else {
			params.delete("search");
		}
		params.set("page", "1");
		goto(`?${params.toString()}`);
	}

	function handleFilterChange(type: string, value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value === "all") {
			params.delete(type);
		} else {
			params.set(type, value);
		}
		params.set("page", "1");
		goto(`?${params.toString()}`);
	}

	function openEditModal(video: Video) {
		selectedVideo = video;
		editTitle = video.title;
		editDescription = video.description || "";
		// Priority: nested category object id, then direct category_id property
		editCategoryId = video.category?.id || (video as any).category_id || "";
		editIsHidden = video.status === "hidden";
		editPublishedAt = video.published_at
			? moment(video.published_at).format("YYYY-MM-DDTHH:mm")
			: "";
		showEditModal = true;
	}

	async function submitEdit() {
		if (!selectedVideo || !editTitle) return;

		// Update video details first
		await updateDetailsMutation.mutateAsync({
			videoId: selectedVideo.id,
			title: editTitle,
			description: editDescription,
			category_id: editCategoryId || undefined,
		});

		// Update visibility if changed
		const currentlyHidden = selectedVideo.status === "hidden";
		if (editIsHidden !== currentlyHidden) {
			await visibilityMutation.mutateAsync({
				videoId: selectedVideo.id,
				status: editIsHidden ? "hidden" : "approved",
			});
		}

		// Update published date if changed
		if (editPublishedAt) {
			const originalDate = selectedVideo.published_at
				? moment(selectedVideo.published_at).format("YYYY-MM-DDTHH:mm")
				: "";
			if (editPublishedAt !== originalDate) {
				await uploadDateMutation.mutateAsync({
					videoId: selectedVideo.id,
					customUploadDate: editPublishedAt,
				});
			}
		}

		showEditModal = false;
		selectedVideo = null;
	}

	async function handleDelete(video: Video) {
		videoToDelete = video;
		showDeleteConfirm = true;
	}

	async function confirmDelete() {
		if (!videoToDelete) return;
		await deleteMutation.mutateAsync(videoToDelete.id);
		videoToDelete = null;
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
			case "rejected":
				return "bg-red-500/20 text-red-400 border-red-500/30";
			case "hidden":
				return "bg-gray-500/20 text-gray-400 border-gray-500/30";
			default:
				return "bg-surface-600 text-surface-300";
		}
	}

	function formatDuration(seconds: number | null): string {
		if (seconds === null) return "-";
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		const parts = [];
		if (hrs > 0) parts.push(hrs.toString().padStart(2, "0"));
		parts.push(mins.toString().padStart(2, "0"));
		parts.push(secs.toString().padStart(2, "0"));

		return parts.join(":");
	}
</script>

{#snippet thumbnailCell(url: string | null, title: string)}
	{#if url}
		<img src={url} alt={title} class="w-16 h-10 object-cover rounded-sm" />
	{:else}
		<div
			class="w-16 h-10 bg-surface-700 rounded-sm flex items-center justify-center"
		>
			<span class="text-[10px] text-surface-400">No Image</span>
		</div>
	{/if}
{/snippet}

{#snippet statusBadge(status: string)}
	<span
		class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border {getStatusBadgeClass(
			status,
		)}"
	>
		{status.replace("_", " ")}
	</span>
{/snippet}

{#snippet actionButtons(video: Video)}
	<div class="flex items-center gap-1">
		<button
			onclick={() => handlePin(video)}
			class="p-1.5 rounded-sm transition-colors {(video as any).is_pinned 
				? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
				: 'bg-surface-600 text-surface-400 hover:bg-surface-500'}"
			title={(video as any).is_pinned ? 'Unpin from Featured' : 'Pin to Featured'}
			disabled={pinMutation.isPending || unpinMutation.isPending}
		>
			{#if (video as any).is_pinned}
				<PinOff class="h-4 w-4" />
			{:else}
				<Pin class="h-4 w-4" />
			{/if}
		</button>
		<button
			onclick={() => openEditModal(video)}
			class="p-1.5 rounded-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
			title="Edit Details"
		>
			<Pencil class="h-4 w-4" />
		</button>
		<a
			href={`/admin/videos/${video.id}`}
			class="p-1.5 rounded-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
			title="Subtitles & Markups"
		>
			<Subtitles class="h-4 w-4" />
		</a>
		<a
			href={`/videos/${video.slug}`}
			target="_blank"
			class="p-1.5 rounded-sm bg-surface-600 text-surface-300 hover:bg-surface-500 transition-colors"
			title="View"
		>
			<ExternalLink class="h-4 w-4" />
		</a>
		<button
			onclick={() => handleDelete(video)}
			class="p-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
			title="Delete"
			disabled={deleteMutation.isPending}
		>
			<Trash2 class="h-4 w-4" />
		</button>
	</div>
{/snippet}

<svelte:head>
	<title>Videos - Gabong Admin</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h1 class="text-xl font-bold text-surface-100">Videos</h1>
	</div>

	<!-- Filters and Search -->
	<div
		class="bg-surface-800/50 backdrop-blur rounded-sm border border-surface-700 p-3"
	>
		<div class="flex flex-col md:flex-row gap-3">
			<!-- Search -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchInput}
						onkeydown={(e) => e.key === "Enter" && handleSearch()}
						placeholder="Search by title or slug..."
						class="w-full px-3 py-2 pl-9 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm placeholder-surface-400 focus:outline-none focus:border-primary-500 transition-colors"
					/>
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
					/>
				</div>
			</div>

			<!-- Status Filter -->
			<select
				value={statusFilter}
				onchange={(e) =>
					handleFilterChange("status", e.currentTarget.value)}
				class="px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-xs focus:outline-none focus:border-primary-500 transition-colors"
			>
				<option value="all">All Status</option>
				<option value="pending_processing">Pending Processing</option>
				<option value="processing">Processing</option>
				<option value="approved">Approved</option>
				<option value="rejected">Rejected</option>
				<option value="hidden">Hidden</option>
			</select>

			<!-- Sort -->
			<select
				value={sortBy}
				onchange={(e) =>
					handleFilterChange("sort", e.currentTarget.value)}
				class="px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-xs focus:outline-none focus:border-primary-500 transition-colors"
			>
				<option value="newest">Newest</option>
				<option value="oldest">Oldest</option>
				<option value="views">Most Views</option>
				<option value="likes">Most Likes</option>
			</select>

			<button
				onclick={handleSearch}
				class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-sm font-bold"
			>
				Filter
			</button>
		</div>
	</div>

	<!-- Videos Table -->
	<div
		class="overflow-x-auto rounded-sm border border-surface-700 bg-surface-800/50 backdrop-blur"
	>
		<table class="table w-full text-xs">
			<thead class="bg-surface-900/80">
				<tr>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-20"
					></th>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-[20%]"
						>Title</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Category</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Duration</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Status</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Published</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-700">
				{#if isLoading}
					{#each Array(5) as _}
						<tr>
							<td class="px-3 py-3" colspan="7">
								<div
									class="h-8 bg-surface-700 animate-pulse rounded-sm"
								></div>
							</td>
						</tr>
					{/each}
				{:else if videos.length === 0}
					<tr>
						<td
							colspan="7"
							class="px-3 py-8 text-center text-surface-400 italic"
						>
							No results found
						</td>
					</tr>
				{:else}
					{#each videos as video (video.id)}
						<tr class="hover:bg-surface-700/50 transition-colors">
							<td class="px-3 py-2">
								{@render thumbnailCell(
									video.thumbnail_url ? video.thumbnail_url : PUBLIC_CDN_URL + `/${video.video_key}/thumbnail.jpg`,
									video.title,
								)}
							</td>
							<td class="px-3 py-2">
								<div class="max-w-50">
									<p
										class="font-bold text-surface-100 truncate"
										title={video.title}
									>
										{video.title}
									</p>
									<p
										class="text-[10px] text-surface-500 truncate font-mono"
									>
										{video.slug}
									</p>
								</div>
							</td>
							<td class="px-3 py-2">
								{#if video.category}
									<div
										class="flex items-center gap-1.5 text-surface-300"
									>
										<Tag
											size={12}
											class="text-primary-500"
										/>
										<span class="font-medium"
											>{video.category.name}</span
										>
									</div>
								{:else}
									<span class="text-surface-600">-</span>
								{/if}
							</td>
							<td class="px-3 py-2 text-surface-300 font-mono">
								{#if video.duration}
									<div class="flex items-center gap-1.5">
										<Clock
											size={12}
											class="text-surface-500"
										/>
										<span
											>{formatDuration(
												video.duration,
											)}</span
										>
									</div>
								{:else}
									<span class="text-surface-600">-</span>
								{/if}
							</td>
							<td class="px-3 py-2">
								{@render statusBadge(video.status)}
							</td>
							<td class="px-3 py-2 text-surface-300 font-mono">
								{video.published_at
									? moment(video.published_at).format(
											"DD/MM/YYYY",
										)
									: "-"}
							</td>
							<td class="px-3 py-2">
								{@render actionButtons(video)}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if pagination}
		<AppPagination
			count={pagination.total}
			pageSize={pagination.limit}
			page={pagination.page}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>



<!-- Edit Video Modal -->
<Modal bind:open={showEditModal} title="Edit Video" size="lg">
	{#if selectedVideo}
		<div class="space-y-4">
			<div>
				<label
					for="edit-title"
					class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
				>
					Title
				</label>
				<input
					id="edit-title"
					type="text"
					bind:value={editTitle}
					class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors font-bold"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label
						for="edit-category"
						class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
					>
						Category
					</label>
					<select
						id="edit-category"
						bind:value={editCategoryId}
						class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
					>
						<option value="">No Category</option>
						{#each categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label
						for="edit-published"
						class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
					>
						Published Date
					</label>
					<input
						id="edit-published"
						type="datetime-local"
						bind:value={editPublishedAt}
						class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
					/>
				</div>
			</div>

			<div>
				<span
					class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
				>
					Description
				</span>
				<div class="max-h-100 overflow-hidden">
					<TipTapEditor bind:value={editDescription} />
				</div>
			</div>

			<div class="flex items-center gap-3 pt-2">
				<label
					class="flex items-center gap-3 text-xs font-bold text-surface-300 cursor-pointer"
				>
					<input
						type="checkbox"
						bind:checked={editIsHidden}
						class="w-4 h-4 rounded-sm border-surface-600 bg-surface-900/50 text-red-500 focus:ring-red-500"
					/>
					Hide video (not visible to public)
				</label>
			</div>

			<div
				class="flex gap-2 justify-end pt-4 border-t border-surface-700/50"
			>
				<button
					onclick={() => (showEditModal = false)}
					class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
				>
					Cancel
				</button>
				<button
					onclick={submitEdit}
					class="px-6 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-bold shadow-lg shadow-primary-900/20"
					disabled={!editTitle ||
						updateDetailsMutation.isPending ||
						visibilityMutation.isPending ||
						uploadDateMutation.isPending}
				>
					{#if updateDetailsMutation.isPending || visibilityMutation.isPending || uploadDateMutation.isPending}
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</div>
	{/if}
</Modal>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Video"
	message={`Are you sure you want to delete "${videoToDelete?.title}"?`}
	onConfirm={confirmDelete}
	onCancel={() => (videoToDelete = null)}
/>
