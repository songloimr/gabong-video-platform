<script lang="ts">
    import { page } from "$app/state";
    import {
        LayoutDashboard,
        Video,
        Users,
        FolderTree,
        ArrowLeft,
        CheckSquare,
        Play,
        Library,
        Menu,
        X,
        Settings,
        Megaphone,
        Bell,
        Activity,
    } from "@lucide/svelte";

    let { isOpen = $bindable(false) } = $props();

    const adminNavItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        {
            label: "Content",
            items: [
                { href: "/admin/videos", icon: Video, label: "Videos" },
                {
                    href: "/admin/videos/pending",
                    icon: CheckSquare,
                    label: "Pending",
                },
                {
                    href: "/admin/categories",
                    icon: FolderTree,
                    label: "Categories",
                },
                {
                    href: "/admin/playlists",
                    icon: Library,
                    label: "Playlists",
                },
            ],
        },
        {
            label: "Management",
            items: [{ href: "/admin/users", icon: Users, label: "Users" }],
        },
        {
            label: "System",
            items: [
                { href: "/admin/settings", icon: Settings, label: "Settings" },
                {
                    href: "/admin/metrics",
                    icon: Activity,
                    label: "System Metrics",
                },
                {
                    href: "/admin/announcements",
                    icon: Megaphone,
                    label: "Announcements",
                },
                {
                    href: "/admin/notifications",
                    icon: Bell,
                    label: "Notifications",
                },
            ],
        },
    ];

    function isActive(path: string) {
        if (path === "/admin") return page.url.pathname === "/admin";
        return page.url.pathname.startsWith(path);
    }
</script>

<!-- Mobile Overlay -->
{#if isOpen}
    <!-- div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onclick={() => isOpen = false}></div -->
    <button
        type="button"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden w-full text-left"
        onclick={() => (isOpen = false)}
        aria-label="Close menu"
    ></button>
{/if}

<aside
    class="fixed inset-y-0 left-0 z-50 w-64 bg-surface-950 border-r border-surface-800/50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto {isOpen
        ? 'translate-x-0'
        : '-translate-x-full'}"
>
    <!-- Admin Header -->
    <div
        class="p-4 border-b border-surface-800/50 flex items-center justify-between"
    >
        <div class="flex items-center gap-2">
            <div
                class="w-8 h-8 rounded-sm bg-primary-500/10 flex items-center justify-center border border-primary-500/20"
            >
                <Play class="w-5 h-5 text-primary-500 fill-primary-500/20" />
            </div>
            <div>
                <h2
                    class="text-xs font-black uppercase tracking-widest text-surface-100"
                >
                    Gabong
                </h2>
                <p
                    class="text-[9px] font-bold text-primary-400 uppercase tracking-widest"
                >
                    Admin Panel
                </p>
            </div>
        </div>
        <button
            class="lg:hidden text-surface-400 hover:text-surface-100 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onclick={() => (isOpen = false)}
            aria-label="Close admin sidebar"
        >
            <X size={20} />
        </button>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto p-2 space-y-6 scrollbar-hide">
        {#each adminNavItems as section}
            {#if "items" in section}
                <div class="space-y-1">
                    <h3
                        class="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-surface-500"
                    >
                        {section.label}
                    </h3>
                    <nav class="space-y-0.5">
                        {#each section.items as item}
                            <a
                                href={item.href}
                                onclick={() => (isOpen = false)}
                                class="group flex items-center gap-2.5 px-3 py-2 rounded-sm transition-all duration-200 font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                {isActive(item.href)
                                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                    : 'text-surface-400 hover:bg-surface-800 border border-transparent'}"
                            >
                                <item.icon
                                    size={16}
                                    strokeWidth={isActive(item.href) ? 2.5 : 2}
                                    class="transition-transform group-hover:scale-110 {isActive(
                                        item.href,
                                    )
                                        ? 'text-primary-400'
                                        : 'text-surface-500'}"
                                />
                                <span>{item.label}</span>
                            </a>
                        {/each}
                    </nav>
                </div>
            {:else}
                <nav class="space-y-0.5">
                    <a
                        href={section.href}
                        onclick={() => (isOpen = false)}
                        class="group flex items-center gap-2.5 px-3 py-2 rounded-sm transition-all duration-200 font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            {isActive(section.href)
                            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                            : 'text-surface-400 hover:bg-surface-800 border border-transparent'}"
                    >
                        <section.icon
                            size={16}
                            strokeWidth={isActive(section.href) ? 2.5 : 2}
                            class="transition-transform group-hover:scale-110 {isActive(
                                section.href,
                            )
                                ? 'text-primary-400'
                                : 'text-surface-500'}"
                        />
                        <span>{section.label}</span>
                    </a>
                </nav>
            {/if}
        {/each}
    </div>

    <!-- Footer -->
    <div class="p-2 border-t border-surface-800/50 space-y-1">
        <a
            href="/"
            class="flex items-center gap-2.5 px-3 py-2 rounded-sm text-surface-400 hover:bg-surface-800 transition-all duration-200 font-bold text-xs border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Back to Site</span>
        </a>
    </div>
</aside>
