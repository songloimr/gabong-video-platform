<script lang="ts">
    import { PUBLIC_CDN_URL, PUBLIC_VITE_API_URL } from "$env/static/public";
    import type { VideoMarkup, VideoSubtitle } from "$lib/types";
    import { FastForward } from "@lucide/svelte";
    import { onDestroy } from "svelte";

    interface Props {
        videoUrl: string;
        thumbnailUrl?: string;
        autoPlay?: boolean;
        points?: VideoMarkup[];
        subtitles?: VideoSubtitle[];
    }

    let {
        videoUrl,
        thumbnailUrl,
        autoPlay = false,
        points = [],
        subtitles = [],
    }: Props = $props();

    let playerInstance: any = null;
    let playbackRate = $state(1);

    // Generate unique ID for this player instance
    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;

    function initPlayer() {
        const options: any = {
            id: playerId,
            file: videoUrl.startsWith("http") ? videoUrl : `${PUBLIC_CDN_URL}/${videoUrl}`,
        };

        if (subtitles.length) {
            options.subtitle = subtitles
                .map(
                    (sub) =>
                        `[${sub.label}]${PUBLIC_VITE_API_URL}/api/videos/raw/subtitles/${sub.id}.vtt`,
                )
                .join(",");
            options.default_subtitle = subtitles.find(
                (sub) => sub.language_code === "vi",
            )?.label;
        }

        if (points.length) 
            options.points = points;
        console.log(thumbnailUrl)
        if (thumbnailUrl) 
            options.poster = thumbnailUrl

        if (autoPlay) 
            options.autoplay = 1;

        playerInstance = new (window as any).Playerjs(options);
    }

    // API Methods for raw use
    export function play() {
        playerInstance?.api("play");
    }
    export function pause() {
        playerInstance?.api("pause");
    }

    export function mute() {
        playerInstance?.api("mute");
    }

    export function unmute() {
        playerInstance?.api("unmute");
    }

    export function screenshot(): string {
        return playerInstance?.api("screenshot");
    }

    export function adblock(): boolean {
        return playerInstance?.api("adblock");
    }

    export function addSubtitle(title: string, url: string) {
        console.log(title, url);
        playerInstance?.api("+subtitle", `[${title}]${url}`);
    }

    export function speed(rate: number) {
        playbackRate = rate;
        playerInstance?.api("speed", rate.toFixed(1));
    }
    export function seek(time: number | string) {
        playerInstance?.api("seek", time + "");
    }

    onDestroy(() => {
        playerInstance?.api("destroy");
    });
</script>

<svelte:head>
    <script src="/playerjs3.js" onload={initPlayer}></script>
</svelte:head>

<div
    class="relative w-full aspect-video bg-black rounded-md shadow-2xl overflow-hidden ring-1 ring-white/10 group"
>
    <div id={playerId}></div>

    {#if playbackRate !== 1}
        <div
            class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none transition-all duration-300 z-50"
        >
            <FastForward size={14} class="text-primary-500 fill-primary-500" />
            <span
                class="text-[10px] font-black text-white uppercase tracking-widest"
            >
                {playbackRate}x Speed
            </span>
        </div>
    {/if}
</div>

<style>
    div :global(div[id^="player_"]) {
        width: 100%;
        height: 100%;
    }
</style>
