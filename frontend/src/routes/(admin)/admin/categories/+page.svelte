<script lang="ts">
	import { useCategories } from "$lib/api/queries/categories";
	import {
		useCreateCategory,
		useUpdateCategory,
		useDeleteCategory,
	} from "$lib/api/mutations/categories";
	import Modal from "$lib/components/ui/Modal.svelte";
	import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
	import { toaster } from "$lib/toaster";
	import type { Category } from "$lib/types";
	import { Plus, Pencil, Trash2 } from "@lucide/svelte";

	const categoriesQuery = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	let showCreateModal = $state(false);
	let showDeleteConfirm = $state(false);
	let categoryToDelete = $state<Category | null>(null);
	let editingCategory = $state<Category | null>(null);
	let formData = $state({
		name: "",
		slug: ""
	});

	function openCreateModal() {
		formData = { name: "", slug: ""};
		editingCategory = null;
		showCreateModal = true;
	}

	function openEditModal(category: Category) {
		editingCategory = category;
		formData = {
			name: category.name,
			slug: category.slug
		};
		showCreateModal = true;
	}

	async function handleCreate() {
		try {
			await createMutation.mutateAsync(formData);
			toaster.success({
				title: "Category created successfully"
			});
			showCreateModal = false;
			categoriesQuery.refetch();
		} catch (error) {
			toaster.error({
				title: "Failed to create category"
			});
		}
	}

	async function handleUpdate() {
		if (!editingCategory) return;
		try {
			await updateMutation.mutateAsync({
				id: editingCategory.id,
				payload: formData,
			});
			toaster.success({
				title: "Category updated successfully"
			});
			showCreateModal = false;
			editingCategory = null;
			categoriesQuery.refetch();
		} catch (error) {
			toaster.error({
				title: "Failed to update category"
			});
		}
	}

	async function handleDelete(category: Category) {
		categoryToDelete = category;
		showDeleteConfirm = true;
	}

	async function confirmDelete() {
		if (!categoryToDelete) return;
		try {
			await deleteMutation.mutateAsync(categoryToDelete.id);
			toaster.success({
				title: "Category deleted successfully"
			});
			categoriesQuery.refetch();
		} catch (error) {
			toaster.error({
				title: "Failed to delete category"
			});
		}
		categoryToDelete = null;
	}

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	}

	function handleNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.name = target.value;
		if (!editingCategory) {
			formData.slug = generateSlug(target.value);
		}
	}
</script>

{#snippet actionButtons(category: Category)}
	<div class="flex items-center gap-1">
		<button
			onclick={() => openEditModal(category)}
			class="p-1 px-2 rounded-sm bg-surface-600 text-surface-300 hover:bg-surface-500 transition-colors"
			title="Edit"
		>
			<Pencil class="h-3 w-3" />
		</button>
		<button
			onclick={() => handleDelete(category)}
			class="p-1 px-2 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
			title="Delete"
			disabled={deleteMutation.isPending}
		>
			<Trash2 class="h-3 w-3" />
		</button>
	</div>
{/snippet}

<svelte:head>
	<title>Categories - Admin Panel</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-bold text-surface-100">Categories</h1>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-xs font-bold"
		>
			<Plus class="h-4 w-4" />
			New Category
		</button>
	</div>

	<!-- Categories Table -->
	<div
		class="overflow-x-auto rounded-sm border border-surface-700 bg-surface-800/50 backdrop-blur"
	>
		<table class="table w-full text-xs">
			<thead class="bg-surface-900/80">
				<tr>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Name</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Slug</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 hidden"
						>Order</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-24"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-700">
				{#if categoriesQuery.isLoading}
					{#each Array(5) as _}
						<tr>
							<td class="px-3 py-3" colspan="3">
								<div
									class="h-8 bg-surface-700 animate-pulse rounded-sm"
								></div>
							</td>
						</tr>
					{/each}
				{:else if !categoriesQuery.data?.data || categoriesQuery.data.data.length === 0}
					<tr>
						<td
							colspan="3"
							class="px-3 py-8 text-center text-surface-400 italic"
						>
							No categories found
						</td>
					</tr>
				{:else}
					{#each categoriesQuery.data.data as category (category.id)}
						<tr class="hover:bg-surface-700/50 transition-colors">
							<td class="px-3 py-2">
								<p class="font-bold text-surface-100">
									{category.name}
								</p>
							</td>
							<td class="px-3 py-2">
								<code
									class="text-[10px] text-surface-500 bg-surface-900/50 px-1.5 py-0.5 rounded-sm"
									>{category.slug}</code
								>
							</td>
							<td class="px-3 py-2 text-surface-300 hidden">
								{category.sort_order}
							</td>
							<td class="px-3 py-2">
								{@render actionButtons(category)}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<!-- Create/Edit Modal -->
<Modal
	bind:open={showCreateModal}
	title={editingCategory ? "Edit Category" : "Create Category"}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			editingCategory ? handleUpdate() : handleCreate();
		}}
		class="space-y-3"
	>
		<div>
			<label
				for="category-name"
				class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
			>
				Name
			</label>
			<input
				id="category-name"
				type="text"
				value={formData.name}
				oninput={handleNameChange}
				required
				class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
			/>
		</div>
		<div>
			<label
				for="category-slug"
				class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
			>
				Slug
			</label>
			<input
				id="category-slug"
				type="text"
				bind:value={formData.slug}
				required
				class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
			/>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={() => {
					showCreateModal = false;
					editingCategory = null;
				}}
				class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={createMutation.isPending || updateMutation.isPending}
				class="px-4 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-bold"
			>
				{editingCategory ? "Update" : "Create"}
			</button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Category"
	message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
	onConfirm={confirmDelete}
	onCancel={() => (categoryToDelete = null)}
/>
