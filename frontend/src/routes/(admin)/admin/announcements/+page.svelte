<script lang="ts">
    import { useAdminAnnouncements } from "$lib/api/queries/announcements";
    import {
        useCreateAnnouncement,
        useUpdateAnnouncement,
        useDeleteAnnouncement,
        type CreateAnnouncementInput,
    } from "$lib/api/mutations/announcements";
    import { Megaphone, Plus, Pencil, Trash2, X } from "@lucide/svelte";
    import { toaster } from "$lib/toaster";
    import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";

    let page = $state(1);
    let limit = $state(25);

    const announcementsQuery = useAdminAnnouncements(() => ({ page, limit }));
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();
    const deleteMutation = useDeleteAnnouncement();

    // Modal state
    let isModalOpen = $state(false);
    let showDeleteConfirm = $state(false);
    let announcementToDelete = $state<string | null>(null);
    let editingId = $state<string | null>(null);
    let formData = $state<CreateAnnouncementInput>({
        title: "",
        content: "",
        type: "info",
        is_active: true,
        start_date: undefined,
        end_date: undefined,
    });

    function openCreateModal() {
        editingId = null;
        formData = {
            title: "",
            content: "",
            type: "info",
            is_active: true,
            start_date: undefined,
            end_date: undefined,
        };
        isModalOpen = true;
    }

    function openEditModal(announcement: any) {
        editingId = announcement.id;
        formData = {
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            is_active: announcement.is_active,
            start_date: announcement.start_date || undefined,
            end_date: announcement.end_date || undefined,
        };
        isModalOpen = true;
    }

    function handleSubmit() {
        if (editingId) {
            updateMutation.mutate(
                { id: editingId, ...formData },
                {
                    onSuccess: () => {
                        toaster.success({
                            title: "Announcement updated successfully",
                        });
                        isModalOpen = false;
                    },
                    onError: () =>
                        toaster.error({
                            title: "Failed to update announcement",
                        }),
                },
            );
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    toaster.success({
                        title: "Announcement created successfully",
                    });
                    isModalOpen = false;
                },
                onError: () =>
                    toaster.error({
                        title: "Failed to create announcement",
                    }),
            });
        }
    }

    function handleDelete(id: string) {
        announcementToDelete = id;
        showDeleteConfirm = true;
    }

    function confirmDelete() {
        if (!announcementToDelete) return;
        deleteMutation.mutate(announcementToDelete, {
            onSuccess: () =>
                toaster.success({
                    title: "Announcement deleted",
                }),
            onError: () =>
                toaster.error({
                    title: "Failed to delete announcement",
                }),
        });
        announcementToDelete = null;
    }

    const typeColors = {
        info: "bg-info-500/10 text-info-400 border-info-500/20",
        warning: "bg-warning-500/10 text-warning-400 border-warning-500/20",
        success: "bg-success-500/10 text-success-400 border-success-500/20",
        error: "bg-error-500/10 text-error-400 border-error-500/20",
    };
</script>

<svelte:head>
    <title>Announcements - Gabong Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1
                class="text-2xl font-black text-surface-100 tracking-tight mb-1"
            >
                Announcements
            </h1>
            <p class="text-xs text-surface-400 font-medium">
                Manage site-wide announcements and notifications
            </p>
        </div>

        <button
            onclick={openCreateModal}
            class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-black text-xs rounded-sm transition-colors"
        >
            <Plus size={16} strokeWidth={2.5} />
            Create Announcement
        </button>
    </div>

    {#if announcementsQuery.isLoading}
        <div class="space-y-3">
            {#each Array(5) as _}
                <div
                    class="h-24 bg-surface-800/50 animate-pulse rounded-sm border border-surface-700/50"
                ></div>
            {/each}
        </div>
    {:else if announcementsQuery.data}
        <div class="space-y-3">
            {#each announcementsQuery.data.data as announcement}
                <div
                    class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-4"
                >
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 space-y-2">
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-black text-surface-100">
                                    {announcement.title}
                                </h3>
                                <span
                                    class="px-2 py-0.5 rounded text-[10px] font-black uppercase border {typeColors[
                                        announcement.type
                                    ]}"
                                >
                                    {announcement.type}
                                </span>
                                {#if announcement.is_active}
                                    <span
                                        class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-success-500/10 text-success-400 border border-success-500/20"
                                    >
                                        Active
                                    </span>
                                {:else}
                                    <span
                                        class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-surface-700/50 text-surface-400 border border-surface-600"
                                    >
                                        Inactive
                                    </span>
                                {/if}
                            </div>
                            <p class="text-xs text-surface-300">
                                {announcement.content}
                            </p>
                            {#if announcement.start_date || announcement.end_date}
                                <p class="text-[10px] text-surface-500">
                                    {#if announcement.start_date}
                                        From: {new Date(
                                            announcement.start_date,
                                        ).toLocaleString()}
                                    {/if}
                                    {#if announcement.end_date}
                                        • Until: {new Date(
                                            announcement.end_date,
                                        ).toLocaleString()}
                                    {/if}
                                </p>
                            {/if}
                        </div>

                        <div class="flex items-center gap-2">
                            <button
                                onclick={() => openEditModal(announcement)}
                                class="p-2 hover:bg-surface-800 rounded-sm text-surface-400 hover:text-primary-400 transition-colors"
                            >
                                <Pencil size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                onclick={() => handleDelete(announcement.id)}
                                class="p-2 hover:bg-surface-800 rounded-sm text-surface-400 hover:text-error-400 transition-colors"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Pagination -->
        {#if announcementsQuery.data.pagination.total_pages > 1}
            <div class="flex items-center justify-center gap-2">
                <button
                    onclick={() => (page = Math.max(1, page - 1))}
                    disabled={!announcementsQuery.data.pagination.has_prev}
                    class="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-200 font-bold text-xs rounded-sm transition-colors"
                >
                    Previous
                </button>
                <span class="text-xs font-bold text-surface-300">
                    Page {page} of {announcementsQuery.data.pagination
                        .total_pages}
                </span>
                <button
                    onclick={() => (page = page + 1)}
                    disabled={!announcementsQuery.data.pagination.has_next}
                    class="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed text-surface-200 font-bold text-xs rounded-sm transition-colors"
                >
                    Next
                </button>
            </div>
        {/if}
    {/if}
</div>

<!-- Modal -->
{#if isModalOpen}
    <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        role="dialog"
        tabindex="0"
        aria-modal="true"
        aria-labelledby="modal-title"
        onclick={(e) => {
            if (e.target === e.currentTarget) isModalOpen = false;
        }}
        onkeydown={(e) => {
            if (e.key === "Escape") isModalOpen = false;
        }}
    >
        <div
            class="bg-surface-900 border border-surface-700 rounded-sm p-6 max-w-2xl w-full"
        >
            <div class="flex items-center justify-between mb-6">
                <h2
                    id="modal-title"
                    class="text-lg font-black text-surface-100"
                >
                    {editingId ? "Edit" : "Create"} Announcement
                </h2>
                <button
                    onclick={() => (isModalOpen = false)}
                    class="p-1 hover:bg-surface-800 rounded-sm text-surface-400 hover:text-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>
            </div>

            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                class="space-y-4"
            >
                <div class="space-y-2">
                    <label
                        class="block text-xs font-bold text-surface-200"
                        for="title"
                    >
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        bind:value={formData.title}
                        required
                        class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    />
                </div>

                <div class="space-y-2">
                    <label
                        class="block text-xs font-bold text-surface-200"
                        for="content"
                    >
                        Content
                    </label>
                    <textarea
                        id="content"
                        bind:value={formData.content}
                        required
                        rows="4"
                        class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="type"
                        >
                            Type
                        </label>
                        <select
                            id="type"
                            bind:value={formData.type}
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        >
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="success">Success</option>
                            <option value="error">Error</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="is_active"
                        >
                            Status
                        </label>
                        <label class="flex items-center gap-2">
                            <input
                                type="checkbox"
                                bind:checked={formData.is_active}
                                class="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/20"
                            />
                            <span class="text-xs font-bold text-surface-200">
                                Active
                            </span>
                        </label>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="start_date"
                        >
                            Start Date (Optional)
                        </label>
                        <input
                            id="start_date"
                            type="datetime-local"
                            bind:value={formData.start_date}
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="end_date"
                        >
                            End Date (Optional)
                        </label>
                        <input
                            id="end_date"
                            type="datetime-local"
                            bind:value={formData.end_date}
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <button
                        type="button"
                        onclick={() => (isModalOpen = false)}
                        class="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 font-black text-xs rounded-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending ||
                            updateMutation.isPending}
                        class="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black text-xs rounded-sm transition-colors"
                    >
                        {#if createMutation.isPending || updateMutation.isPending}
                            Saving...
                        {:else}
                            {editingId ? "Update" : "Create"}
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<ConfirmDialog
    bind:open={showDeleteConfirm}
    title="Delete Announcement"
    message="Are you sure you want to delete this announcement?"
    onConfirm={confirmDelete}
    onCancel={() => (announcementToDelete = null)}
/>
