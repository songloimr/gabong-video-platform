<script lang="ts">
    import { t } from "$lib/stores/i18n";
    import { Bell } from "@lucide/svelte";
    import { useNotifications } from "$lib/api/queries/notifications";
    import {
        useMarkAllAsRead,
        useDeleteNotification,
    } from "$lib/api/mutations/notifications";
    import NotificationItem from "$lib/components/ui/NotificationItem.svelte";
    import { toaster } from "$lib/toaster";
    import AppPagination from "$lib/components/ui/AppPagination.svelte";

    let currentTab = $state<"all" | "unread" | "read">("all");
    let currentPage = $state(1);
    const limit = 25;

    // Query notifications based on tab
    const isReadParam = $derived(
        currentTab === "all"
            ? undefined
            : currentTab === "unread"
              ? false
              : true,
    );

    const notificationsQuery = $derived(
        useNotifications(isReadParam, currentPage, limit),
    );
    const markAllMutation = useMarkAllAsRead();

    function handleTabChange(tab: "all" | "unread" | "read") {
        currentTab = tab;
        currentPage = 1;
    }

    function handleMarkAllAsRead() {
        markAllMutation.mutate(undefined, {
            onSuccess: () => {
                toaster.success({
                    title: $t("notifications.allMarkedRead")
                });
            },
            onError: () => {
                toaster.error({
                    title: $t("notifications.markReadFailed")
                });
            },
        });
    }

    function handlePageChange(page: number) {
        currentPage = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
</script>

<svelte:head>
    <title>{$t("notifications.title")} - Gabong</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1
                class="text-2xl font-black text-surface-100 tracking-tight mb-1"
            >
                {$t("notifications.title")}
            </h1>
            <p class="text-xs text-surface-400 font-medium">
                {$t("notifications.description")}
            </p>
        </div>

        {#if notificationsQuery.data && currentTab === "all" && notificationsQuery.data.unread_count > 0}
            <button
                onclick={handleMarkAllAsRead}
                disabled={markAllMutation.isPending}
                class="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-400 font-bold text-xs rounded-sm transition-colors disabled:opacity-50"
            >
                {markAllMutation.isPending ? $t("notifications.marking") : $t("notifications.markAllRead")}
            </button>
        {/if}
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-surface-700">
        <button
            onclick={() => handleTabChange("all")}
            class="px-4 py-2 text-xs font-bold transition-colors border-b-2 {currentTab ===
            'all'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'}"
        >
            {$t("common.all")}
            {#if notificationsQuery.data}
                <span class="text-[10px] opacity-70">
                    ({notificationsQuery.data.pagination?.total || 0})
                </span>
            {/if}
        </button>
        <button
            onclick={() => handleTabChange("unread")}
            class="px-4 py-2 text-xs font-bold transition-colors border-b-2 {currentTab ===
            'unread'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'}"
        >
            {$t("common.unread")}
            {#if notificationsQuery.data && notificationsQuery.data.unread_count > 0}
                <span
                    class="ml-1 px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-bold rounded"
                >
                    {notificationsQuery.data.unread_count}
                </span>
            {/if}
        </button>
        <button
            onclick={() => handleTabChange("read")}
            class="px-4 py-2 text-xs font-bold transition-colors border-b-2 {currentTab ===
            'read'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'}"
        >
            {$t("common.read")}
        </button>
    </div>

    <!-- Notifications List -->
    <div class="bg-surface-900/50 border border-surface-700/50 rounded-sm">
        {#if notificationsQuery.isLoading}
            <div class="p-16 text-center">
                <div
                    class="inline-block w-8 h-8 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin"
                ></div>
                <p class="text-xs text-surface-400 mt-4">
                    {$t("notifications.loading")}
                </p>
            </div>
        {:else if notificationsQuery.data && notificationsQuery.data.data.length === 0}
            <div class="p-16 text-center">
                <Bell
                    size={48}
                    class="mx-auto text-surface-600 mb-4"
                    strokeWidth={1.5}
                />
                <h3 class="text-sm font-bold text-surface-300 mb-1">
                    {$t("notifications.noNotifications")}
                </h3>
                <p class="text-xs text-surface-500">
                    {currentTab === "unread"
                        ? $t("notifications.caughtUp")
                        : currentTab === "read"
                          ? $t("notifications.noReadYet")
                          : $t("notifications.noneYet")}
                </p>
            </div>
        {:else if notificationsQuery.data}
            <div class="divide-y divide-surface-800">
                {#each notificationsQuery.data.data as notification (notification.id)}
                    <NotificationItem {notification} />
                {/each}
            </div>

            <!-- Pagination -->
            {#if notificationsQuery.data.pagination}
                <div class="py-6">
                    <AppPagination
                        count={notificationsQuery.data.pagination.total}
                        pageSize={notificationsQuery.data.pagination.limit}
                        page={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            {/if}
        {/if}
    </div>
</div>
