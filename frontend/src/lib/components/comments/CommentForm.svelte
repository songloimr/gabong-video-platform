<script lang="ts">
  import { Send } from "@lucide/svelte";
  import { t } from "$lib/stores/i18n";
  import { useAddComment } from "$lib/api/mutations/comments";
  import { requireAuth } from "$lib/utils/requireAuth";

  let {
    videoId,
    parentId,
    onSuccess,
    onCancel,
  }: {
    videoId: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
  } = $props();

  let content = $state("");
  const addComment = useAddComment();

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!content.trim() || addComment.isPending) return;

    addComment.mutate(
      { videoId, content, parentId },
      {
        onSuccess: () => {
          content = "";
          onSuccess?.();
        },
      },
    );
  }

  function handleCancel() {
    content = "";
    onCancel?.();
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-2">
  <div class="relative group">
    <textarea
      bind:value={content}
      placeholder={$t("comment.placeholder")}
      rows="1"
      disabled={addComment.isPending}
      aria-label={$t("comment.placeholder")}
      class="w-full py-2 bg-transparent border-b border-surface-700/80 text-surface-100 focus:outline-none focus:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all placeholder:text-surface-600 overflow-hidden"
      oninput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = target.scrollHeight + "px";
      }}
    ></textarea>
  </div>

  <div class="flex justify-end gap-2 items-center">
    {#if content.trim() || parentId}
      <button
        type="button"
        onclick={handleCancel}
        class="px-4 py-2 text-surface-400 hover:text-surface-100 text-xs font-bold transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {$t("common.cancel")}
      </button>
      <button
        type="submit"
        disabled={!content.trim() || addComment.isPending}
        class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
      >
        {#if addComment.isPending}
          <div
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></div>
          <span>{$t("common.sending")}</span>
        {:else}
          <span>{$t("comment.post")}</span>
        {/if}
      </button>
    {/if}
  </div>
</form>
