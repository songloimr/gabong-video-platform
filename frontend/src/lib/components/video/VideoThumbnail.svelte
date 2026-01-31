<script lang="ts">
    import { t } from "$lib/stores/i18n";

    interface Props {
        url: string | null;
        title: string;
    }

    let { url, title }: Props = $props();
</script>

{#if url}
    <img src={url} alt={title} loading="lazy" decoding="async" class="w-full h-full object-cover" />
{:else}
    <div class="w-full h-full bg-surface-700 flex items-center justify-center">
        <span class="text-xs text-surface-400">{$t("video.noImage")}</span>
    </div>
{/if}
