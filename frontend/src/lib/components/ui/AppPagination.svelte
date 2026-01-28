<script lang="ts">
	import { Pagination } from "@skeletonlabs/skeleton-svelte";
	import { ArrowLeft, ArrowRight } from "@lucide/svelte";

	interface Props {
		count: number;
		pageSize: number;
		page: number;
		onPageChange: (page: number) => void;
	}

	let { count, pageSize, page, onPageChange }: Props = $props();
</script>

{#if count > pageSize}
	<div class="flex justify-center mt-6">
		<Pagination
			{count}
			{pageSize}
			{page}
			onPageChange={(event) => onPageChange(event.page)}
		>
			<Pagination.PrevTrigger>
				<ArrowLeft class="size-4" />
			</Pagination.PrevTrigger>
			<Pagination.Context>
				{#snippet children(pagination)}
					{#each pagination().pages as pageItem, index (pageItem)}
						{#if pageItem.type === 'page'}
							<Pagination.Item {...pageItem}>
								{pageItem.value}
							</Pagination.Item>
						{:else}
							<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
						{/if}
					{/each}
				{/snippet}
			</Pagination.Context>
			<Pagination.NextTrigger>
				<ArrowRight class="size-4" />
			</Pagination.NextTrigger>
		</Pagination>
	</div>
{/if}
