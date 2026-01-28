<script lang="ts">
	import { t } from "svelte-i18n";
	import { useUpdateUserStatus } from "$lib/api/mutations/users";
	import moment from "moment";
	import type { User } from "$lib/types";

	interface Props {
		users: User[];
	}

	let { users }: Props = $props();
	const updateStatusMutation = useUpdateUserStatus();

	async function handleStatusChange(
		userId: string,
		status: "active" | "suspended" | "banned",
		reason?: string,
	) {
		try {
			await updateStatusMutation.mutateAsync({ userId, status, reason });
		} catch (error) {
			console.error("Failed to update user status:", error);
		}
	}
</script>

<div class="bg-surface-800 rounded-lg shadow-lg overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-surface-700">
				<tr>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.username")}
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.email")}
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.role")}
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.status")}
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.createdAt")}
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider"
					>
						{$t("admin.actions")}
					</th>
				</tr>
			</thead>
			<tbody class="bg-surface-800 divide-y divide-surface-700">
				{#each users as user (user.id)}
					<tr>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-100"
						>
							{user.username}
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm text-surface-400"
						>
							{user.email || "-"}
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm text-surface-400"
						>
							<span
								class="px-2 py-1 rounded-full text-xs font-medium {user.role ===
								'admin'
									? 'bg-purple-900 text-purple-200'
									: 'bg-surface-700 text-surface-200'}"
							>
								{user.role}
							</span>
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm text-surface-400"
						>
							<span
								class="px-2 py-1 rounded-full text-xs font-medium
								{user.status === 'active' ? 'bg-green-900 text-green-200' : ''}
								{user.status === 'suspended' ? 'bg-yellow-900 text-yellow-200' : ''}
								{user.status === 'banned' ? 'bg-red-900 text-red-200' : ''}"
							>
								{user.status}
							</span>
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm text-surface-400"
						>
							{moment(user.created_at).format("YYYY-MM-DD")}
						</td>
						<td
							class="px-6 py-4 whitespace-nowrap text-sm font-medium"
						>
							<select
								onchange={(e) =>
									handleStatusChange(
										user.id,
										e.currentTarget.value as any,
									)}
								value={user.status}
								disabled={updateStatusMutation.isPending}
								class="px-3 py-1 border border-surface-600 rounded-md bg-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
							>
								<option value="active"
									>{$t("admin.active")}</option
								>
								<option value="suspended"
									>{$t("admin.suspended")}</option
								>
								<option value="banned"
									>{$t("admin.banned")}</option
								>
							</select>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
