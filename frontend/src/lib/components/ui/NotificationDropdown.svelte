<script lang="ts">
    import { goto } from "$app/navigation";
    import { Bell, X } from "@lucide/svelte";
    import { useNotifications } from "$lib/api/queries/notifications";
    import { useMarkAllAsRead } from "$lib/api/mutations/notifications";
    import NotificationItem from "./NotificationItem.svelte";
    import { toaster } from "$lib/toaster";

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    const notificationsQuery = useNotifications(undefined, 1, 10);
    const markAllMutation = useMarkAllAsRead();

    function handleMarkAllAsRead() {
        markAllMutation.mutate(undefined, {
            onSuccess: () => {
                toaster.success({
                    title: "All notifications marked as read"
                });
            },
            onError: () => {
                toaster.error({
                    title: "Failed to mark notifications as read"
                });
            },
        });
    }

    function handleViewAll() {
        onClose();
        goto("/profile/notifications");
    }
</script>

<!-- Dropdown Panel -->
<div
    class="w-96 max-w-[calc(100vw-2rem)] bg-surface-900 border border-surface-700 rounded-sm shadow-xl"
>
    <!-- Header -->
    <div
        class="flex items-center justify-between px-4 py-3 border-b border-surface-700"
    >
        <div class="flex items-center gap-2">
            <Bell size={16} class="text-primary-400" strokeWidth={2.5} />
            <h3 class="text-xs font-black text-surface-100">Notifications</h3>
            {#if notificationsQuery.data?.unread_count}
                <span
                    class="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-bold rounded"
                >
                    {notificationsQuery.data.unread_count}
                </span>
            {/if}
        </div>
        <button
            onclick={onClose}
            class="p-1 hover:bg-surface-800 rounded text-surface-400 hover:text-surface-200 transition-colors"
            title="Close"
        >
            <X size={14} strokeWidth={2.5} />
        </button>
    </div>

    <!-- Notifications List -->
    <div class="max-h-[400px] overflow-y-auto">
        {#if notificationsQuery.isLoading}
            <div class="p-8 text-center">
                <div
                    class="inline-block w-6 h-6 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin"
                ></div>
            </div>
        {:else if notificationsQuery.data?.data.length === 0}
            <div class="p-8 text-center">
                <Bell
                    size={32}
                    class="mx-auto text-surface-600 mb-2"
                    strokeWidth={1.5}
                />
                <p class="text-xs font-bold text-surface-400">
                    No notifications
                </p>
                <p class="text-[10px] text-surface-500 mt-1">
                    You're all caught up!
                </p>
            </div>
        {:else if notificationsQuery.data}
            <div class="divide-y divide-surface-800">
                {#each notificationsQuery.data.data as notification (notification.id)}
                    <NotificationItem {notification} compact={true} />
                {/each}
            </div>
        {/if}
    </div>

    <!-- Footer Actions -->
    {#if notificationsQuery.data && notificationsQuery.data.data.length > 0}
        <div
            class="flex items-center justify-between px-4 py-2.5 border-t border-surface-700"
        >
            <button
                onclick={handleMarkAllAsRead}
                disabled={markAllMutation.isPending ||
                    !notificationsQuery.data.unread_count}
                class="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Mark all as read
            </button>
            <button
                onclick={handleViewAll}
                class="text-xs font-bold text-surface-300 hover:text-surface-100 transition-colors flex items-center gap-1"
            >
                View all
                <span class="text-[10px]">→</span>
            </button>
        </div>
    {/if}
</div>
