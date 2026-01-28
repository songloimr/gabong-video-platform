<script lang="ts">
	import type { Component } from "svelte";
	import type { IconProps } from "@lucide/svelte";

	interface Props {
		title: string;
		value: number;
		icon?: Component<IconProps>;
		trend?: {
			value: number;
			isPositive: boolean;
		};
		color?: "primary" | "success" | "warning" | "info" | "error";
	}

	let {
		title,
		value,
		icon: IconComponent,
		trend,
		color = "primary",
	}: Props = $props();

	const colorClasses = {
		primary: "text-primary-400 bg-primary-500/10 border-primary-500/20",
		success: "text-green-400 bg-green-500/10 border-green-500/20",
		warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
		info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		error: "text-red-400 bg-red-500/10 border-red-500/20",
	};
</script>

<div
	class="bg-surface-800/50 backdrop-blur rounded-sm p-4 border border-surface-700/50 group hover:border-surface-600 transition-all duration-300"
>
	<div class="flex items-start justify-between mb-3">
		<div class="space-y-0.5">
			<h3
				class="text-[10px] font-black uppercase tracking-[0.1em] text-surface-500"
			>
				{title}
			</h3>
			<p
				class="text-2xl font-black text-surface-400 group-hover:text-surface-100 transition-colors"
			>
				{value.toLocaleString()}
			</p>
		</div>

		{#if IconComponent}
			<div
				class="p-2 rounded-sm border transition-all duration-300 {colorClasses[
					color
				]}"
			>
				<IconComponent size={20} strokeWidth={2.5} />
			</div>
		{/if}
	</div>

	{#if trend}
		<div class="flex items-center gap-2">
			<span
				class="text-[10px] font-bold {trend.isPositive
					? 'text-green-400'
					: 'text-red-400'}"
			>
				{trend.isPositive ? "+" : "-"}{trend.value}%
			</span>
			<span
				class="text-[9px] font-bold text-surface-600 uppercase tracking-wider"
				>vs last period</span
			>
		</div>
	{/if}
</div>
