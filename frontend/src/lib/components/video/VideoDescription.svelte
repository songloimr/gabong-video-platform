<script lang="ts">
    import type { Video } from "$lib/types";
    import { t } from "svelte-i18n";
    import TimestampedText from "$lib/components/common/TimestampedText.svelte";

    let {
        video,
        onSeek,
    }: {
        video: Video;
        onSeek?: (seconds: number) => void;
    } = $props();

    let isExpanded = $state(false);
</script>

<div
    class="bg-surface-900/50 border border-surface-800/50 rounded-md p-4 sm:p-5 mt-4 animate-fade-in"
>
    <div class="space-y-4">
        <div class="space-y-4">
            <div
                class="text-sm text-surface-200 leading-relaxed tiptap-content {isExpanded
                    ? ''
                    : 'line-clamp-3'}"
            >
                {#if video.description}
                    {@html video.description}
                {:else}
                    <span class="italic opacity-50"
                        >{$t("video.noDescription")}</span
                    >
                {/if}
            </div>

            {#if video.description && video.description.length > 200}
                <button
                    onclick={() => (isExpanded = !isExpanded)}
                    class="text-xs font-black uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors pt-2"
                >
                    {isExpanded ? $t("common.showLess") : $t("common.showMore")}
                </button>
            {/if}
        </div>

        <!-- Category & Tags -->
        {#if video.category || (video.tags && video.tags.length > 0)}
            <div
                class="pt-6 border-t border-surface-800/50 flex flex-wrap gap-2"
            >
                {#if video.category}
                    <a
                        href={`/categories/${video.category.slug}`}
                        class="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-primary-500/20 hover:bg-primary-500/20 transition-all"
                    >
                        {video.category.name}
                    </a>
                {/if}
                {#each video.tags || [] as tag}
                    <a
                        href={`/search?tag=${tag.slug}`}
                        class="px-3 py-1.5 bg-surface-800 text-surface-400 text-[10px] font-bold tracking-widest rounded-md hover:bg-surface-700 transition-all"
                    >
                        #{tag.name}
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    @reference "../../../routes/layout.css";

    .tiptap-content :global(h1) {
        @apply text-2xl font-black mb-4 mt-2 text-surface-50;
    }
    .tiptap-content :global(h2) {
        @apply text-xl font-black mb-3 mt-4 text-surface-50;
    }
    .tiptap-content :global(h3) {
        @apply text-lg font-bold mb-2 mt-3 text-surface-50;
    }
    .tiptap-content :global(p) {
        @apply mb-3;
    }
    .tiptap-content :global(ul) {
        @apply list-disc ml-6 mb-4;
    }
    .tiptap-content :global(ol) {
        @apply list-decimal ml-6 mb-4;
    }
    .tiptap-content :global(blockquote) {
        @apply border-l-4 border-primary-500 pl-4 py-2 my-4 bg-surface-800/50 italic text-surface-300 rounded-r-lg;
    }
    .tiptap-content :global(code) {
        @apply bg-surface-800 text-primary-400 px-1.5 py-0.5 rounded font-mono text-sm;
    }
    .tiptap-content :global(pre) {
        @apply bg-surface-950 text-surface-300 p-4 rounded-xl font-mono text-sm my-4 overflow-x-auto border border-surface-800;
    }
    .tiptap-content :global(img) {
        @apply max-w-full h-auto rounded-lg my-4;
    }
    .tiptap-content :global(a) {
        @apply text-primary-400 hover:underline;
    }
    .tiptap-content :global(mark) {
        @apply bg-primary-500/30 text-primary-200 px-1 rounded;
    }

    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
