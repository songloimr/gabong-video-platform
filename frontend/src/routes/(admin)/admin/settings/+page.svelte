<script lang="ts">
    import { toaster } from "$lib/toaster";
    import { Switch } from "@skeletonlabs/skeleton-svelte";
    import type { SiteSettings } from "$lib/types";
    import RateLimitSettings from "$lib/components/admin/RateLimitSettings.svelte";

    import {
        useAdminSiteSettings,
    } from "$lib/api/queries/site-settings";
    import {
        useUpdateSiteSettings,
        useTestR2Connection,
    } from "$lib/api/mutations/site-settings";
    import {
        Settings,
        Upload,
        HardDrive,
        Cog,
        Zap,
        Film,
    } from "@lucide/svelte";

    const settingsQuery = useAdminSiteSettings();
    const updateMutation = useUpdateSiteSettings();
    const testR2Mutation = useTestR2Connection();

    // Form state with proper typing
    let formData = $state<Partial<SiteSettings>>({});
    let isInitialized = $state(false);

    // Sync form data when settings load
    $effect(() => {
        if (settingsQuery.isSuccess && settingsQuery.data && !isInitialized) {
            Object.assign(formData, settingsQuery.data);
            isInitialized = true;
        }
    });

    // Reset initialization when data changes (e.g., after refetch)
    function resetForm() {
        if (settingsQuery.data) {
            Object.assign(formData, settingsQuery.data);
        }
    }

    const availableFormats = [
        { label: "MP4 (.mp4)", mime: "video/mp4" },
        { label: "WebM (.webm)", mime: "video/webm" },
        { label: "OGG (.ogg)", mime: "video/ogg" },
        { label: "QuickTime (.mov)", mime: "video/quicktime" },
        { label: "AVI (.avi)", mime: "video/x-msvideo" },
        { label: "Matroska (.mkv)", mime: "video/x-matroska" },
    ];

    function toggleFormat(mime: string, checked: boolean) {
        if (!formData.allowed_video_formats) {
            formData.allowed_video_formats = [];
        }

        if (checked) {
            if (!formData.allowed_video_formats.includes(mime)) {
                formData.allowed_video_formats = [
                    ...formData.allowed_video_formats,
                    mime,
                ];
            }
        } else {
            formData.allowed_video_formats =
                formData.allowed_video_formats.filter((m) => m !== mime);
        }
    }

    function handleSubmit() {
        updateMutation.mutate(formData, {
            onSuccess: () => {
                toaster.success({
                    title: "Settings updated successfully",
                });
            },
            onError: (error: any) => {
                toaster.error({
                    title: "Failed to update settings",
                    description: error?.message || "Please try again",
                });
            },
        });
    }
</script>

<svelte:head>
    <title>Settings - Gabong Admin</title>
</svelte:head>

<div class="space-y-6">
    <div>
        <h1 class="text-2xl font-black text-surface-100 tracking-tight mb-1">
            System Settings
        </h1>
        <p class="text-xs text-surface-400 font-medium">
            Configure platform settings and integrations
        </p>
    </div>

    {#if settingsQuery.isLoading}
        <div class="space-y-6">
            {#each Array(4) as _, i (i)}
                <div
                    class="h-48 bg-surface-800/50 animate-pulse rounded-sm border border-surface-700/50"
                ></div>
            {/each}
        </div>
    {:else if settingsQuery.data}
        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            class="space-y-6"
        >
            <!-- General Settings -->
            <div
                class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
            >
                <div
                    class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
                >
                    <Settings
                        size={18}
                        class="text-primary-400"
                        strokeWidth={2.5}
                    />
                    <h2 class="text-sm font-black text-surface-100">
                        General Settings
                    </h2>
                </div>

                <div class="space-y-4">
                    <Switch
                        checked={formData.age_verification_enabled!}
                        onCheckedChange={(details) =>
                            (formData.age_verification_enabled =
                                details.checked)}
                        class="flex items-center gap-3"
                    >
                        <Switch.Control
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                            {formData.age_verification_enabled
                                ? 'bg-primary-500'
                                : 'bg-surface-700'}"
                        >
                            <Switch.Thumb
                                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200
                                {formData.age_verification_enabled
                                    ? 'translate-x-6'
                                    : 'translate-x-1'}"
                            />
                        </Switch.Control>
                        <Switch.Label
                            class="text-xs font-bold text-surface-200 cursor-pointer select-none"
                            >Show +18 Age Verification Popup</Switch.Label
                        >
                        <Switch.HiddenInput />
                    </Switch>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="ga_code"
                        >
                            Google Analytics Code
                        </label>
                        <textarea
                            id="ga_code"
                            bind:value={formData.google_analytics_code}
                            placeholder="Copy Google Analytics code here"
                            rows="4"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        ></textarea>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="custom_head_html"
                        >
                            Custom Head HTML
                        </label>
                        <textarea
                            id="custom_head_html"
                            bind:value={formData.custom_head_html}
                            placeholder="Add meta tags or external scripts here"
                            rows="4"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        ></textarea>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="custom_body_html"
                        >
                            Custom Body HTML
                        </label>
                        <textarea
                            id="custom_body_html"
                            bind:value={formData.custom_body_html}
                            placeholder="Add scripts or CSS here"
                            rows="4"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        ></textarea>
                    </div>
                </div>
            </div>

            <!-- Upload Settings -->
            <div
                class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
            >
                <div
                    class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
                >
                    <Upload size={18} class="text-info-400" strokeWidth={2.5} />
                    <h2 class="text-sm font-black text-surface-100">
                        Upload Limits
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="max_upload_size"
                        >
                            Max Upload Size (MB)
                        </label>
                        <input
                            id="max_upload_size"
                            type="number"
                            bind:value={formData.max_upload_size_mb}
                            min="1"
                            max="5000"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="max_video_duration"
                        >
                            Max Video Duration (seconds)
                        </label>
                        <input
                            id="max_video_duration"
                            type="number"
                            bind:value={formData.max_video_duration}
                            min="60"
                            max="3600"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="max_files"
                        >
                            Max Files Per Upload
                        </label>
                        <input
                            id="max_files"
                            type="number"
                            bind:value={formData.max_files_per_upload}
                            min="1"
                            max="10"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>
                </div>
            </div>

            <!-- Video Formats -->
            <div
                class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
            >
                <div
                    class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
                >
                    <Film
                        size={18}
                        class="text-secondary-400"
                        strokeWidth={2.5}
                    />
                    <h2 class="text-sm font-black text-surface-100">
                        Allowed Video Formats
                    </h2>
                </div>

                <div class="space-y-4">
                    <p class="text-xs text-surface-400 font-medium">
                        Select which video formats users are allowed to upload
                        to the platform.
                    </p>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {#each availableFormats as format}
                            <label
                                class="flex items-center gap-3 p-3 bg-surface-800/50 border border-surface-700/50 rounded-sm cursor-pointer hover:border-primary-500/50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_video_formats?.includes(
                                        format.mime,
                                    )}
                                    onchange={(e) =>
                                        toggleFormat(
                                            format.mime,
                                            e.currentTarget.checked,
                                        )}
                                    class="w-4 h-4 rounded-sm border-surface-600 bg-surface-900 text-primary-500 focus:ring-primary-500/20"
                                />
                                <span class="text-xs font-bold text-surface-100"
                                    >{format.label}</span
                                >
                            </label>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- R2 Storage Settings -->
            <div
                class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
            >
                <div
                    class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
                >
                    <HardDrive
                        size={18}
                        class="text-warning-400"
                        strokeWidth={2.5}
                    />
                    <h2 class="text-sm font-black text-surface-100">
                        Cloudflare R2 Storage
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="r2_account_id"
                        >
                            Account ID
                        </label>
                        <input
                            id="r2_account_id"
                            type="text"
                            bind:value={formData.r2_account_id}
                            placeholder="your-account-id"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="r2_access_key"
                        >
                            Access Key ID
                        </label>
                        <input
                            id="r2_access_key"
                            type="text"
                            bind:value={formData.r2_access_key_id}
                            placeholder="access-key-id"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="r2_secret"
                        >
                            Secret Access Key
                        </label>
                        <input
                            id="r2_secret"
                            type="password"
                            bind:value={formData.r2_secret_access_key}
                            placeholder="••••••••"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="r2_bucket"
                        >
                            Bucket Name
                        </label>
                        <input
                            id="r2_bucket"
                            type="text"
                            bind:value={formData.r2_bucket}
                            placeholder="gabong-videos"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <!-- Test Connection Button -->
                    <div class="md:col-span-2 pt-2">
                        <button
                            type="button"
                            disabled={testR2Mutation.isPending}
                            onclick={() => {
                                testR2Mutation.mutate(undefined, {
                                    onSuccess: (result) => {
                                        if (result.success) {
                                            toaster.success({
                                                title: "R2 Connection Successful",
                                                description: `Connected to bucket: ${result.bucketName}`,
                                            });
                                        } else {
                                            toaster.error({
                                                title: "R2 Connection Failed",
                                                description: result.message,
                                            });
                                        }
                                    },
                                    onError: (error: any) => {
                                        toaster.error({
                                            title: "R2 Connection Failed",
                                            description:
                                                error?.message ||
                                                "Unable to connect to R2 storage",
                                        });
                                    },
                                });
                            }}
                            class="inline-flex items-center gap-2 px-4 py-2 bg-warning-500/10 hover:bg-warning-500/20 border border-warning-500/30 text-warning-400 font-bold text-xs rounded-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Zap
                                size={14}
                                strokeWidth={2.5}
                                class={testR2Mutation.isPending
                                    ? "animate-pulse"
                                    : ""}
                            />
                            {#if testR2Mutation.isPending}
                                Testing...
                            {:else}
                                Test Connection
                            {/if}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Rate Limit & Restrictions -->
            <RateLimitSettings bind:formData />

            <!-- FFMPEG Configuration -->
            <div
                class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
            >
                <div
                    class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
                >
                    <Cog size={18} class="text-success-400" strokeWidth={2.5} />
                    <h2 class="text-sm font-black text-surface-100">
                        FFMPEG Configuration
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-2 md:col-span-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="ffmpeg_path"
                        >
                            FFmpeg Binary Path
                        </label>
                        <input
                            id="ffmpeg_path"
                            type="text"
                            bind:value={formData.ffmpeg_path}
                            placeholder="/usr/bin/ffmpeg (leave empty for system PATH)"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="ffmpeg_processes"
                        >
                            Max Concurrent Processes
                        </label>
                        <input
                            id="ffmpeg_processes"
                            type="number"
                            bind:value={formData.ffmpeg_max_processes}
                            min="1"
                            max="8"
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        />
                    </div>

                    <div class="space-y-2 md:col-span-3">
                        <label
                            class="block text-xs font-bold text-surface-200"
                            for="ffmpeg_preset"
                        >
                            Video Conversion Speed
                        </label>
                        <select
                            id="ffmpeg_preset"
                            bind:value={formData.ffmpeg_preset}
                            class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                        >
                            <option value="ultrafast"
                                >Ultrafast (lowest quality)</option
                            >
                            <option value="superfast">Superfast</option>
                            <option value="veryfast">Very Fast</option>
                            <option value="faster">Faster</option>
                            <option value="fast">Fast</option>
                            <option value="medium">Medium (balanced)</option>
                            <option value="slow">Slow</option>
                            <option value="slower">Slower</option>
                            <option value="veryslow"
                                >Very Slow (highest quality)</option
                            >
                        </select>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-sm transition-colors duration-200"
                >
                    {#if updateMutation.isPending}
                        Saving...
                    {:else}
                        Save Settings
                    {/if}
                </button>
            </div>
        </form>
    {/if}
</div>
