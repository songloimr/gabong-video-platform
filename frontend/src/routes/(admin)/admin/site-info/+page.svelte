<script lang="ts">
	import { toaster } from "$lib/toaster";
	import type { SiteSettings } from "$lib/types";

	import {
		useAdminSiteSettings,
	} from "$lib/api/queries/site-settings";
	import {
		useUpdateSiteSettings,
	} from "$lib/api/mutations/site-settings";
	import {
		Globe,
		Scale,
	} from "@lucide/svelte";

	const settingsQuery = useAdminSiteSettings();
	const updateMutation = useUpdateSiteSettings();

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

	function handleSubmit() {
		updateMutation.mutate(formData, {
			onSuccess: () => {
				toaster.success({
					title: "Site information updated successfully",
				});
			},
			onError: (error: any) => {
				toaster.error({
					title: "Failed to update site information",
					description: error?.message || "Please try again",
				});
			},
		});
	}
</script>

<svelte:head>
	<title>Site Information - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-black text-surface-100 tracking-tight mb-1">
			Site Information
		</h1>
		<p class="text-xs text-surface-400 font-medium">
			Configure site branding and legal information
		</p>
	</div>

	{#if settingsQuery.isLoading}
		<div class="space-y-6">
			{#each Array(2) as _, i (i)}
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
			<!-- Branding Settings -->
			<div
				class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
			>
				<div
					class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
				>
					<Globe
						size={18}
						class="text-primary-400"
						strokeWidth={2.5}
					/>
					<h2 class="text-sm font-black text-surface-100">
						Branding Settings
					</h2>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="site_name"
						>
							Site Name
						</label>
						<input
							id="site_name"
							type="text"
							bind:value={formData.site_name}
							placeholder="YourSite.com"
							maxlength="100"
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
						<p class="text-xs text-surface-500">
							The name of your website (max 100 characters)
						</p>
					</div>

					<div class="space-y-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="site_tagline"
						>
							Site Tagline
						</label>
						<input
							id="site_tagline"
							type="text"
							bind:value={formData.site_tagline}
							placeholder="Video Streaming Platform"
							maxlength="200"
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
						<p class="text-xs text-surface-500">
							A short description/slogan (max 200 characters)
						</p>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="site_url"
						>
							Site URL
						</label>
						<input
							id="site_url"
							type="url"
							bind:value={formData.site_url}
							placeholder="https://yoursite.com"
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
						<p class="text-xs text-surface-500">
							The full URL of your website (used in sitemaps, emails, and SEO)
						</p>
					</div>
				</div>
			</div>

			<!-- Legal Settings -->
			<div
				class="bg-surface-900/50 border border-surface-700/50 rounded-sm p-6 space-y-6"
			>
				<div
					class="flex items-center gap-2.5 border-b border-surface-700/50 pb-4"
				>
					<Scale size={18} class="text-tertiary-400" strokeWidth={2.5} />
					<h2 class="text-sm font-black text-surface-100">
						Legal Settings
					</h2>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2 md:col-span-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="contact_email"
						>
							Contact Email (for legal inquiries)
						</label>
						<input
							id="contact_email"
							type="email"
							bind:value={formData.contact_email}
							placeholder="admin@example.com"
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-mono text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
						<p class="text-xs text-surface-500">
							This email will be displayed on Terms of Service, Privacy Policy, and Cookie Policy pages.
						</p>
					</div>

					<div class="space-y-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="terms_updated_at"
						>
							Terms of Service Updated
						</label>
						<input
							id="terms_updated_at"
							type="date"
							bind:value={formData.terms_updated_at}
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
					</div>

					<div class="space-y-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="privacy_updated_at"
						>
							Privacy Policy Updated
						</label>
						<input
							id="privacy_updated_at"
							type="date"
							bind:value={formData.privacy_updated_at}
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
					</div>

					<div class="space-y-2">
						<label
							class="block text-xs font-bold text-surface-200"
							for="cookies_updated_at"
						>
							Cookie Policy Updated
						</label>
						<input
							id="cookies_updated_at"
							type="date"
							bind:value={formData.cookies_updated_at}
							class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-sm text-xs font-bold text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
						/>
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
						Save Changes
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
