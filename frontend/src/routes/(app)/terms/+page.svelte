<script lang="ts">
	import { t, currentLocale } from '$lib/stores/i18n';
	import { page } from '$app/state';
	import type { SiteSettings } from '$lib/types';
	import Seo from '$lib/components/Seo.svelte';

	const siteSettings = $derived(page.data?.siteSettings as SiteSettings);

	const contactEmail = $derived(siteSettings.contact_email );
	const updatedAt = $derived(siteSettings.terms_updated_at);

	const formattedDate = $derived.by(() => {
		if (!updatedAt) return '';
		const date = new Date(updatedAt);
		if ($currentLocale === 'vi') {
			return date.toLocaleDateString('vi-VN', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		}
		return date.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	});

	const sections = [
		'ageRequirement',
		'contentWarning',
		'contentOwnership',
		'uploaderResponsibility',
		'prohibitedContent',
		'contentRemoval',
		'disclaimer',
		'accountSecurity',
		'termination',
		'termsChanges',
		'applicableLaw'
	] as const;

	function getSectionTitle(section: string): string {
		const title = $t(`legal.sections.${section}.title`);
		return typeof title === 'string' ? title.replace(/^\d+\.\s*/, '') : section;
	}
</script>

<Seo title={$t('legal.termsTitle')} description={$t('legal.termsTitle')} />

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 md:text-4xl">
			{$t('legal.termsTitle')}
		</h1>
		{#if formattedDate}
			<p class="mt-2 text-surface-600 dark:text-surface-400">
				{$t('legal.lastUpdated', { values: { date: formattedDate } })}
			</p>
		{/if}
	</div>

	<!-- Table of Contents -->
	<div class="card mb-8 bg-surface-100 p-6 dark:bg-surface-800">
		<h2 class="mb-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
			{$t('legal.tableOfContents')}
		</h2>
		<nav>
			<ol class="list-inside list-decimal space-y-2 text-surface-700 dark:text-surface-300">
				{#each sections as section}
					<li>
						<a
							href="#{section}"
							class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
						>
							{getSectionTitle(section)}
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	</div>

	<!-- Content Sections -->
	<div class="space-y-8">
		{#each sections as section}
			<section id={section} class="scroll-mt-20">
				<h2 class="mb-4 text-xl font-bold text-surface-900 dark:text-surface-50 md:text-2xl">
					{$t(`legal.sections.${section}.title`)}
				</h2>
				<div class="prose dark:prose-invert max-w-none">
					<p class="text-surface-700 dark:text-surface-300 leading-relaxed">
						{#if section === 'contentRemoval'}
							{$t(`legal.sections.${section}.content`, { values: { email: contactEmail } })}
						{:else}
							{$t(`legal.sections.${section}.content`)}
						{/if}
					</p>
				</div>
			</section>
		{/each}
	</div>

	<!-- Contact Info -->
	<div class="mt-12 border-t border-surface-200 pt-8 dark:border-surface-700">
		<p class="text-center text-surface-600 dark:text-surface-400">
			{$t('legal.contactEmail')}:
			<a href="mailto:{contactEmail}" class="text-primary-600 dark:text-primary-400 hover:underline">
				{contactEmail}
			</a>
		</p>
	</div>
</div>
