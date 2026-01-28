<script lang="ts">
    import { t } from "svelte-i18n";
    import { AlertCircle, RefreshCcw } from "@lucide/svelte";
    import type { ApiError } from "$lib/types";
    import axios from "axios";

    interface Props {
        error: any;
        reset?: () => void;
        title?: string;
    }

    let { error, reset, title }: Props = $props();

    let message = $derived.by(() => {
        if (!error) return "";
        if (axios.isAxiosError(error)) {
            const apiError = error.response?.data as ApiError;
            if (apiError && apiError.message) {
                return Array.isArray(apiError.message)
                    ? apiError.message[0]
                    : apiError.message;
            }
            return error.message;
        }
        return error instanceof Error ? error.message : String(error);
    });

    let errorTitle = $derived(title || $t("common.error"));
</script>

<div
    class="w-full p-6 bg-red-950/20 border border-red-900/30 rounded-lg animate-fade-in"
>
    <div class="flex items-start gap-4">
        <div class="p-2 bg-red-900/40 rounded-lg text-red-400">
            <AlertCircle size={24} strokeWidth={2.5} />
        </div>

        <div class="flex-1 space-y-1">
            <h3
                class="text-sm font-black uppercase tracking-widest text-red-100"
            >
                {errorTitle}
            </h3>
            <p class="text-sm font-bold text-red-400 leading-relaxed">
                {message}
            </p>

            {#if reset}
                <button
                    onclick={reset}
                    class="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg shadow-red-600/20"
                >
                    <RefreshCcw size={14} strokeWidth={3} />
                    {$t("common.retry")}
                </button>
            {/if}
        </div>
    </div>
</div>
