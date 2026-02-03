<script lang="ts">
    import { useSendMassNotification } from "$lib/api/mutations/admin";
    import { Bell, Send } from "@lucide/svelte";
    import { toast } from "svelte-sonner";

    const sendMutation = useSendMassNotification();

    let formData = $state({
        title: "",
        message: "",
        link: "",
        target: "all" as "all" | "specific",
        target_user_ids: [] as string[],
    });

    function handleSubmit() {
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        sendMutation.mutate(
            {
                title: formData.title,
                message: formData.message,
                link: formData.link || undefined,
                target_user_ids:
                    formData.target === "all"
                        ? undefined
                        : formData.target_user_ids,
            },
            {
                onSuccess: (data) => {
                    toast.success(
                        `Notification sent to ${data.sent_count} users`,
                    );
                    // Reset form
                    formData = {
                        title: "",
                        message: "",
                        link: "",
                        target: "all",
                        target_user_ids: [],
                    };
                },
                onError: () => {
                    toast.error("Failed to send notification");
                },
            },
        );
    }
</script>

<svelte:head>
    <title>Mass Notifications - Admin Panel</title>
</svelte:head>

<div class="space-y-6 max-w-3xl">
    <div>
        <h1 class="text-2xl font-black text-surface-100 tracking-tight mb-1">
            Mass Notifications
        </h1>
        <p class="text-xs text-surface-400 font-medium">
            Send notifications to all users or specific groups
        </p>
    </div>

    <form
        onsubmit={(e) => {
            e.preventDefault();
            handleSubmit();
        }}
        class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
    >
        <div
            class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
        >
            <Bell size={18} class="text-primary-400" strokeWidth={2.5} />
            <h2 class="text-sm font-black text-surface-100">
                Notification Details
            </h2>
        </div>

        <div class="space-y-4">
            <div class="space-y-2">
                <label
                    class="block text-xs font-bold text-surface-200"
                    for="title"
                >
                    Title <span class="text-error-400">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    bind:value={formData.title}
                    required
                    placeholder="New Feature Released!"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>

            <div class="space-y-2">
                <label
                    class="block text-xs font-bold text-surface-200"
                    for="message"
                >
                    Message <span class="text-error-400">*</span>
                </label>
                <textarea
                    id="message"
                    bind:value={formData.message}
                    required
                    rows="4"
                    placeholder="Check out our new video editor feature..."
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                ></textarea>
            </div>

            <div class="space-y-2">
                <label
                    class="block text-xs font-bold text-surface-200"
                    for="link"
                >
                    Link (Optional)
                </label>
                <input
                    id="link"
                    type="text"
                    bind:value={formData.link}
                    placeholder="/features/editor"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
                <p class="text-[10px] text-surface-500">
                    Users will be redirected here when clicking the notification
                </p>
            </div>

            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200">
                    Target Audience
                </label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input
                            type="radio"
                            bind:group={formData.target}
                            value="all"
                            class="w-4 h-4 border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/20"
                        />
                        <span class="text-xs font-bold text-surface-200">
                            All Users
                        </span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input
                            type="radio"
                            bind:group={formData.target}
                            value="specific"
                            class="w-4 h-4 border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/20"
                        />
                        <span class="text-xs font-bold text-surface-200">
                            Specific Users (Coming Soon)
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
            <button
                type="button"
                onclick={() => {
                    formData = {
                        title: "",
                        message: "",
                        link: "",
                        target: "all",
                        target_user_ids: [],
                    };
                }}
                class="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 font-black text-xs rounded-sm transition-colors"
            >
                Clear
            </button>
            <button
                type="submit"
                disabled={sendMutation.isPending}
                class="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-sm transition-colors"
            >
                {#if sendMutation.isPending}
                    Sending...
                {:else}
                    <Send size={14} strokeWidth={2.5} />
                    Send Notification
                {/if}
            </button>
        </div>
    </form>

    <!-- Info Box -->
    <div
        class="bg-info-500/10 border border-info-500/20 rounded-sm p-4 flex gap-3"
    >
        <div class="flex-shrink-0">
            <Bell size={16} class="text-info-400" strokeWidth={2.5} />
        </div>
        <div class="space-y-1">
            <h3 class="text-xs font-black text-info-400">
                About Mass Notifications
            </h3>
            <p class="text-[11px] text-surface-300 leading-relaxed">
                Mass notifications are sent to users' notification inbox. They
                will see a notification badge and can click to read the message.
                Use this feature sparingly to avoid notification fatigue.
            </p>
        </div>
    </div>
</div>
