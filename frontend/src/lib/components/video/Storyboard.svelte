<script lang="ts">
	import { t } from "$lib/stores/i18n";

	interface Props {
		storyboardUrl: string;
	}

	let { storyboardUrl }: Props = $props();
	let activeTimestamp = $state(0);
</script>

<div class="storyboard-container">
	<h3 class="text-lg font-bold text-surface-100 mb-4">
		{$t("video.duration")} {$t("video.preview")}
	</h3>
	<div class="flex overflow-x-auto gap-2 pb-2">
		{#each Array(10) as _, index}
			<button
				class="storyboard-thumb flex-shrink-0"
				class:active={index === activeTimestamp}
				onclick={() => (activeTimestamp = index)}
			>
				<img
					src={storyboardUrl}
					alt={$t("video.previewFrame", { values: { index } })}
					loading="lazy"
					decoding="async"
					class="w-48 h-27 object-cover rounded border-2"
					class:border-primary-500={index === activeTimestamp}
					class:border-surface-700={index !== activeTimestamp}
				/>
				<span class="timestamp-overlay">
					{index * 10}s
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.storyboard-container {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: rgba(15, 23, 42, 0.5);
		border: 1px solid rgba(30, 41, 59, 0.5);
		border-radius: 0.375rem;
	}

	.storyboard-thumb {
		position: relative;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.storyboard-thumb:hover {
		transform: scale(1.05);
	}

	.storyboard-thumb.active {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	}

	.timestamp-overlay {
		position: absolute;
		bottom: 4px;
		right: 4px;
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
