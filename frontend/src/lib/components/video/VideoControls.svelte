<script lang="ts">
    import { t } from "$lib/stores/i18n";
    import {
        Volume2,
        VolumeX,
        RotateCcw,
        Rewind,
        FastForward,
    } from "@lucide/svelte";

    let {
        isMuted = false,
        onToggleMute,
        onSeek,
        onSpeedChange,
    }: {
        isMuted: boolean;
        onToggleMute: () => void;
        onSeek: (seconds: number | string) => void;
        onSpeedChange?: (rate: number) => void;
    } = $props();

    function handleHoldStart() {
        onSpeedChange?.(2);
    }

    function handleHoldEnd() {
        onSpeedChange?.(1);
    }
</script>

<div
    class="bg-surface-900/50 border border-surface-800/50 rounded-md p-1 sm:p-1.5 mt-2 animate-slide-up"
>
    <div class="flex items-center justify-between gap-1 sm:gap-2">
        <!-- 2X Left -->
        <button
            onmousedown={handleHoldStart}
            onmouseup={handleHoldEnd}
            onmouseleave={handleHoldEnd}
            ontouchstart={handleHoldStart}
            ontouchend={handleHoldEnd}
            class="flex items-center justify-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-md hover:bg-surface-800 transition-all group active:scale-95 text-[9px] sm:text-[10px] font-black uppercase text-surface-500 hover:text-primary-400 select-none"
        >
            2X
        </button>

        <div class="flex items-center justify-center flex-1 gap-1 sm:gap-6">
            <!-- Left: Skip Backward -->
            <div class="flex items-center gap-0.5 sm:gap-1">
                <button
                    onclick={() => onSeek("-60")}
                    class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md hover:bg-surface-800 transition-all group active:scale-95"
                    title={$t("video.skipBackward", { values: { seconds: 60 } })}
                >
                    <Rewind
                        size={16}
                        class="text-surface-500 group-hover:text-primary-600 transition-colors"
                    />
                    <span
                        class="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-surface-400"
                        >60s</span
                    >
                </button>
                <button
                    onclick={() => onSeek("-10")}
                    class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md hover:bg-surface-800 transition-all group active:scale-95"
                    title={$t("video.skipBackward", { values: { seconds: 10 } })}
                >
                    <RotateCcw
                        size={16}
                        class="text-surface-500 group-hover:text-primary-600 transition-colors"
                    />
                    <span
                        class="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-surface-400"
                        >10s</span
                    >
                </button>
            </div>

            <!-- Center: Mute Toggle -->
            <div class="flex items-center px-1 sm:px-2">
                <button
                    onclick={onToggleMute}
                    class="p-2 sm:p-2.5 bg-primary-600 text-white hover:bg-primary-500 rounded-full transition-all shadow-lg shadow-primary-600/20 active:scale-90 flex items-center justify-center"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {#if isMuted}
                        <VolumeX size={16} strokeWidth={2.5} />
                    {:else}
                        <Volume2 size={16} strokeWidth={2.5} />
                    {/if}
                </button>
            </div>

            <!-- Right: Skip Forward -->
            <div class="flex items-center gap-0.5 sm:gap-1">
                <button
                    onclick={() => onSeek("+10")}
                    class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md hover:bg-surface-800 transition-all group active:scale-95"
                    title="+10 Seconds"
                >
                    <span
                        class="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-surface-400"
                        >10s</span
                    >
                    <RotateCcw
                        size={16}
                        class="text-surface-500 group-hover:text-primary-600 transition-colors scale-x-[-1]"
                    />
                </button>
                <button
                    onclick={() => onSeek("+60")}
                    class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md hover:bg-surface-800 transition-all group active:scale-95"
                    title={$t("video.skipForward", { values: { seconds: 60 } })}
                >
                    <span
                        class="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-surface-400"
                        >60s</span
                    >
                    <FastForward
                        size={16}
                        class="text-surface-500 group-hover:text-primary-600 transition-colors"
                    />
                </button>
            </div>
        </div>

        <!-- 2X Right -->
        <button
            onmousedown={handleHoldStart}
            onmouseup={handleHoldEnd}
            onmouseleave={handleHoldEnd}
            ontouchstart={handleHoldStart}
            ontouchend={handleHoldEnd}
            class="flex items-center justify-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-md hover:bg-surface-800 transition-all group active:scale-95 text-[9px] sm:text-[10px] font-black uppercase text-surface-500 hover:text-primary-400 select-none"
        >
            2X
        </button>
    </div>
</div>
