<script lang="ts">
	import { useAdminPlaylists } from "$lib/api/queries/playlists";
	import {
		useCreatePlaylist,
		useUpdatePlaylist,
		useDeletePlaylist,
		useTogglePlaylistVisibility,
	} from "$lib/api/mutations/playlists";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import Modal from "$lib/components/ui/Modal.svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import {
		Library,
		ExternalLink,
		ListVideo,
		Plus,
		Pencil,
		Trash2,
		Eye,
		EyeOff,
		AlertTriangle,
	} from "@lucide/svelte";
	import moment from "moment";
	import type { Playlist } from "$lib/types";

	const currentPage = $derived(
		Math.max(1, Number($page.url.searchParams.get("page") || 1)),
	);

	const playlistsQuery = useAdminPlaylists(() => ({
		page: currentPage,
		limit: 20,
	}));

	const playlists = $derived(playlistsQuery.data?.data || []);
	const pagination = $derived(playlistsQuery.data?.pagination);
	const isLoading = $derived(playlistsQuery.isLoading);

	const createMutation = useCreatePlaylist();
	const updateMutation = useUpdatePlaylist();
	const deleteMutation = useDeletePlaylist();
	const toggleVisibilityMutation = useTogglePlaylistVisibility();

	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let selectedPlaylist: Playlist | null = $state(null);

	let formTitle = $state("");
	let formSlug = $state("");
	let formDescription = $state("");
	let formThumbnailUrl = $state("");
	let formIsPublic = $state(true);

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set("page", String(newPage));
		goto(`?${params.toString()}`);
	}

	function openCreateModal() {
		formTitle = "";
		formSlug = "";
		formDescription = "";
		formThumbnailUrl = "";
		formIsPublic = true;
		showCreateModal = true;
	}

	function openEditModal(playlist: Playlist) {
		selectedPlaylist = playlist;
		formTitle = playlist.title;
		formSlug = playlist.slug;
		formDescription = playlist.description || "";
		formThumbnailUrl = playlist.thumbnail_url || "";
		formIsPublic = playlist.is_public;
		showEditModal = true;
	}

	function openDeleteModal(playlist: Playlist) {
		selectedPlaylist = playlist;
		showDeleteModal = true;
	}

	function generateSlug(title: string): string {
		return title
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	}

	async function handleCreate() {
		if (!formTitle || !formSlug) return;
		await createMutation.mutateAsync({
			title: formTitle,
			slug: formSlug,
			description: formDescription || undefined,
			thumbnail_url: formThumbnailUrl || undefined,
			is_public: formIsPublic,
		});
		showCreateModal = false;
	}

	async function handleUpdate() {
		if (!selectedPlaylist || !formTitle) return;
		await updateMutation.mutateAsync({
			id: selectedPlaylist.id,
			dto: {
				title: formTitle,
				description: formDescription || undefined,
				thumbnail_url: formThumbnailUrl || undefined,
				is_public: formIsPublic,
			},
		});
		showEditModal = false;
		selectedPlaylist = null;
	}

	async function handleDelete() {
		if (!selectedPlaylist) return;
		await deleteMutation.mutateAsync(selectedPlaylist.id);
		showDeleteModal = false;
		selectedPlaylist = null;
	}

	async function handleToggleVisibility(playlist: Playlist) {
		await toggleVisibilityMutation.mutateAsync({
			id: playlist.id,
			is_public: !playlist.is_public,
		});
		playlists.find((p) => p.id === playlist.id)!.is_public =
			!playlist.is_public;
	}
</script>

{#snippet thumbnailCell(url: string | null, title: string)}
	{#if url}
		<img src={url} alt={title} loading="lazy" decoding="async" class="w-16 h-10 object-cover rounded-sm" />
	{:else}
		<div
			class="w-16 h-10 bg-surface-700 rounded-sm flex items-center justify-center"
		>
			<Library class="h-4 w-4 text-surface-400" />
		</div>
	{/if}
{/snippet}

{#snippet actionButtons(playlist: Playlist)}
	<div class="flex items-center gap-1">
		<a
			href={`/admin/playlists/${playlist.id}`}
			class="p-1.5 rounded-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
			title="Manage Videos"
		>
			<ListVideo class="h-4 w-4" />
		</a>
		<button
			onclick={() => openEditModal(playlist)}
			class="p-1.5 rounded-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
			title="Edit"
		>
			<Pencil class="h-4 w-4" />
		</button>
		<a
			href={`/playlists/${playlist.slug}`}
			target="_blank"
			class="p-1.5 rounded-sm bg-surface-600 text-surface-300 hover:bg-surface-500 transition-colors"
			title="View"
		>
			<ExternalLink class="h-4 w-4" />
		</a>
		<button
			onclick={() => openDeleteModal(playlist)}
			class="p-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
			title="Delete"
			disabled={deleteMutation.isPending}
		>
			<Trash2 class="h-4 w-4" />
		</button>
	</div>
{/snippet}

<svelte:head>
	<title>Playlists - Admin Panel</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h1 class="text-xl font-bold text-surface-100">Playlists</h1>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-xs font-bold"
		>
			<Plus class="h-4 w-4" />
			New Playlist
		</button>
	</div>

	<div
		class="overflow-x-auto rounded-sm border border-surface-700 bg-surface-800/50 backdrop-blur"
	>
		<table class="table w-full text-xs">
			<thead class="bg-surface-900/80">
				<tr>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-20"
					></th>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Title</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-24"
						>Status</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-20 text-center"
						>Videos</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-28"
						>Created</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-700">
				{#if isLoading}
					{#each Array(5) as _}
						<tr>
							<td class="px-3 py-3" colspan="6">
								<div
									class="h-8 bg-surface-700 animate-pulse rounded-sm"
								></div>
							</td>
						</tr>
					{/each}
				{:else if playlists.length === 0}
					<tr>
						<td
							colspan="6"
							class="px-3 py-8 text-center text-surface-400 italic"
						>
							No playlists found
						</td>
					</tr>
				{:else}
					{#each playlists as playlist (playlist.id)}
						<tr class="hover:bg-surface-700/50 transition-colors">
							<td class="px-3 py-2">
								{@render thumbnailCell(
									playlist.thumbnail_url,
									playlist.title,
								)}
							</td>
							<td class="px-3 py-2">
								<div class="max-w-[200px]">
									<p
										class="font-bold text-surface-100 truncate"
										title={playlist.title}
									>
										{playlist.title}
									</p>
									<p
										class="text-[10px] text-surface-500 truncate font-mono"
									>
										/{playlist.slug}
									</p>
								</div>
							</td>
							<td class="px-3 py-2">
								<button
									onclick={() =>
										handleToggleVisibility(playlist)}
									disabled={toggleVisibilityMutation.isPending}
									class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border transition-colors {playlist.is_public
										? 'bg-green-500/20 text-green-400 border-green-500/30'
										: 'bg-gray-500/20 text-gray-400 border-gray-500/30'}"
								>
									{#if playlist.is_public}
										<Eye class="h-3 w-3" />
										Public
									{:else}
										<EyeOff class="h-3 w-3" />
										Hidden
									{/if}
								</button>
							</td>
							<td class="px-3 py-2 text-center">
								<span class="font-bold text-surface-100"
									>{playlist.video_count}</span
								>
							</td>
							<td class="px-3 py-2 text-surface-300 font-mono">
								{moment(playlist.created_at).format(
									"DD/MM/YYYY",
								)}
							</td>
							<td class="px-3 py-2">
								{@render actionButtons(playlist)}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if pagination}
		<AppPagination
			count={pagination.total}
			pageSize={pagination.limit}
			page={pagination.page}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>

<Modal bind:open={showCreateModal} title="New Playlist" size="md">
	<div class="space-y-4">
		<div>
			<label
				for="title"
				class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
				>Title</label
			>
			<input
				id="title"
				type="text"
				bind:value={formTitle}
				oninput={() => (formSlug = generateSlug(formTitle))}
				class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors font-bold"
				placeholder="Playlist title"
			/>
		</div>
		<div>
			<label
				for="slug"
				class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
				>Slug</label
			>
			<input
				id="slug"
				type="text"
				bind:value={formSlug}
				class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm font-mono focus:outline-none focus:border-primary-500 transition-colors"
			/>
		</div>
		<div>
			<label
				for="description"
				class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
				>Description</label
			>
			<textarea
				id="description"
				bind:value={formDescription}
				rows={3}
				class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
				placeholder="Optional description..."
			></textarea>
		</div>
		<div class="flex items-center gap-3 pt-2">
			<label
				class="flex items-center gap-3 text-xs font-bold text-surface-300 cursor-pointer"
			>
				<input
					type="checkbox"
					bind:checked={formIsPublic}
					class="w-4 h-4 rounded-sm border-surface-600 bg-surface-900/50 text-primary-500 focus:ring-primary-500"
				/>
				Public playlist
			</label>
		</div>
		<div
			class="flex gap-2 justify-end pt-4 border-t border-surface-700/50"
		>
			<button
				onclick={() => (showCreateModal = false)}
				class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
			>
				Cancel
			</button>
			<button
				onclick={handleCreate}
				disabled={!formTitle || !formSlug || createMutation.isPending}
				class="px-6 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-bold shadow-lg shadow-primary-900/20"
			>
				{#if createMutation.isPending}
					Creating...
				{:else}
					Create Playlist
				{/if}
			</button>
		</div>
	</div>
</Modal>

<Modal bind:open={showEditModal} title="Edit Playlist" size="md">
	{#if selectedPlaylist}
		<div class="space-y-4">
			<div>
				<label
					for="edit-title"
					class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
					>Title</label
				>
				<input
					id="edit-title"
					type="text"
					bind:value={formTitle}
					class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors font-bold"
				/>
			</div>
			<div>
				<label
					for="edit-description"
					class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
					>Description</label
				>
				<textarea
					id="edit-description"
					bind:value={formDescription}
					rows={3}
					class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
				></textarea>
			</div>
			<div class="flex items-center gap-3 pt-2">
				<label
					class="flex items-center gap-3 text-xs font-bold text-surface-300 cursor-pointer"
				>
					<input
						type="checkbox"
						bind:checked={formIsPublic}
						class="w-4 h-4 rounded-sm border-surface-600 bg-surface-900/50 text-primary-500 focus:ring-primary-500"
					/>
					Public playlist
				</label>
			</div>
			<div
				class="flex gap-2 justify-end pt-4 border-t border-surface-700/50"
			>
				<button
					onclick={() => (showEditModal = false)}
					class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
				>
					Cancel
				</button>
				<button
					onclick={handleUpdate}
					disabled={!formTitle || updateMutation.isPending}
					class="px-6 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-bold shadow-lg shadow-primary-900/20"
				>
					{#if updateMutation.isPending}
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</div>
	{/if}
</Modal>

<Modal bind:open={showDeleteModal} title="Confirm Delete" size="sm">
	{#if selectedPlaylist}
		<div class="space-y-4">
			<div class="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
				<AlertTriangle class="h-5 w-5 text-red-400 flex-shrink-0" />
				<p class="text-sm text-surface-300">
					Are you sure you want to delete <span class="font-bold text-surface-100">{selectedPlaylist.title}</span>? This action cannot be undone.
				</p>
			</div>
			<div
				class="flex gap-2 justify-end pt-4 border-t border-surface-700/50"
			>
				<button
					onclick={() => (showDeleteModal = false)}
					class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
				>
					Cancel
				</button>
				<button
					onclick={handleDelete}
					disabled={deleteMutation.isPending}
					class="px-6 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-bold"
				>
					{#if deleteMutation.isPending}
						Deleting...
					{:else}
						Delete
					{/if}
				</button>
			</div>
		</div>
	{/if}
</Modal>
