<script lang="ts">
    import { goto } from "$app/navigation";
    import { t } from "$lib/stores/i18n";
    import {
        Bell,
        CheckCircle,
        XCircle,
        MessageCircle,
        Trash2,
    } from "@lucide/svelte";
    import type { Notification } from "$lib/types";
    import {
        useMarkAsRead,
        useDeleteNotification,
    } from "$lib/api/mutations/notifications";
    import { toaster } from "$lib/toaster";

    interface Props {
        notification: Notification;
        compact?: boolean;
    }

    let { notification, compact = false }: Props = $props();

    const markAsReadMutation = useMarkAsRead();
    const deleteMutation = useDeleteNotification();

    // Icon and color based on type
    const typeConfig = {
        video_approved: {
            icon: CheckCircle,
            colorClass: "text-success-400 bg-success-500/10",
        },
        video_rejected: {
            icon: XCircle,
            colorClass: "text-error-400 bg-error-500/10",
        },
        comment_reply: {
            icon: MessageCircle,
            colorClass: "text-info-400 bg-info-500/10",
        },
        system: {
            icon: Bell,
            colorClass: "text-warning-400 bg-warning-500/10",
        },
    };

    const config = $derived(typeConfig[notification.type]);
    const IconComponent = $derived(config.icon);

    // Relative time
    function getRelativeTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return $t("common.justNow");
        if (diffMins < 60) return $t("common.minutesAgo", { values: { n: diffMins } });
        if (diffHours < 24) return $t("common.hoursAgo", { values: { n: diffHours } });
        if (diffDays < 7) return $t("common.daysAgo", { values: { n: diffDays } });
        return date.toLocaleDateString();
    }

    function handleClick() {
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
        }
        if (notification.link) {
            goto(notification.link);
        }
    }

    function handleDelete(e: Event) {
        e.stopPropagation();
        deleteMutation.mutate(notification.id, {
            onSuccess: () => {
                toaster.success({
                    title: "Notification deleted"
                });
            },
            onError: () => {
                toaster.error({
                    title: "Failed to delete notification"
                });
            },
        });
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    }
</script>

<div
    class="group relative flex gap-3 p-3 rounded-sm transition-colors {notification.link
        ? 'cursor-pointer hover:bg-surface-800/50'
        : ''} {!notification.is_read ? 'bg-surface-800/30' : ''}"
    onclick={handleClick}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
>
    <!-- Icon -->
    <div class="flex-shrink-0">
        <div
            class="w-10 h-10 rounded-full {config.colorClass} flex items-center justify-center"
        >
            <IconComponent size={18} strokeWidth={2.5} />
        </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
            <h4
                class="text-xs font-bold text-surface-100 {compact
                    ? 'line-clamp-1'
                    : ''}"
            >
                {notification.title}
            </h4>
            {#if !notification.is_read}
                <span
                    class="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"
                    title="Unread"
                ></span>
            {/if}
        </div>

        {#if notification.message}
            <p
                class="text-[11px] text-surface-400 mt-0.5 {compact
                    ? 'line-clamp-1'
                    : 'line-clamp-2'}"
            >
                {notification.message}
            </p>
        {/if}

        <div class="flex items-center justify-between mt-1.5">
            <span class="text-[10px] text-surface-500">
                {getRelativeTime(notification.created_at)}
            </span>

            {#if !compact}
                <button
                    onclick={handleDelete}
                    class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-700 rounded text-surface-400 hover:text-error-400"
                    title={$t("common.delete")}
                >
                    <Trash2 size={12} strokeWidth={2.5} />
                </button>
            {/if}
        </div>
    </div>
</div>
