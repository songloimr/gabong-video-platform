<script lang="ts">
	import { t } from "svelte-i18n";
	import {
		useLikeVideo,
		useSaveToWatchLater,
		useTrackView,
	} from "$lib/api/mutations/videos";
	import VideoPlayer from "$lib/components/video/VideoPlayer.svelte";
	import VideoControls from "$lib/components/video/VideoControls.svelte";
	import VideoDescription from "$lib/components/video/VideoDescription.svelte";
	import VideoInfo from "$lib/components/video/VideoInfo.svelte";
	import CommentSection from "$lib/components/comments/CommentSection.svelte";
	import Storyboard from "$lib/components/video/Storyboard.svelte";
	import { LoaderCircle, X } from "@lucide/svelte";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
    import { PUBLIC_CDN_URL } from "$env/static/public";

	// SSR Data
	let { data }: PageProps = $props();

	const video = $derived(data.video);

	// API Mutations
	const likeMutation = useLikeVideo();
	const watchLaterMutation = useSaveToWatchLater();
	const trackViewMutation = useTrackView();

	// Reactive state for video interactions (client-side only)
	let isLiked = $state(false);
	let isSaved = $state(false);

	// Player State Synchronization
	let isMuted = $state(true); // Default muted
	let player = $state<VideoPlayer | null>(null);

	// Load isMuted from localStorage
	onMount(() => {
		const savedMuted = localStorage.getItem("gabong_video_muted");
		if (savedMuted !== null) {
			isMuted = savedMuted === "true";
			isMuted ? player?.mute() : player?.unmute();
		}
	});

	// Persist isMuted to localStorage
	$effect(() => {
		localStorage.setItem("gabong_video_muted", isMuted.toString());
	});

	async function handleLike() {
		if (!video) return;
		try {
			const result = await likeMutation.mutateAsync(video.id);
			isLiked = result.is_liked;
		} catch (error) {
			console.error("Failed to like video:", error);
		}
	}

	async function handleWatchLater() {
		if (!video) return;
		try {
			await watchLaterMutation.mutateAsync(video.id);
			isSaved = !isSaved;
		} catch (error) {
			console.error("Failed to save to watch later:", error);
		}
	}

	async function handleShare() {
		if (!video) return;
		const url = `${window.location.origin}/s/${video.short_code}`;
		await navigator.clipboard.writeText(url);
		alert($t("video.linkCopied"));
	}

	function handleSeekToTime(seconds: number) {
		player?.seek(seconds);
	}
</script>

<svelte:head>
	<title>{video?.title || "Video"} - Gabong</title>
	{#if video}
		<meta name="description" content={video.description || video.title} />
		<meta property="og:title" content={video.title} />
		<meta property="og:description" content={video.description || ""} />
		<meta property="og:image" content={video.thumbnail_url || ""} />
		<meta property="og:type" content="video.other" />
	{/if}
</svelte:head>

{#if data.error}
	<div class="max-w-480 mx-auto px-4 py-12">
		<div class="text-center space-y-4">
			<h1 class="text-2xl font-black text-surface-100">
				{data.error}
			</h1>
			<a
				href="/"
				class="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
			>
				{$t("common.backToHome")}
			</a>
		</div>
	</div>
{:else if video}
	<div class="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6">
			<!-- Main Content -->
			<div class="lg:col-span-8 flex flex-col gap-4 pb-6 lg:pb-0 border-b lg:border-b-0 border-surface-800/50">
				<h1
					class="text-xl sm:text-2xl font-black tracking-tighter text-surface-50 leading-tight font-heading uppercase"
				>
					{video.title}
				</h1>
				<div class="player-container">
					<VideoPlayer
						videoUrl={video.video_url || ""}
						thumbnailUrl={video.thumbnail_url || `${PUBLIC_CDN_URL}/${video.video_key}/thumbnail.jpg`}
						points={data.markups}
						subtitles={data.subtitles}
						bind:this={player}
					/>

					{#if video.status !== "approved"}
						<div
							class="absolute inset-0 flex items-center justify-center bg-surface-950/90 backdrop-blur-md z-30 rounded-md border border-white/10"
						>
							<div
								class="text-center p-8 max-w-md animate-scale-in"
							>
								<div
									class="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
								>
									{#if video.status === "rejected"}
										<X size={40} class="text-red-500" />
									{:else}
										<LoaderCircle
											size={40}
											class="text-primary-500 animate-spin"
										/>
									{/if}
								</div>
								<h2
									class="text-2xl font-black text-surface-50 uppercase tracking-tighter mb-3"
								>
									{#if video.status === "rejected"}
										Video bị từ chối
									{:else}
										Video đang chờ duyệt
									{/if}
								</h2>
								<p class="text-surface-400 font-medium mb-6">
									{#if video.status === "rejected"}
										Rất tiếc, video này không phù hợp với
										tiêu chuẩn cộng đồng của chúng tôi.
									{:else if video.status === "processing"}
										Video đã được duyệt và đang trong quá
										trình xử lý kỹ thuật. Vui lòng quay lại
										sau ít phút.
									{:else}
										Video đã được tải lên thành công và đang
										chờ ban quản trị phê duyệt. Quá trình
										này thường mất vài giờ.
									{/if}
								</p>
								<div class="flex flex-col gap-3">
									<a
										href="/"
										class="px-6 py-3 bg-white text-surface-900 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all"
									>
										{$t("common.backToHome")}
									</a>
								</div>
							</div>
						</div>
					{/if}
					<VideoControls
						{isMuted}
						onToggleMute={() => {
							isMuted = !isMuted;
							if (isMuted) {
								player?.mute();
							} else {
								player?.unmute();
							}
						}}
						onSpeedChange={(rate) => player?.speed(rate)}
						onSeek={(seconds) => player?.seek(seconds)}
					/>
					<VideoDescription {video} onSeek={handleSeekToTime} />
				</div>

				{#if video.storyboard_url}
					<Storyboard storyboardUrl={video.storyboard_url} />
				{/if}
			</div>

			<!-- Sidebar Content -->
			<div class="lg:col-span-4 flex flex-col gap-6">
				<div class="lg:sticky lg:top-20">
					<VideoInfo
					{video}
					onLike={handleLike}
					onWatchLater={handleWatchLater}
					{isLiked}
					{isSaved}
					onShare={handleShare}
				/>
				</div>
				<div class="border-t lg:border-t-0 border-surface-800/50 pt-6 lg:pt-0">
					<CommentSection videoId={video.id} onSeek={handleSeekToTime} />
				</div>
			</div>
		</div>
	</div>
{/if}
