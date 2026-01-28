<script lang="ts">
	import TipTapEditor from '$lib/components/forms/TipTapEditor.svelte';
	import { sanitizeHTML, isHTMLSafe, XSS_TEST_PAYLOADS } from '$lib/utils/sanitize';
	
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
		const payload = prompt('Enter HTML to test:');
		if (payload) {
			const safe = isHTMLSafe(payload);
			const sanitized = sanitizeHTML(payload);
			alert(
				`Safe: ${safe}\n\n` +
				`Original: ${payload}\n\n` +
				`Sanitized: ${sanitized}`
			);
		}
	}
</script>

<div class="container max-w-4xl mx-auto p-8">
	<h1 class="text-3xl font-bold mb-8">TipTap Editor Security Test</h1>
	
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-4">Editor with Sanitization</h2>
		<p class="text-surface-400 mb-4">
			This editor automatically sanitizes HTML content to prevent XSS attacks.
			Try pasting HTML with script tags or event handlers.
		</p>
		
		<TipTapEditor 
			bind:value={editorValue}
			placeholder="Try pasting malicious HTML here..."
			sanitize={true}
		/>
		
		<div class="mt-4 p-4 bg-surface-900 rounded-lg">
			<h3 class="text-sm font-mono text-primary-400 mb-2">Sanitized HTML Output:</h3>
			<pre class="text-xs text-surface-300 overflow-x-auto">{editorValue || '(empty)'}</pre>
		</div>
	</section>
	
	<section class="mb-8">
		<h2 class="text-2xl font-semibold mb-4">XSS Security Tests</h2>
		<p class="text-surface-400 mb-4">
			Test common XSS attack vectors to verify sanitization is working correctly.
		</p>
		
		<div class="flex gap-2 mb-4">
			<button 
				class="btn variant-filled-primary"
				onclick={runSecurityTests}
			>
				Run All XSS Tests ({XSS_TEST_PAYLOADS.length})
			</button>
			
			<button 
				class="btn variant-filled-secondary"
				onclick={testCustomPayload}
			>
				Test Custom Payload
			</button>
		</div>
		
		{#if testResults.length > 0}
			<div class="space-y-2">
				{#each testResults as result, i}
					<div class="p-3 bg-surface-900 rounded-lg border border-surface-700">
						<div class="flex items-start justify-between mb-2">
							<span class="text-xs font-mono text-surface-500">Test #{i + 1}</span>
							<span class="text-xs px-2 py-1 rounded {result.safe ? 'bg-error-500/20 text-error-400' : 'bg-success-500/20 text-success-400'}">
								{result.safe ? '⚠️ Potentially Unsafe' : '✓ Sanitized'}
							</span>
						</div>
						
						<div class="mb-2">
							<div class="text-xs text-surface-500 mb-1">Original:</div>
							<code class="text-xs text-error-400 break-all">{result.payload}</code>
						</div>
						
						<div>
							<div class="text-xs text-surface-500 mb-1">After Sanitization:</div>
							<code class="text-xs text-success-400 break-all">{result.sanitized || '(removed)'}</code>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
	
	<section class="p-6 bg-warning-500/10 border border-warning-500/30 rounded-lg">
		<h3 class="text-lg font-semibold text-warning-400 mb-2">Security Features Implemented:</h3>
		<ul class="list-disc list-inside space-y-1 text-surface-300">
			<li>HTML sanitization using DOMPurify (isomorphic)</li>
			<li>XSS prevention by removing script tags and event handlers</li>
			<li>CSS injection prevention (removes dangerous CSS)</li>
			<li>Safe image insertion with file validation</li>
			<li>Drag & drop image support with security checks</li>
			<li>File size and MIME type validation</li>
			<li>Automatic content sanitization on editor update</li>
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
