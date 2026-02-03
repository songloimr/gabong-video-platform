<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { useAdminUsers } from "$lib/api/queries/admin";
	import { useUpdateUserStatus } from "$lib/api/mutations/admin";
	import AppPagination from "$lib/components/ui/AppPagination.svelte";
	import Modal from "$lib/components/ui/Modal.svelte";
	import { Search, Ban, UserCheck, Clock } from "@lucide/svelte";
	import type { User } from "$lib/types";
	import moment from "moment";
	import { getAvatarUrl } from "$lib/utils/formatters";

	const currentPage = $derived(
		Math.max(1, Number($page.url.searchParams.get("page") || 1)),
	);
	const statusFilter = $derived(
		($page.url.searchParams.get("status") || "") as
			| "active"
			| "suspended"
			| "banned"
			| "",
	);
	const searchQuery = $derived($page.url.searchParams.get("search") || "");

	let searchInput = $state($page.url.searchParams.get("search") || "");

	const usersQuery = useAdminUsers(() => ({
		page: currentPage,
		limit: 20,
		status: statusFilter,
		search: searchQuery,
	}));

	const updateStatusMutation = useUpdateUserStatus();

	let showStatusModal = $state(false);
	let selectedUser: User | null = $state(null);
	let newStatus: "active" | "suspended" | "banned" = $state("active");
	let statusReason = $state("");

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set("page", String(newPage));
		goto(`?${params.toString()}`);
	}

	function handleSearch() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchInput) {
			params.set("search", searchInput);
		} else {
			params.delete("search");
		}
		params.set("page", "1");
		goto(`?${params.toString()}`);
	}

	function handleFilterChange(value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value === "") {
			params.delete("status");
		} else {
			params.set("status", value);
		}
		params.set("page", "1");
		goto(`?${params.toString()}`);
	}

	function openStatusModal(
		user: User,
		status: "active" | "suspended" | "banned",
	) {
		selectedUser = user;
		newStatus = status;
		statusReason = "";
		showStatusModal = true;
	}

	async function submitStatusChange() {
		if (!selectedUser) return;
		await updateStatusMutation.mutateAsync({
			userId: selectedUser.id,
			status: newStatus,
			reason: statusReason || undefined,
		});
		showStatusModal = false;
		selectedUser = null;
	}

	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case "active":
				return "bg-green-500/10 text-green-400 border-green-500/20";
			case "suspended":
				return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
			case "banned":
				return "bg-red-500/10 text-red-400 border-red-500/20";
			default:
				return "bg-surface-800 text-surface-400 border-surface-700";
		}
	}

	function getRoleBadgeClass(role: string): string {
		switch (role) {
			case "admin":
				return "bg-purple-500/10 text-purple-400 border-purple-500/20";
			default:
				return "bg-surface-800/50 text-surface-500 border-surface-700";
		}
	}
</script>

{#snippet userAvatar(user: User)}
{#if user.avatar_url}
							<img
								src={getAvatarUrl(user.avatar_url)}
								alt={user.username}
								loading="lazy"
								decoding="async"
			class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-800/50 shadow-sm"
		/>
	{:else}
		<div
			class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-surface-800/50 shadow-sm"
		>
			{user.username.charAt(0).toUpperCase()}
		</div>
	{/if}
{/snippet}

{#snippet statusBadge(status: string)}
	<span
		class="px-2 py-0.5 text-[10px] font-black uppercase rounded-sm border {getStatusBadgeClass(
			status,
		)}"
	>
		{status}
	</span>
{/snippet}

{#snippet roleBadge(role: string)}
	<span
		class="px-2 py-0.5 text-[10px] font-black uppercase rounded-sm border {getRoleBadgeClass(
			role,
		)}"
	>
		{role}
	</span>
{/snippet}

{#snippet actionButtons(user: User)}
	<div class="flex items-center gap-1">
		{#if user.status !== "active"}
			<button
				onclick={() => openStatusModal(user, "active")}
				class="p-1.5 rounded-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
				title="Activate"
				disabled={updateStatusMutation.isPending}
			>
				<UserCheck class="h-3.5 w-3.5" />
			</button>
		{/if}
		{#if user.status !== "suspended"}
			<button
				onclick={() => openStatusModal(user, "suspended")}
				class="p-1.5 rounded-sm bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
				title="Suspend"
				disabled={updateStatusMutation.isPending}
			>
				<Clock class="h-3.5 w-3.5" />
			</button>
		{/if}
		{#if user.status !== "banned"}
			<button
				onclick={() => openStatusModal(user, "banned")}
				class="p-1.5 rounded-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
				title="Ban"
				disabled={updateStatusMutation.isPending}
			>
				<Ban class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>
{/snippet}

<svelte:head>
	<title>Users - Admin Panel</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h1 class="text-xl font-bold text-surface-100 uppercase tracking-tight">
			Users
		</h1>
	</div>

	<!-- Filters and Search -->
	<div
		class="bg-surface-800/50 backdrop-blur rounded-sm border border-surface-700 p-3"
	>
		<div class="flex flex-col md:flex-row gap-3">
			<!-- Search -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchInput}
						onkeydown={(e) => e.key === "Enter" && handleSearch()}
						placeholder="Search users..."
						class="w-full px-3 py-2 pl-9 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm placeholder-surface-400 focus:outline-none focus:border-primary-500 transition-colors"
					/>
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
					/>
				</div>
			</div>

			<!-- Status Filter -->
			<select
				value={statusFilter}
				onchange={(e) => handleFilterChange(e.currentTarget.value)}
				class="px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-xs focus:outline-none focus:border-primary-500 transition-colors"
			>
				<option value="">All Status</option>
				<option value="active">Active</option>
				<option value="suspended">Suspended</option>
				<option value="banned">Banned</option>
			</select>

			<button
				onclick={handleSearch}
				class="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors text-sm font-bold"
			>
				Search
			</button>
		</div>
	</div>

	<!-- Users Table -->
	<div
		class="overflow-x-auto rounded-sm border border-surface-700 bg-surface-800/50 backdrop-blur"
	>
		<table class="table w-full text-xs">
			<thead class="bg-surface-900/80">
				<tr>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>User</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400"
						>Email</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-24"
						>Role</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-24"
						>Status</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-32"
						>Joined</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-32"
						>Last IP</th
					>
					<th
						class="px-3 py-2 text-left font-black uppercase tracking-wider text-surface-400 w-32"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface-700">
				{#if usersQuery.isLoading}
					{#each Array(5) as _}
						<tr>
							<td class="px-3 py-3" colspan="6">
								<div
									class="h-8 bg-surface-700 animate-pulse rounded-sm"
								></div>
							</td>
						</tr>
					{/each}
				{:else if !usersQuery.data?.data || usersQuery.data.data.length === 0}
					<tr>
						<td
							colspan="6"
							class="px-3 py-12 text-center text-surface-400 italic"
						>
							No users found
						</td>
					</tr>
				{:else}
					{#each usersQuery.data.data as user (user.id)}
						<tr class="hover:bg-surface-700/50 transition-colors">
							<td class="px-3 py-2">
								<div class="flex items-center gap-2">
									{@render userAvatar(user)}
									<span class="font-bold text-surface-100"
										>{user.username}</span
									>
								</div>
							</td>
							<td class="px-3 py-2 text-surface-400">
								{user.email || "-"}
							</td>
							<td class="px-3 py-2">
								{@render roleBadge(user.role)}
							</td>
							<td class="px-3 py-2">
								{@render statusBadge(user.status)}
							</td>
							<td class="px-3 py-2 text-surface-400">
								{moment(user.created_at).format("MMM D, YYYY")}
							</td>
							<td class="px-3 py-2 text-surface-400 font-mono text-[10px]">
								{user.last_ip || "-"}
							</td>
							<td class="px-3 py-2">
								{@render actionButtons(user)}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

<!-- Pagination -->
	{#if usersQuery.data?.pagination}
		<AppPagination
			count={usersQuery.data.pagination.total}
			pageSize={usersQuery.data.pagination.limit}
			page={usersQuery.data.pagination.page}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>

<!-- Status Change Modal -->
<Modal bind:open={showStatusModal} title="Change User Status">
	{#if selectedUser}
		<div class="space-y-4">
			<p class="text-xs text-surface-300">
				Change <span class="font-bold text-surface-100"
					>{selectedUser.username}</span
				>'s status to
				<span class="font-bold text-surface-100 uppercase"
					>{newStatus}</span
				>?
			</p>

			{#if newStatus !== "active"}
				<div>
					<label
						for="status-reason"
						class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5"
					>
						Reason (optional)
					</label>
					<textarea
						id="status-reason"
						bind:value={statusReason}
						class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm h-24 resize-none"
						placeholder="Enter reason..."
					></textarea>
				</div>
			{/if}

			<div class="flex gap-2 justify-end pt-2">
				<button
					onclick={() => (showStatusModal = false)}
					class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
				>
					Cancel
				</button>
				<button
					onclick={submitStatusChange}
					class="px-4 py-2 rounded-sm text-white text-sm font-bold transition-colors {newStatus ===
					'banned'
						? 'bg-red-600 hover:bg-red-700'
						: newStatus === 'suspended'
							? 'bg-yellow-600 hover:bg-yellow-700'
							: 'bg-green-600 hover:bg-green-700'}"
					disabled={updateStatusMutation.isPending}
				>
					{updateStatusMutation.isPending ? "Updating..." : "Confirm"}
				</button>
			</div>
		</div>
	{/if}
</Modal>
