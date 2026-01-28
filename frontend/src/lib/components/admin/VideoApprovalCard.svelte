<script lang="ts">
	import { t } from "svelte-i18n";
	import {
		useApproveVideo,
		useRejectVideo,
		useUpdateVideoVisibility,
		useUpdateVideoUploadDate,
	} from "$lib/api/mutations/admin";
	import moment from "moment";
	import type { Video } from "$lib/types";
	import Modal from "$lib/components/ui/Modal.svelte";
	import {
		Check,
		X,
		Eye,
		EyeOff,
		Calendar,
		ExternalLink,
		User,
		Clock,
		Video as VideoIcon,
	} from "@lucide/svelte";

	interface Props {
		video: Video;
	}

	let { video }: Props = $props();

	const approveMutation = useApproveVideo();
	const rejectMutation = useRejectVideo();
	const visibilityMutation = useUpdateVideoVisibility();
	const uploadDateMutation = useUpdateVideoUploadDate();

	let rejectionReason = $state("");
	let showRejectDialog = $state(false);
	let showUploadDateDialog = $state(false);
	let customUploadDate = $state("");

	async function handleApprove() {
		await approveMutation.mutateAsync(video.id);
	}

	async function handleReject() {
		if (!rejectionReason.trim()) return;
		await rejectMutation.mutateAsync({
			videoId: video.id,
			reason: rejectionReason,
		});
		showRejectDialog = false;
		rejectionReason = "";
	}

	async function handleVisibility() {
		const newStatus = video.status === "hidden" ? "approved" : "hidden";
		await visibilityMutation.mutateAsync({
			videoId: video.id,
			status: newStatus,
		});
	}

	async function handleUpdateUploadDate() {
		await uploadDateMutation.mutateAsync({
			videoId: video.id,
			customUploadDate,
		});
		showUploadDateDialog = false;
		customUploadDate = "";
	}
</script>

<div
	class="bg-surface-800/50 backdrop-blur rounded-2xl border border-surface-700/50 overflow-hidden group hover:border-surface-600 transition-all duration-300"
>
	<div
		class="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-surface-700/50"
	>
		<!-- Thumbnail Section -->
		<div class="md:w-64 p-4 flex-shrink-0">
			<div
				class="relative aspect-video rounded-xl overflow-hidden group-hover:ring-2 ring-primary-500/20 transition-all"
			>
				{#if video.thumbnail_url}
					<img
						src={video.thumbnail_url}
						alt={video.title}
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				{:else}
					<div
						class="w-full h-full bg-surface-700 flex items-center justify-center"
					>
						<VideoIcon size={32} class="text-surface-500" />
					</div>
				{/if}

				<div
					class="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider"
				>
					{video.duration
						? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
						: "0:00"}
				</div>
			</div>
		</div>

		<!-- Content Section -->
		<div class="flex-1 p-6 space-y-4">
			<div class="space-y-1">
				<h3
					class="text-lg font-black text-surface-100 line-clamp-1 group-hover:text-primary-400 transition-colors"
				>
					{video.title}
				</h3>
				<div
					class="flex flex-wrap items-center gap-4 text-xs font-bold text-surface-400 uppercase tracking-widest"
				>
					{#if video.user}
						<div class="flex items-center gap-1.5">
							<User size={14} class="text-primary-500" />
							<span>{video.user.username}</span>
						</div>
					{/if}
					<div class="flex items-center gap-1.5">
						<Clock size={14} class="text-primary-500" />
						<span
							>{video.published_at
								? moment(video.published_at).fromNow()
								: "Draft"}</span
						>
					</div>
				</div>
			</div>

			<!-- Actions Area -->
			<div class="flex flex-wrap items-center gap-2 pt-2">
				{#if video.status === "pending_approval"}
					<button
						onclick={handleApprove}
						disabled={approveMutation.isPending}
						class="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 disabled:opacity-50 transition-all font-bold text-sm"
					>
						{#if approveMutation.isPending}
							<div
								class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"
							></div>
							<span>Approving...</span>
						{:else}
							<Check size={18} strokeWidth={2.5} />
							<span>Approve</span>
						{/if}
					</button>

					<button
						onclick={() => (showRejectDialog = true)}
						disabled={rejectMutation.isPending}
						class="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 disabled:opacity-50 transition-all font-bold text-sm"
					>
						{#if rejectMutation.isPending}
							<div
								class="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"
							></div>
							<span>Rejecting...</span>
						{:else}
							<X size={18} strokeWidth={2.5} />
							<span>Reject</span>
						{/if}
					</button>
				{/if}

				<div class="flex gap-2 ml-auto">
					<button
						onclick={handleVisibility}
						disabled={visibilityMutation.isPending}
						class="p-2.5 rounded-xl border transition-all duration-200 {video.status ===
						'hidden'
							? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
							: 'bg-surface-700/50 text-surface-400 border-surface-600/50 hover:bg-surface-700'}"
						title={video.status === "hidden" ? "Show" : "Hide"}
					>
						{#if video.status === "hidden"}
							<EyeOff size={18} strokeWidth={2.5} />
						{:else}
							<Eye size={18} strokeWidth={2.5} />
						{/if}
					</button>

					<button
						onclick={() => (showUploadDateDialog = true)}
						class="p-2.5 rounded-xl bg-surface-700/50 text-surface-400 border border-surface-600/50 hover:bg-surface-700 transition-all duration-200"
						title="Change Date"
					>
						<Calendar size={18} strokeWidth={2.5} />
					</button>

					<a
						href={`/videos/${video.slug}`}
						target="_blank"
						class="p-2.5 rounded-xl bg-surface-700/50 text-surface-400 border border-surface-600/50 hover:bg-surface-700 transition-all duration-200"
						title="Preview"
					>
						<ExternalLink size={18} strokeWidth={2.5} />
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Rejection Modal -->
<Modal bind:open={showRejectDialog} title="Reject Video">
	<div class="space-y-6">
		<div class="space-y-2">
			<label
				for="rejectionReason"
				class="text-xs font-black uppercase tracking-widest text-surface-500 px-1"
			>
				Rejection Reason
			</label>
			<textarea
				id="rejectionReason"
				bind:value={rejectionReason}
				placeholder="Explain why this video is being rejected..."
				rows="4"
				class="w-full px-4 py-3 bg-surface-950 border border-surface-800 rounded-xl focus:ring-1 ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm font-bold"
			></textarea>
		</div>

		<div class="flex gap-3">
			<button
				onclick={() => (showRejectDialog = false)}
				class="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700/50 transition-all font-bold text-sm"
			>
				Cancel
			</button>
			<button
				onclick={handleReject}
				disabled={!rejectionReason.trim() || rejectMutation.isPending}
				class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 border border-red-500/20 disabled:opacity-50 transition-all font-bold text-sm"
			>
				{rejectMutation.isPending ? "Rejecting..." : "Reject Video"}
			</button>
		</div>
	</div>
</Modal>

<!-- Date Update Modal -->
<Modal bind:open={showUploadDateDialog} title="Update Upload Date">
	<div class="space-y-6">
		<div class="space-y-2">
			<label
				for="customUploadDate"
				class="text-xs font-black uppercase tracking-widest text-surface-500 px-1"
			>
				Custom Upload Date
			</label>
			<input
				id="customUploadDate"
				type="datetime-local"
				bind:value={customUploadDate}
				class="w-full px-4 py-2.5 bg-surface-950 border border-surface-800 rounded-xl focus:ring-1 ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm font-bold"
			/>
		</div>

		<div class="flex gap-3">
			<button
				onclick={() => (showUploadDateDialog = false)}
				class="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700/50 transition-all font-bold text-sm"
			>
				Cancel
			</button>
			<button
				onclick={handleUpdateUploadDate}
				disabled={!customUploadDate || uploadDateMutation.isPending}
				class="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 border border-primary-500/20 disabled:opacity-50 transition-all font-bold text-sm"
			>
				{uploadDateMutation.isPending ? "Updating..." : "Update Date"}
			</button>
		</div>
	</div>
</Modal>
