<script lang="ts">
  import { X, Info, AlertTriangle, CheckCircle, XCircle } from "@lucide/svelte";
  import { t } from "$lib/stores/i18n";

  interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }

  let { announcements = [] }: { announcements: Announcement[] } = $props();

  let dismissedIds = $state<Set<string>>(new Set());

  const visibleAnnouncements = $derived(
    announcements.filter((a) => !dismissedIds.has(a.id))
  );

  function dismiss(id: string) {
    dismissedIds = new Set([...dismissedIds, id]);
  }

  function getTypeStyles(type: string) {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/90 text-yellow-950';
      case 'success':
        return 'bg-green-500/90 text-green-950';
      case 'error':
        return 'bg-red-500/90 text-red-950';
      default:
        return 'bg-primary-500/90 text-primary-950';
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      default:
        return Info;
    }
  }
</script>

{#if visibleAnnouncements.length > 0}
  <div class="w-full">
    {#each visibleAnnouncements as announcement (announcement.id)}
      {@const Icon = getIcon(announcement.type)}
      <div
        class="relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium {getTypeStyles(announcement.type)}"
      >
        <Icon size={16} strokeWidth={2.5} class="shrink-0" />
        <span class="line-clamp-1">{announcement.title}</span>
        <button
          onclick={() => dismiss(announcement.id)}
          class="absolute right-2 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label={$t("common.close")}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    {/each}
  </div>
{/if}
