<script lang="ts">
  import { t } from "svelte-i18n";
  import { Loader2, MessageSquarePlus } from "@lucide/svelte";
  import CommentItem from "./CommentItem.svelte";
  import CommentForm from "./CommentForm.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { useComments } from "$lib/api/queries/comments";

  let {
    videoId,
    onSeek,
  }: {
    videoId: string;
    onSeek?: (seconds: number) => void;
  } = $props();

  const commentsQuery = useComments(() => videoId);

  let total = $derived(commentsQuery.data?.pages[0]?.total ?? 0);
  let comments = $derived(
    commentsQuery.data?.pages.flatMap((page) => page.data) ?? [],
  );
  let hasNextPage = $derived(commentsQuery.hasNextPage);
  let isFetchingNextPage = $derived(commentsQuery.isFetchingNextPage);
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-surface-50 flex items-center gap-2">
      <MessageSquarePlus size={20} class="text-primary-500" />
      {$t("comment.title")}
      <span class="text-sm font-normal text-surface-400">({total})</span>
    </h2>
  </div>

  {#if auth.user}
    <div class="bg-surface-900/40 border border-surface-800/60 rounded-xl p-4">
      <CommentForm {videoId} />
    </div>
  {:else}
    <div
      class="bg-surface-900/40 border border-secondary-500/20 rounded-xl p-4 text-center"
    >
      <p class="text-surface-300 text-sm">
        <a
          href="/auth/login"
          class="text-primary-400 font-bold hover:underline"
        >
          {$t("auth.login")}
        </a>
        {" "} to join the conversation
      </p>
    </div>
  {/if}

  <div class="space-y-4">
    {#if commentsQuery.isLoading}
      <div class="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 class="animate-spin text-primary-500" size={32} />
        <span class="text-surface-400 text-sm">{$t("common.loading")}</span>
      </div>
    {:else if comments.length > 0}
      <div class="flex flex-col gap-3">
        {#each comments as comment (comment.id)}
          <CommentItem {comment} depth={0} {videoId} {onSeek} />
        {/each}
      </div>

      {#if hasNextPage}
        <div class="flex justify-center mt-6">
          <button
            onclick={() => commentsQuery.fetchNextPage()}
            disabled={isFetchingNextPage}
            class="px-6 py-2 rounded-full border border-surface-700 hover:bg-surface-800 text-surface-200 text-sm font-medium transition-all disabled:opacity-50"
          >
            {#if isFetchingNextPage}
              <Loader2 class="animate-spin" size={16} />
            {:else}
              {$t("common.loadMore")}
            {/if}
          </button>
        </div>
      {/if}
    {:else}
      <div
        class="flex flex-col items-center justify-center py-16 text-surface-400 gap-2 bg-surface-900/20 rounded-2xl border border-dashed border-surface-800"
      >
        <p class="text-lg font-medium">{$t("comment.noComments")}</p>
        <p class="text-sm">Be the first to share your thoughts!</p>
      </div>
    {/if}
  </div>
</div>
