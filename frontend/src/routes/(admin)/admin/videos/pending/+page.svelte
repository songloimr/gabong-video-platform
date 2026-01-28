<script lang="ts">
	import { t } from "svelte-i18n";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { useAdminVideos } from "$lib/api/queries/videos";
	import { useApproveVideo, useRejectVideo } from "$lib/api/mutations/admin";
	import VideoThumbnail from "$lib/components/video/VideoThumbnail.svelte";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import Modal from "$lib/components/ui/Modal.svelte";
	import VideoPreviewModal from "$lib/components/admin/VideoPreviewModal.svelte";
	import { getAvatarUrl } from "$lib/utils/formatters";
	import {
		CheckCircle,
		XCircle,
		Trash2,
		Search,
		AlertCircle,
		ExternalLink,
		Clock,
		Check,
		X,
		Eye,
	} from "@lucide/svelte";
	import moment from "moment";
	import type { Video } from "$lib/types";
    import { PUBLIC_CDN_URL } from "$env/static/public";

	const currentPage = $derived(
		Math.max(1, Number($page.url.searchParams.get("page") || 1)),
	);

	const videosQuery = useAdminVideos(() => ({
		page: currentPage,
		limit: 20,
		status: "pending_approval",
	}));

	const videos = $derived(videosQuery.data?.data || []);
	const pagination = $derived(videosQuery.data?.pagination);
	const isLoading = $derived(videosQuery.isLoading);

	const approveMutation = useApproveVideo();
	const rejectMutation = useRejectVideo();

	let showRejectModal = $state(false);
	let selectedVideo: Video | null = $state(null);
	let rejectionReason = $state("");
	let previewModalOpen = $state(false);
	let videoForPreview: Video | null = $state(null);

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set("page", String(newPage));
		goto(`?${params.toString()}`);
	}

	async function handleApprove(video: Video) {
		await approveMutation.mutateAsync(video.id);
	}

	function openRejectModal(video: Video) {
		selectedVideo = video;
		rejectionReason = "";
		showRejectModal = true;
	}

	async function submitReject() {
		if (!selectedVideo || !rejectionReason) return;
		await rejectMutation.mutateAsync({
			videoId: selectedVideo.id,
			reason: rejectionReason,
		});
		showRejectModal = false;
		selectedVideo = null;
	}

	function openPreview(video: Video) {
		videoForPreview = video;
		previewModalOpen = true;
	}

	async function handlePreviewApprove() {
		if (!videoForPreview) return;
		await approveMutation.mutateAsync(videoForPreview.id);
		previewModalOpen = false;
		videoForPreview = null;
	}

	async function handlePreviewReject(reason: string) {
		if (!videoForPreview) return;
		await rejectMutation.mutateAsync({
			videoId: videoForPreview.id,
			reason,
		});
		previewModalOpen = false;
		videoForPreview = null;
	}

	function formatDuration(seconds: number | null): string {
		if (!seconds) return "-";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
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

{#snippet actionButtons(video: Video)}
	<div class="flex items-center gap-1.5">
		<button
			onclick={() => openPreview(video)}
			class="p-1.5 rounded-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
			title="Preview"
		>
			<Eye class="h-4 w-4" />
		</button>
		<button
			onclick={() => handleApprove(video)}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-xs font-bold"
			title="Approve"
			disabled={approveMutation.isPending}
		>
			<Check class="h-4 w-4" />
			Approve
		</button>
		<button
			onclick={() => openRejectModal(video)}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
			title="Reject"
			disabled={rejectMutation.isPending}
		>
			<X class="h-4 w-4" />
			Reject
		</button>
	</div>
{/snippet}

<svelte:head>
	<title>Pending Approval - Gabong Admin</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h1 class="text-xl font-bold text-surface-100">Pending Approval</h1>
			{#if pagination}
				<span
					class="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 uppercase"
				>
					{pagination.total} total
				</span>
			{/if}
		</div>
	</div>

	<!-- Pending Videos Table -->
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
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Video</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Uploader</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Duration</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Submitted</th
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
							<td class="px-3 py-3" colspan="6">
								<div
									class="h-10 bg-surface-700 animate-pulse rounded-sm"
								></div>
							</td>
						</tr>
					{/each}
				{:else if videos.length === 0}
					<tr>
						<td colspan="6" class="px-3 py-12 text-center">
							<div class="flex flex-col items-center gap-2">
								<div class="p-3 rounded-sm bg-green-500/10">
									<Check class="h-6 w-6 text-green-400" />
								</div>
								<p class="text-surface-300 font-bold">
									All caught up!
								</p>
								<p class="text-surface-500 text-[10px]">
									No videos pending approval
								</p>
							</div>
						</td>
					</tr>
				{:else}
					{#each videos as video (video.id)}
						<tr class="hover:bg-surface-700/50 transition-colors">
							<td class="px-3 py-2">
								{@render thumbnailCell(
									video.thumbnail_url || PUBLIC_CDN_URL + `/${video.video_key}/thumbnail.jpg`,
									video.title,
								)}
							</td>
							<td class="px-3 py-2">
								<div class="max-w-xs">
									<p
										class="font-bold text-surface-100 truncate"
									>
										{video.title}
									</p>
									<p
										class="text-[10px] text-surface-500 truncate font-mono mt-0.5"
									>
										{video.slug}
									</p>
								</div>
							</td>
							<td class="px-3 py-2">
								{#if video.user}
									<div class="flex items-center gap-1.5">
{#if video.user.avatar_url}
									<img
										src={getAvatarUrl(video.user.avatar_url)}
										alt={video.user.username}
												class="w-5 h-5 rounded-full object-cover"
											/>
										{:else}
											<div
												class="w-5 h-5 rounded-full bg-primary-500/30 flex items-center justify-center text-[10px] text-primary-400 font-black"
											>
												{video.user.username
													.charAt(0)
													.toUpperCase()}
											</div>
										{/if}
										<span class="text-surface-200"
											>{video.user.username}</span
										>
									</div>
								{:else}
									<span class="text-surface-500">-</span>
								{/if}
							</td>
							<td class="px-3 py-2">
								<div class="flex items-center gap-1">
									<Clock class="h-3 w-3 text-surface-500" />
									<span>{formatDuration(video.duration)}</span
									>
								</div>
							</td>
							<td class="px-3 py-2 text-surface-400">
								{video.published_at
									? moment(video.published_at).fromNow()
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

<!-- Rejection Modal -->
<Modal bind:open={showRejectModal} title="Reject Video">
	{#if selectedVideo}
		<div class="space-y-4">
			<p class="text-xs text-surface-300">
				Rejecting: <span class="font-bold text-surface-100"
					>{selectedVideo.title}</span
				>
			</p>

			<div>
				<label
					for="rejection-reason"
					class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-2"
				>
					Reason for rejection
				</label>
				<textarea
					id="rejection-reason"
					bind:value={rejectionReason}
					class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors h-24 resize-none"
					placeholder="Enter reason..."
				></textarea>
			</div>

			<div class="flex gap-2 justify-end">
				<button
					onclick={() => (showRejectModal = false)}
					class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
				>
					Cancel
				</button>
				<button
					onclick={submitReject}
					class="px-4 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-bold"
					disabled={!rejectionReason || rejectMutation.isPending}
				>
					Confirm Rejection
				</button>
			</div>
		</div>
	{/if}
</Modal>

<!-- Video Preview Modal -->
<VideoPreviewModal
	bind:open={previewModalOpen}
	video={videoForPreview}
	onApprove={handlePreviewApprove}
	onReject={handlePreviewReject}
	isApproving={approveMutation.isPending}
	isRejecting={rejectMutation.isPending}
/>
