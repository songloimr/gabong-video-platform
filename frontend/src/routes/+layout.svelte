<script lang="ts">
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { queryClient } from "$lib/api/client";
	import { isLoading } from "svelte-i18n";
	import { Toast } from "@skeletonlabs/skeleton-svelte";
	import { toaster } from "$lib/toaster";
	import "./layout.css";
	import "vidstack/player/styles/default/theme.css";
	import "vidstack/player/styles/default/layouts/video.css";

	import LoginModal from "$lib/components/auth/LoginModal.svelte";
	import ErrorDialog from "$lib/components/ui/ErrorDialog.svelte";

	let { children } = $props();
</script>

<QueryClientProvider client={queryClient}>
	<LoginModal />
	<ErrorDialog />
	<Toast.Group {toaster}>
		{#snippet children(toast)}
			<Toast {toast}>
				<Toast.Message>
					<Toast.Title>{toast.title}</Toast.Title>
					<Toast.Description>{toast.description}</Toast.Description>
				</Toast.Message>
				<Toast.CloseTrigger />
			</Toast>
		{/snippet}
	</Toast.Group>

	{#if $isLoading}
		<div class="flex h-screen items-center justify-center bg-surface-950">
			<div class="relative">
				<div
					class="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin"
				></div>
				<div class="absolute inset-0 flex items-center justify-center">
					<div
						class="w-8 h-8 bg-primary-600/10 rounded-full animate-pulse"
					></div>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="min-h-screen bg-surface-950 text-surface-100 flex flex-col selection:bg-primary-500/30 selection:text-primary-100"
		>
			{@render children()}
		</div>
	{/if}
</QueryClientProvider>
