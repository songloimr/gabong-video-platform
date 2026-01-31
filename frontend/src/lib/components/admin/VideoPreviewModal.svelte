<script lang="ts">
	import Modal from "$lib/components/ui/Modal.svelte";
	import VideoPlayer from "$lib/components/video/VideoPlayer.svelte";
	import type { Video } from "$lib/types";
	import { auth } from "$lib/stores/auth.svelte";
	import { PUBLIC_CDN_URL, PUBLIC_VITE_API_URL } from "$env/static/public";
	import moment from "moment";
	import { untrack } from "svelte";
	import { getAvatarUrl } from "$lib/utils/formatters";
	import {
		Clock,
		Monitor,
		FileVideo,
		ShieldCheck,
		XCircle,
		Info,
		Calendar,
		Tag,
	} from "@lucide/svelte";

	interface Props {
		video: Video | null;
		open: boolean;
		onApprove: () => void;
		onReject: (reason: string) => void;
		isApproving?: boolean;
		isRejecting?: boolean;
	}

	let {
		video,
		open = $bindable(),
		onApprove,
		onReject,
		isApproving = false,
		isRejecting = false,
	}: Props = $props();

	let showRejectForm = $state(false);
	let rejectReason = $state("");

	// Keep track of the original status to prevent player from breaking during transition
	let initialStatus = $state<string | null>(null);

	$effect(() => {
		if (open && video && !initialStatus) {
			initialStatus = video.status;
		}
	});

	// Cleanup when modal closes (use untrack to prevent loop)
	$effect(() => {
		if (!open) {
			// Use untrack to avoid reading initialStatus reactively here
			untrack(() => {
				initialStatus = null;
				showRejectForm = false;
				rejectReason = "";
			});
		}
	});

	// Determine video source: Use preview API for pending/processing videos
	// Use initialStatus to keep showing the preview even if status changed to 'approved' while modal is open
	const videoSrc = $derived.by(() => {
		if (!video) return "";

		const statusToShow = initialStatus || video.status;

		if (statusToShow === "approved" || statusToShow === "hidden") {
			// If it was already approved when opened, use the processed URL
			return video.video_url || "";
		}

		// For videos waiting for approval or currently processing, show the original file
		// Append token because browsers don't send Auth headers for <video> tags
		// Must use absolute URL because it's a direct resource request
		const baseUrl = `${PUBLIC_VITE_API_URL}/api/admin/videos/${video.id}/preview`;
		return auth.access_token
			? `${baseUrl}?token=${auth.access_token}`
			: baseUrl;
	});

	function handleReject() {
		if (rejectReason.trim() && !isRejecting) {
			onReject(rejectReason);
		}
	}

	function handleApprove() {
		if (!isApproving) {
			onApprove();
		}
	}

	function formatDuration(seconds: number | null): string {
		if (seconds === null) return "N/A";
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hrs > 0)
			return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	function formatFileSize(bytes: number | null): string {
		if (bytes === null) return "N/A";
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}
</script>

<Modal bind:open title="Video Review" size="full">
	{#if video}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Video Player Section -->
			<div class="lg:col-span-2 space-y-4">
				<div class="relative group">
					<VideoPlayer
						videoUrl={videoSrc}
						thumbnailUrl={video.thumbnail_url || `${PUBLIC_CDN_URL}/${video.video_key}/thumbnail.jpg`}
						autoPlay={false}
					/>

					{#if video.status !== "approved"}
						<div
							class="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-purple-600/90 backdrop-blur-md rounded-full border border-purple-400/30 shadow-lg animate-in fade-in slide-in-from-left-4 duration-300"
						>
							<ShieldCheck size={14} class="text-white" />
							<span
								class="text-[10px] font-black uppercase tracking-wider text-white"
								>Original File Preview</span
							>
						</div>
					{/if}
				</div>

				<!-- Stats Grid -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
					<div
						class="p-3 bg-surface-800/50 border border-surface-700/50 rounded-lg flex items-center gap-3"
					>
						<div
							class="p-2 bg-blue-500/10 rounded-md text-blue-400"
						>
							<Clock size={16} />
						</div>
						<div>
							<p
								class="text-[10px] font-black uppercase text-surface-500 tracking-wider"
							>
								Duration
							</p>
							<p class="text-xs font-bold text-surface-100">
								{formatDuration(video.duration)}
							</p>
						</div>
					</div>
					<div
						class="p-3 bg-surface-800/50 border border-surface-700/50 rounded-lg flex items-center gap-3"
					>
						<div
							class="p-2 bg-purple-500/10 rounded-md text-purple-400"
						>
							<Monitor size={16} />
						</div>
						<div>
							<p
								class="text-[10px] font-black uppercase text-surface-500 tracking-wider"
							>
								Resolution
							</p>
							<p class="text-xs font-bold text-surface-100">
								{video.resolution || "Unknown"}
							</p>
						</div>
					</div>
					<div
						class="p-3 bg-surface-800/50 border border-surface-700/50 rounded-lg flex items-center gap-3"
					>
						<div
							class="p-2 bg-amber-500/10 rounded-md text-amber-400"
						>
							<FileVideo size={16} />
						</div>
						<div>
							<p
								class="text-[10px] font-black uppercase text-surface-500 tracking-wider"
							>
								File Size
							</p>
							<p class="text-xs font-bold text-surface-100">
								{formatFileSize(video.file_size)}
							</p>
						</div>
					</div>
					<div
						class="p-3 bg-surface-800/50 border border-surface-700/50 rounded-lg flex items-center gap-3"
					>
						<div
							class="p-2 bg-green-500/10 rounded-md text-green-400"
						>
							<Tag size={16} />
						</div>
						<div>
							<p
								class="text-[10px] font-black uppercase text-surface-500 tracking-wider"
							>
								Category
							</p>
							<p
								class="text-xs font-bold text-surface-100 truncate"
							>
								{video.category?.name || "Uncategorized"}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Video Info & Actions Section -->
			<div class="space-y-6 flex flex-col h-full">
				<div class="flex-1 space-y-6 overflow-y-auto">
					<!-- Header Info -->
					<div class="space-y-2">
						<h2
							class="text-2xl font-black text-surface-100 tracking-tight leading-tight"
						>
							{video.title}
						</h2>
						<div
							class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-surface-400"
						>
							<span class="flex items-center gap-1.5">
								<Calendar size={12} class="text-surface-500" />
								{video.published_at
									? moment(video.published_at).format("LLL")
									: "Draft"}
							</span>
							<span class="flex items-center gap-1.5">
								<Info size={12} class="text-surface-500" />
								Status:
								<span class="uppercase font-black text-blue-400"
									>{video.status.replace("_", " ")}</span
								>
							</span>
						</div>
					</div>

					<!-- Description -->
					{#if video.description}
						<div class="space-y-2">
							<p
								class="text-[10px] font-black uppercase text-surface-500 tracking-widest"
							>
								Description
							</p>
							<div
								class="p-4 bg-surface-800/30 border border-surface-700/50 rounded-lg text-sm text-surface-300 leading-relaxed whitespace-pre-wrap"
							>
								{video.description}
							</div>
						</div>
					{/if}

					<!-- Uploader Info -->
					<div class="space-y-2">
						<p
							class="text-[10px] font-black uppercase text-surface-500 tracking-widest"
						>
							Uploader
						</p>
						<div
							class="flex items-center gap-3 p-3 bg-surface-800/30 border border-surface-700/50 rounded-lg"
						>
							<div
								class="w-10 h-10 rounded-full bg-surface-700 overflow-hidden ring-2 ring-primary-500/20"
							>
								{#if video.user?.avatar_url}
								<img
									src={getAvatarUrl(video.user.avatar_url)}
									alt={video.user.username}
									loading="lazy"
									decoding="async"
									class="w-full h-full object-cover"
								/>
								{:else}
									<div
										class="w-full h-full flex items-center justify-center text-xs font-bold text-surface-400 capitalize"
									>
										{video.user?.username?.[0] || "?"}
									</div>
								{/if}
							</div>
							<div>
								<p class="text-sm font-bold text-surface-100">
									{video.user?.username || "System"}
								</p>
								<p
									class="text-[10px] font-medium text-surface-500"
								>
									Member since {moment().format("YYYY")}
								</p>
							</div>
						</div>
					</div>

					<!-- Rejection Form -->
					{#if showRejectForm}
						<div
							class="space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
						>
							<div
								class="flex items-center gap-2 text-red-400 mb-1"
							>
								<XCircle size={14} strokeWidth={2.5} />
								<p
									class="text-[10px] font-black uppercase tracking-widest"
								>
									Provide Rejection Reason
								</p>
							</div>
							<textarea
								id="reject-reason"
								bind:value={rejectReason}
								placeholder="Explain why this video is being rejected..."
								class="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-md text-xs text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-1 focus:ring-red-500 appearance-none min-h-25 resize-none"
							></textarea>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-24 gap-4">
			<div
				class="w-12 h-12 border-4 border-primary-500/10 border-t-primary-500 rounded-full animate-spin"
			></div>
			<p
				class="text-xs font-bold text-surface-500 uppercase tracking-widest animate-pulse"
			>
				Loading Video Data...
			</p>
		</div>
	{/if}

	{#snippet footer()}
		<div class="flex items-center justify-end w-full gap-3">
			{#if showRejectForm}
				<button
					class="px-5 py-2.5 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-md transition-all font-bold text-xs"
					onclick={() => {
						showRejectForm = false;
						rejectReason = "";
					}}
				>
					Cancel
				</button>
				<button
					class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all font-black text-xs shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					onclick={handleReject}
					disabled={isRejecting || !rejectReason.trim()}
				>
					{#if isRejecting}
						<div
							class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"
						></div>
						Confirming...
					{:else}
						Confirm Rejection
					{/if}
				</button>
			{:else}
				<button
					class="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-200 rounded-md transition-all font-bold text-xs"
					onclick={() => (showRejectForm = true)}
				>
					Reject Video
				</button>
				<button
					class="px-8 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-all font-black text-xs shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					onclick={handleApprove}
					disabled={isApproving}
				>
					{#if isApproving}
						<div
							class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"
						></div>
						Approving...
					{:else}
						Approve Video
					{/if}
				</button>
			{/if}
		</div>
	{/snippet}
</Modal>
