<script lang="ts">
	import { t } from "$lib/stores/i18n";
	import { Filter, X } from "@lucide/svelte";
	import type { Category } from "$lib/types";

	interface Props {
		categories?: Category[];
		selectedCategory?: string;
		selectedSort?: "newest" | "views" | "likes";
		selectedDuration?: "all" | "short" | "medium" | "long";
		onFilterChange?: (filters: {
			category?: string;
			sort?: string;
			duration?: string;
		}) => void;
		onClear?: () => void;
	}

	let {
		categories = [],
		selectedCategory = "",
		selectedSort = "newest",
		selectedDuration = "all",
		onFilterChange = () => {},
		onClear = () => {},
	}: Props = $props();

	let showFilters = $state(false);
	let category = $state(selectedCategory);
	let sort = $state(selectedSort);
	let duration = $state(selectedDuration);

	function applyFilters() {
		onFilterChange({
			category: category || undefined,
			sort,
			duration: duration !== "all" ? duration : undefined,
		});
		showFilters = false;
	}

	function clearFilters() {
		category = "";
		sort = "newest";
		duration = "all";
		onClear();
		showFilters = false;
	}

	const hasActiveFilters = $derived(
		category !== "" || sort !== "newest" || duration !== "all",
	);
</script>

<div class="relative">
	<!-- Filter Button -->
	<button
		onclick={() => (showFilters = !showFilters)}
		class="btn btn-ghost gap-2"
		class:btn-primary={hasActiveFilters}
	>
		<Filter class="h-4 w-4" />
		<span class="hidden sm:inline">{$t("common.filter")}</span>
		{#if hasActiveFilters}
			<span class="badge badge-sm"
				>{[category, sort !== "newest", duration !== "all"].filter(
					Boolean,
				).length}</span
			>
		{/if}
	</button>

	<!-- Filter Dropdown -->
	{#if showFilters}
		<div
			class="absolute right-0 top-full mt-2 w-80 bg-surface-800 rounded-lg shadow-lg border border-surface-700 p-4 z-50"
		>
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-surface-50">
					{$t("search.filters")}
				</h3>
				<button
					onclick={() => (showFilters = false)}
					class="btn btn-ghost btn-sm btn-circle"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="space-y-4">
				<!-- Category Filter -->
				{#if categories.length > 0}
					<div>
						<label for="filter-category" class="label">
							<span class="label-text font-medium"
								>{$t("common.category")}</span
							>
						</label>
						<select
							id="filter-category"
							bind:value={category}
							class="select select-bordered w-full"
						>
							<option value=""
								>{$t("common.allCategories")}</option
							>
							{#each categories as cat}
								<option value={cat.slug}>{cat.name}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Sort By -->
				<div>
					<label for="filter-sort" class="label">
						<span class="label-text font-medium"
							>{$t("common.sortBy")}</span
						>
					</label>
					<select
						id="filter-sort"
						bind:value={sort}
						class="select select-bordered w-full"
					>
						<option value="newest">{$t("sort.newest")}</option>
						<option value="views">{$t("sort.mostViews")}</option>
						<option value="likes">{$t("sort.mostLikes")}</option>
					</select>
				</div>

				<!-- Duration Filter -->
				<div>
					<label for="filter-duration" class="label">
						<span class="label-text font-medium"
							>{$t("search.duration")}</span
						>
					</label>
					<select
						id="filter-duration"
						bind:value={duration}
						class="select select-bordered w-full"
					>
						<option value="all">{$t("search.anyDuration")}</option>
						<option value="short"
							>{$t("search.short")} (&lt; 5 {$t(
								"common.minutes",
							)})</option
						>
						<option value="medium"
							>{$t("search.medium")} (5-15 {$t(
								"common.minutes",
							)})</option
						>
						<option value="long"
							>{$t("search.long")} (&gt; 15 {$t(
								"common.minutes",
							)})</option
						>
					</select>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-2 mt-4">
				<button onclick={clearFilters} class="btn btn-ghost flex-1">
					{$t("common.clear")}
				</button>
				<button onclick={applyFilters} class="btn btn-primary flex-1">
					{$t("common.apply")}
				</button>
			</div>
		</div>
	{/if}
</div>
