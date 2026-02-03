<script lang="ts">
    import { useAdminDashboardStats } from "$lib/api/queries/admin";
    import StatsCard from "$lib/components/admin/StatsCard.svelte";
    import {
        Users,
        Video,
        Eye,
        Clock,
        AlertCircle,
        Activity,
    } from "@lucide/svelte";

    const statsQuery = useAdminDashboardStats();
</script>

<svelte:head>
    <title>Dashboard - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
    <div>
        <h1 class="text-2xl font-black text-surface-100 tracking-tight mb-1">
            Dashboard
        </h1>
        <p class="text-xs text-surface-400 font-medium">
            Welcome back, Admin. Here's what's happening today.
        </p>
    </div>

    <!-- Stats Cards -->
    {#if statsQuery.isLoading}
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            {#each Array(6) as _}
                <div
                    class="h-24 bg-surface-800/50 animate-pulse rounded-sm border border-surface-700/50"
                ></div>
            {/each}
        </div>
    {:else if statsQuery.data}
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <StatsCard
                title="Total Users"
                value={statsQuery.data.total_users}
                icon={Users}
                color="primary"
            />
            <StatsCard
                title="Total Videos"
                value={statsQuery.data.total_videos}
                icon={Video}
                color="info"
            />
            <StatsCard
                title="Pending Approval"
                value={statsQuery.data.pending_approval_videos}
                icon={AlertCircle}
                color="warning"
            />
            <StatsCard
                title="Pending Processing"
                value={statsQuery.data.pending_processing_videos}
                icon={Clock}
                color="info"
            />
            <StatsCard
                title="Processing"
                value={statsQuery.data.processing_videos}
                icon={Activity}
                color="primary"
            />
            <StatsCard
                title="Total Views"
                value={statsQuery.data.total_views}
                icon={Eye}
                color="success"
            />
        </div>
    {/if}
</div>
