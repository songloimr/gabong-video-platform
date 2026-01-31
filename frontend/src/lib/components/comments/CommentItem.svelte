<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import {
    Trash2,
    Reply,
    EyeOff,
    Eye,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    LoaderCircle,
  } from "@lucide/svelte";
  import moment from "moment";
  import CommentForm from "./CommentForm.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { getAvatarUrl } from "$lib/utils/formatters";
  import { useComments } from "$lib/api/queries/comments";
  import {
    useDeleteComment,
    useHideComment,
  } from "$lib/api/mutations/comments";
  import Self from "./CommentItem.svelte";
  import TimestampedText from "$lib/components/common/TimestampedText.svelte";

  let {
    comment,
    depth = 0,
    videoId,
    onSeek,
  }: {
    comment: any;
    depth?: number;
    videoId: string;
    onSeek?: (seconds: number) => void;
  } = $props();

  let showReplyForm = $state(false);
  let showReplies = $state(false);

  const repliesQuery = useComments(
    () => videoId,
    () => comment.id,
    () => showReplies,
  );

  const deleteMutation = useDeleteComment();
  const hideMutation = useHideComment();

  let replies = $derived(
    repliesQuery.data?.pages.flatMap((page) => page.data) ?? [],
  );
  let hasNextPage = $derived(repliesQuery.hasNextPage);
  let isFetchingNextPage = $derived(repliesQuery.isFetchingNextPage);

  function formatDate(dateString: string): string {
    return moment(dateString).fromNow();
  }

  function handleDelete() {
    if (confirm($t("common.delete"))) {
      deleteMutation.mutate(comment.id);
    }
  }

  function toggleHide() {
    hideMutation.mutate({
      commentId: comment.id,
      isHidden: !comment.is_hidden,
    });
  }

  function handleReplyClick() {
    showReplyForm = !showReplyForm;
  }

  function onReplySuccess() {
    showReplyForm = false;
    showReplies = true; // Show replies after successfully replying
    repliesQuery.refetch();
  }

  function toggleReplies() {
    showReplies = !showReplies;
  }
</script>

<div
  class="group flex gap-3 transition-all duration-300 {comment.is_hidden
    ? 'border-l-4 border-red-500 bg-red-950/5 opacity-70'
    : 'hover:bg-surface-900/5'}"
  style="margin-left: {depth > 0 ? 0 : 0}px;"
>
  <div class="flex-shrink-0 pt-0.5">
    {#if comment.user?.avatar_url}
      {@const avatarSize = depth > 0 ? 24 : 36}
      <img
        src={getAvatarUrl(comment.user.avatar_url)}
        alt={comment.user.username}
        loading="lazy"
        decoding="async"
        class="rounded-full object-cover ring-2 ring-surface-800/50 shadow-sm"
        style="width: {avatarSize}px; height: {avatarSize}px;"
      />
    {:else}
      {@const avatarSize = depth > 0 ? 24 : 36}
      <div
        class="rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-surface-800/50 shadow-sm"
        style="width: {avatarSize}px; height: {avatarSize}px;"
      >
        {comment.user?.username?.charAt(0).toUpperCase() || "?"}
      </div>
    {/if}
  </div>

  <div class="flex-1 relative">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="font-bold text-surface-50 text-[13px]">
          @{comment.user?.username}
        </span>
        <span class="text-xs text-surface-500 font-medium">
          {formatDate(comment.created_at)}
        </span>
      </div>

      <div class="flex items-center gap-1">
        {#if auth.getUserRole() === "admin"}
          <button
            onclick={toggleHide}
            class="p-1.5 rounded-lg hover:bg-surface-800 transition-colors text-surface-400"
            title={comment.is_hidden ? "Show" : "Hide"}
          >
            {#if comment.is_hidden}
              <Eye size={14} class="text-success-500" />
            {:else}
              <EyeOff size={14} class="text-warning-500" />
            {/if}
          </button>
        {/if}

        {#if comment.is_hidden}
          <span
            class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 uppercase tracking-tight"
          >
            Hidden by Admin
          </span>
        {/if}
      </div>
    </div>

    <!-- Content -->
    <p class="text-surface-200 text-sm leading-relaxed whitespace-pre-wrap">
      <TimestampedText text={comment.content} {onSeek} />
    </p>

    <!-- Actions -->
    <div class="flex items-center gap-4 text-xs font-semibold my-1">
      <button
        onclick={handleReplyClick}
        class="flex items-center gap-1.5 text-surface-400 hover:text-primary-400 transition-colors"
      >
        <Reply size={14} />
        <span>{$t("comment.reply")}</span>
      </button>

      {#if auth.user?.id === comment.user_id || auth.getUserRole() === "admin"}
        <button
          onclick={handleDelete}
          disabled={deleteMutation.isPending}
          class="flex items-center gap-1.5 py-1 text-surface-400 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
          <span>{$t("comment.delete")}</span>
        </button>
      {/if}
    </div>

    {#if showReplyForm}
      <div class="py-2">
        <CommentForm
          {videoId}
          parentId={comment.id}
          onSuccess={onReplySuccess}
          onCancel={handleReplyClick}
        />
      </div>
    {/if}

    <!-- Replies Toggle -->
    {#if comment.replies_count > 0}
      <button
        onclick={toggleReplies}
        class="flex items-center gap-2 text-primary-500 hover:text-primary-400 text-sm font-bold transition-colors"
      >
        {#if showReplies}
          <ChevronUp size={16} />
          <span>Hide replies</span>
        {:else}
          <ChevronDown size={16} />
          <MessageSquare size={14} />
          <span>Show {comment.replies_count} replies</span>
        {/if}
      </button>
    {/if}

    <!-- Vertical Line connecting parent to children -->
    {#if showReplies && replies.length > 0}
      <div
        class="absolute left-[-30px] top-[40px] bottom-[28px] w-px bg-surface-800/60"
      ></div>
    {/if}

    <!-- Nested Replies -->
    {#if showReplies}
      <div class="mt-4 space-y-6 ml-[-12px]">
        {#if repliesQuery.isLoading}
          <div class="flex items-center gap-2 py-2 text-surface-500 text-xs">
            <LoaderCircle size={12} class="animate-spin" />
            <span>Loading replies...</span>
          </div>
        {:else}
          {#each replies as reply (reply.id)}
            <div class="relative">
              <!-- Curved Branch Line -->
              <div
                class="absolute left-[-18px] top-[-24px] w-[18px] h-[42px] border-l border-b border-surface-800/60 rounded-bl-xl"
              ></div>
              <Self comment={reply} depth={depth + 1} {videoId} {onSeek} />
            </div>
          {/each}

          {#if hasNextPage}
            <div class="relative">
              <!-- Curved Branch Line for Load More -->
              <div
                class="absolute left-[-18px] top-[-24px] w-[18px] h-[38px] border-l border-b border-surface-800/60 rounded-bl-xl"
              ></div>
              <button
                onclick={() => repliesQuery.fetchNextPage()}
                disabled={isFetchingNextPage}
                class="text-xs font-bold text-primary-500 hover:text-primary-400 py-2 flex items-center gap-2 ml-2"
              >
                {#if isFetchingNextPage}
                  <LoaderCircle size={12} class="animate-spin" />
                {/if}
                {$t("common.loadMoreReplies") || "View more replies"}
              </button>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</div>
