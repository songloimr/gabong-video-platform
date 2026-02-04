<script lang="ts">

	interface Props {
		siteName: string;
		siteUrl: string;
		title: string;
		description?: string;
		canonical?: string;
		robots?: string;
		keywords?: string;
		jsonLd?: object | object[];
		pagination?: {
			prev?: string;
			next?: string;
		};
	}

	let {
		siteName,
		siteUrl,
		title,
		description,
		canonical,
		robots,
		keywords,
		jsonLd,
		pagination,
	}: Props = $props();

	const fullTitle = $derived(`${title} | ${siteName}`);
	const canonicalUrl = $derived(
		canonical && siteUrl ? `${siteUrl}${canonical}` : undefined,
	);
	const jsonLdScripts = $derived(
		jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [],
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	{#if robots}
		<meta name="robots" content={robots} />
	{/if}
	{#if canonicalUrl}
		<link rel="canonical" href={canonicalUrl} />
	{/if}

	<!-- Pagination -->
	{#if pagination?.prev}
		<link rel="prev" href={pagination.prev} />
	{/if}
	{#if pagination?.next}
		<link rel="next" href={pagination.next} />
	{/if}

	<!-- JSON-LD Structured Data -->
	{#each jsonLdScripts as script}
		{@html `<script type="application/ld+json">${JSON.stringify(script)}</script>`}
	{/each}
</svelte:head>
