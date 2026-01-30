<script lang="ts">
	import TipTapEditor from '$lib/components/forms/TipTapEditor.svelte';
	import { sanitizeHTML, isHTMLSafe, XSS_TEST_PAYLOADS } from '$lib/utils/sanitize';
	import { t } from 'svelte-i18n';
	
	let editorValue = $state('');
	let testResults = $state<{ payload: string; safe: boolean; sanitized: string }[]>([]);
	
	function runSecurityTests() {
		testResults = XSS_TEST_PAYLOADS.map(payload => ({
			payload,
			safe: isHTMLSafe(payload),
			sanitized: sanitizeHTML(payload)
		}));
	}
	
	function testCustomPayload() {
		const payload = prompt($t('common.url')); // Fallback if no specific prompt translation
		if (payload) {
			const safe = isHTMLSafe(payload);
			const sanitized = sanitizeHTML(payload);
			alert(
				`${$t('test.xssSection.potentiallyUnsafe')}: ${safe}\n\n` +
				`${$t('test.xssSection.original')} ${payload}\n\n` +
				`${$t('test.xssSection.afterSanitization')} ${sanitized}`
			);
		}
	}
</script>

<div class="container max-w-4xl mx-auto p-8">
	<h1 class="text-3xl font-bold mb-8">{$t('test.title')}</h1>
	
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-4">{$t('test.editorSection.title')}</h2>
		<p class="text-surface-400 mb-4">
			{$t('test.editorSection.description')}
		</p>
		
		<TipTapEditor 
			bind:value={editorValue}
			placeholder={$t('test.editorSection.placeholder')}
			sanitize={true}
		/>
		
		<div class="mt-4 p-4 bg-surface-900 rounded-lg">
			<h3 class="text-sm font-mono text-primary-400 mb-2">{$t('test.editorSection.output')}</h3>
			<pre class="text-xs text-surface-300 overflow-x-auto">{editorValue || `(${$t('common.noVideos')})`}</pre>
		</div>
	</section>
	
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-4">{$t('test.xssSection.title')}</h2>
		<p class="text-surface-400 mb-4">
			{$t('test.xssSection.description')}
		</p>
		
		<div class="flex gap-2 mb-4">
			<button 
				class="btn variant-filled-primary"
				onclick={runSecurityTests}
			>
				{$t('test.xssSection.runTests', { values: { count: XSS_TEST_PAYLOADS.length } })}
			</button>
			
			<button 
				class="btn variant-filled-secondary"
				onclick={testCustomPayload}
			>
				{$t('test.xssSection.testCustom')}
			</button>
		</div>
		
		{#if testResults.length > 0}
			<div class="space-y-2">
				{#each testResults as result, i}
					<div class="p-3 bg-surface-900 rounded-lg border border-surface-700">
						<div class="flex items-start justify-between mb-2">
							<span class="text-xs font-mono text-surface-500">{$t('test.xssSection.testNumber', { values: { index: i + 1 } })}</span>
							<span class="text-xs px-2 py-1 rounded {result.safe ? 'bg-error-500/20 text-error-400' : 'bg-success-500/20 text-success-400'}">
								{result.safe ? $t('test.xssSection.potentiallyUnsafe') : $t('test.xssSection.sanitized')}
							</span>
						</div>
						
						<div class="mb-2">
							<div class="text-xs text-surface-500 mb-1">{$t('test.xssSection.original')}</div>
							<code class="text-xs text-error-400 break-all">{result.payload}</code>
						</div>
						
						<div>
							<div class="text-xs text-surface-500 mb-1">{$t('test.xssSection.afterSanitization')}</div>
							<code class="text-xs text-success-400 break-all">{result.sanitized || `(${$t('admin.delete')})`}</code>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
	
	<section class="p-6 bg-warning-500/10 border border-warning-500/30 rounded-lg">
		<h3 class="text-lg font-semibold text-warning-400 mb-2">{$t('test.features.title')}</h3>
		<ul class="list-disc list-inside space-y-1 text-surface-300">
			<li>{$t('test.features.domPurify')}</li>
			<li>{$t('test.features.xssPrevention')}</li>
			<li>{$t('test.features.cssInjection')}</li>
			<li>{$t('test.features.imageValidation')}</li>
			<li>{$t('test.features.dragDrop')}</li>
			<li>{$t('test.features.fileValidation')}</li>
			<li>{$t('test.features.autoSanitize')}</li>
		</ul>
	</section>
</div>

<style>
	.container {
		min-height: 100vh;
		padding-top: 2rem;
		padding-bottom: 4rem;
	}
</style>
