<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { Bell } from "@lucide/svelte";
  import { useNotificationCount } from "$lib/api/queries/notifications";
  import NotificationDropdown from "./NotificationDropdown.svelte";
  import { Popover } from "@skeletonlabs/skeleton-svelte";

  // Poll for unread notifications every 30 seconds (as per PRD)
  const notificationCountQuery = useNotificationCount();

  let open = $state(false);

  const unreadCount = $derived(notificationCountQuery.data || 0);

  function closeDropdown() {
    open = false;
  }
</script>

<Popover
  {open}
  onOpenChange={(e) => (open = e.open)}
  positioning={{ placement: "bottom-end", gutter: 8 }}
>
  <Popover.Trigger
    class="relative p-2 text-surface-300 hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
    aria-label={unreadCount > 0 ? $t("common.unreadNotifications", { values: { count: unreadCount } }) : $t("common.notifications")}
  >
    <Bell size={20} />
    {#if unreadCount > 0}
      <span
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg shadow-red-500/20"
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    {/if}
  </Popover.Trigger>

  <Popover.Positioner>
    <Popover.Content class="focus:outline-none">
      <NotificationDropdown onClose={closeDropdown} />
    </Popover.Content>
  </Popover.Positioner>
</Popover>
