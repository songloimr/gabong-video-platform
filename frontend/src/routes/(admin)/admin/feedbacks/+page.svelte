<script lang="ts">
    import { useAdminFeedbacks } from "$lib/api/queries/feedbacks";
    import { useDeleteFeedback } from "$lib/api/mutations/feedbacks";
    import { MessageSquare, Trash2, Bug, Lightbulb, HelpCircle, User } from "@lucide/svelte";
    import { toaster } from "$lib/toaster";
    import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
    import type { FeedbackType } from "$lib/types";

    let page = $state(1);
    let limit = $state(25);
    let typeFilter = $state<string>("");

    const feedbacksQuery = useAdminFeedbacks(() => ({ page, limit, type: typeFilter || undefined }));
    const deleteMutation = useDeleteFeedback();

    let showDeleteConfirm = $state(false);
    let feedbackToDelete = $state<string | null>(null);

    function handleDelete(id: string) {
        feedbackToDelete = id;
        showDeleteConfirm = true;
    }

    function confirmDelete() {
        if (!feedbackToDelete) return;
        deleteMutation.mutate(feedbackToDelete, {
            onSuccess: () =>
                toaster.success({
                    title: "Xóa feedback thành công",
                }),
            onError: () =>
                toaster.error({
                    title: "Không thể xóa feedback",
                }),
        });
        feedbackToDelete = null;
    }

    const typeConfig: Record<FeedbackType, { icon: typeof Bug; label: string; class: string }> = {
        bug: {
            icon: Bug,
            label: "Báo lỗi",
            class: "bg-error-500/10 text-error-400 border-error-500/20",
        },
        suggestion: {
            icon: Lightbulb,
            label: "Góp ý",
            class: "bg-warning-500/10 text-warning-400 border-warning-500/20",
        },
        other: {
            icon: HelpCircle,
            label: "Khác",
            class: "bg-surface-500/10 text-surface-400 border-surface-500/20",
        },
    };

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<svelte:head>
    <title>Feedbacks - Gabong Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1
                class="text-2xl font-black text-surface-100 tracking-tight mb-1"
            >
                Feedbacks
            </h1>
            <p class="text-xs text-surface-400 font-medium">
                Xem và quản lý feedback từ người dùng
            </p>
        </div>

        <div class="flex items-center gap-3">
            <select
                bind:value={typeFilter}
                class="px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
            >
                <option value="">Tất cả loại</option>
                <option value="bug">Báo lỗi</option>
                <option value="suggestion">Góp ý</option>
                <option value="other">Khác</option>
            </select>
        </div>
    </div>

    {#if feedbacksQuery.isLoading}
        <div class="space-y-3">
            {#each Array(5) as _}
                <div
                    class="h-32 bg-surface-800/50 animate-pulse rounded-sm border border-surface-700/50"
                ></div>
            {/each}
        </div>
    {:else if feedbacksQuery.data && feedbacksQuery.data.data.length > 0}
        <div class="space-y-3">
            {#each feedbacksQuery.data.data as feedback}
                {@const config = typeConfig[feedback.type]}
                <div
                    class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-4"
                >
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 space-y-3">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span
                                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase border {config.class}"
                                >
                                    <svelte:component this={config.icon} size={12} />
                                    {config.label}
                                </span>
                                <h3 class="text-sm font-black text-surface-100">
                                    {feedback.title}
                                </h3>
                            </div>
                            
                            <p class="text-xs text-surface-300 whitespace-pre-wrap">
                                {feedback.content}
                            </p>

                            <div class="flex items-center gap-4 text-[10px] text-surface-500">
                                <span class="flex items-center gap-1">
                                    <User size={12} />
                                    {#if feedback.user}
                                        {feedback.user.username}
                                    {:else}
                                        Guest ({feedback.ip_address || "Unknown"})
                                    {/if}
                                </span>
                                <span>
                                    {formatDate(feedback.created_at)}
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <button
                                onclick={() => handleDelete(feedback.id)}
                                class="p-2 hover:bg-surface-800 rounded-sm text-surface-400 hover:text-error-400 transition-colors"
                                title="Xóa feedback"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Pagination -->
        {#if feedbacksQuery.data.totalPages > 1}
            <div class="flex items-center justify-center gap-2">
                <button
                    onclick={() => (page = Math.max(1, page - 1))}
                    disabled={page <= 1}
                    class="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-200 font-bold text-xs rounded-sm transition-colors"
                >
                    Trước
                </button>
                <span class="text-xs font-bold text-surface-300">
                    Trang {page} / {feedbacksQuery.data.totalPages}
                </span>
                <button
                    onclick={() => (page = page + 1)}
                    disabled={page >= feedbacksQuery.data.totalPages}
                    class="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-200 font-bold text-xs rounded-sm transition-colors"
                >
                    Sau
                </button>
            </div>
        {/if}
    {:else}
        <div class="text-center py-12">
            <MessageSquare size={48} class="mx-auto text-surface-600 mb-4" />
            <p class="text-surface-400 font-medium">Chưa có feedback nào</p>
        </div>
    {/if}
</div>

<ConfirmDialog
    bind:open={showDeleteConfirm}
    title="Xóa Feedback"
    message="Bạn có chắc chắn muốn xóa feedback này?"
    onConfirm={confirmDelete}
    onCancel={() => (feedbackToDelete = null)}
/>
