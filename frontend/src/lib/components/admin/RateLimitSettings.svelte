<script lang="ts">
    import { Shield } from "@lucide/svelte";
    import type { SiteSettings } from "$lib/types";

    let { formData = $bindable() } = $props<{
        formData: Partial<SiteSettings>;
    }>();
</script>

<div class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6">
    <div class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4">
        <Shield size={18} class="text-error-400" strokeWidth={2.5} />
        <h2 class="text-sm font-black text-surface-100">
            Rate Limit & Restrictions
        </h2>
    </div>

    <!-- Cache Settings -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-surface-300 uppercase tracking-wider">Cache Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="cache_ttl">
                    Cache TTL (minutes)
                </label>
                <input
                    id="cache_ttl"
                    type="number"
                    bind:value={formData.cache_ttl_minutes}
                    min="1"
                    max="60"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
        </div>
    </div>

    <!-- Global Rate Limit -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-surface-300 uppercase tracking-wider">Global Rate Limit</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="rate_limit_req">
                    Max requests
                </label>
                <input
                    id="rate_limit_req"
                    type="number"
                    bind:value={formData.global_rate_limit_requests}
                    min="1"
                    max="1000"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="rate_limit_sec">
                    Per seconds
                </label>
                <input
                    id="rate_limit_sec"
                    type="number"
                    bind:value={formData.global_rate_limit_seconds}
                    min="10"
                    max="3600"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
        </div>
    </div>

    <!-- Upload Restrictions -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-surface-300 uppercase tracking-wider">Upload Restrictions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="new_account_wait">
                    New account wait (hours)
                </label>
                <input
                    id="new_account_wait"
                    type="number"
                    bind:value={formData.new_account_wait_hours}
                    min="0"
                    max="168"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="daily_upload_limit">
                    Daily upload limit
                </label>
                <input
                    id="daily_upload_limit"
                    type="number"
                    bind:value={formData.daily_upload_limit}
                    min="1"
                    max="100"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
        </div>
    </div>

    <!-- Comment Limits -->
    <div class="space-y-4">
        <h3 class="text-xs font-bold text-surface-300 uppercase tracking-wider">Comment Limits</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="comment_cooldown">
                    Comment cooldown (seconds)
                </label>
                <input
                    id="comment_cooldown"
                    type="number"
                    bind:value={formData.comment_cooldown_seconds}
                    min="5"
                    max="300"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-xs font-bold text-surface-200" for="comment_daily_limit">
                    Daily comment limit
                </label>
                <input
                    id="comment_daily_limit"
                    type="number"
                    bind:value={formData.comment_daily_limit}
                    min="1"
                    max="500"
                    class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
            </div>
        </div>
    </div>
</div>
