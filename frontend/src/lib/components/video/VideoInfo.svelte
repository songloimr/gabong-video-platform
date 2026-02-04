<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import {
    ThumbsUp,
    Calendar,
    Share2,
    Bookmark,
    Flag,
    User,
  } from "@lucide/svelte";
  import moment from "moment";
  import type { Video } from "$lib/types";
  import { requireAuth } from "$lib/utils/requireAuth";
  import { browser } from "$app/environment";
  import { getAvatarUrl } from "$lib/utils/formatters";
  import { page } from "$app/state";
  import type { LayoutData } from "../../../routes/(app)/$types";

  let {
    video,
    onLike,
    onWatchLater,
    onShare,
    isLiked = false,
    isSaved = false,
  }: {
    video: Video;
    onLike?: () => void;
    onWatchLater?: () => void;
    onShare?: () => void;
    isLiked?: boolean;
    isSaved?: boolean;
  } = $props();

  const { siteSettings } = $derived(page.data as LayoutData);

  function formatDate(dateString: string): string {
    return moment(dateString).fromNow();
  }
</script>

<div
  class="bg-surface-900/50 border border-surface-800/50 rounded-md p-2 animate-fade-in"
>
  <div class="flex flex-col gap-3">
    <!-- Row 1: Actions Grid -->
    <div class="grid grid-cols-4 gap-2">
      <button
        onclick={() => {
          if (requireAuth()) onLike?.();
        }}
        class="flex items-center justify-center gap-1 py-2 rounded-md transition-all {isLiked
          ? 'bg-primary-600 text-white'
          : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}"
        title={$t("video.like")}
      >
        <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
        <span class="text-[9px] font-black uppercase tracking-tighter"
          >{(video.likes_count || 0).toLocaleString()}</span
        >
      </button>

      <button
        onclick={() => {
          if (requireAuth()) onWatchLater?.();
        }}
        class="flex items-center justify-center gap-1 py-2 rounded-md transition-all {isSaved
          ? 'bg-secondary-600 text-white'
          : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}"
        title={$t("video.save")}
      >
        <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
        <span class="text-[9px] font-black uppercase tracking-tighter"
          >{$t("video.save")}</span
        >
      </button>

      <button
        onclick={onShare}
        class="flex items-center justify-center gap-1 py-2 rounded-md bg-surface-800 text-surface-300 hover:bg-surface-700 transition-all"
        title={$t("video.share")}
      >
        <Share2 size={14} />
        <span class="text-[9px] font-black uppercase tracking-tighter"
          >{$t("video.share")}</span
        >
      </button>

      <a
        href="mailto:{siteSettings.contact_email}?subject=Report Video: {video.title}&body=I would like to report this video: {browser
          ? window.location.href
          : ''}"
        class="flex items-center justify-center gap-1 py-2 rounded-md bg-surface-800 text-surface-300 hover:bg-red-900/40 hover:text-red-400 transition-all"
        title={$t("video.report")}
      >
        <Flag size={14} />
        <span class="text-[9px] font-black uppercase tracking-tighter"
          >{$t("video.report")}</span
        >
      </a>
    </div>

    <!-- Row 2: User Info & Date -->
    <div
      class="flex items-center justify-between px-1 pt-2 border-t border-surface-800/30"
    >
      <div class="flex items-center gap-2">
        {#if video.user?.avatar_url}
          <img
            src={getAvatarUrl(video.user.avatar_url)}
            alt={video.user.username}
            loading="lazy"
            decoding="async"
            class="w-6 h-6 rounded-full object-cover border border-surface-700"
          />
        {:else}
          <div
            class="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center border border-surface-700"
          >
            <User size={12} class="text-surface-500" />
          </div>
        {/if}
        <div class="flex flex-col">
          <span
            class="text-[10px] font-black text-surface-200 uppercase tracking-wide truncate max-w-30"
          >
            {video.user?.username || $t("video.anonymous")}
          </span>
        </div>
      </div>

      <div
        class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-surface-500"
      >
        <Calendar size={12} class="opacity-50" />
        <span>{formatDate(video.published_at!)}</span>
      </div>
    </div>
  </div>
</div>
