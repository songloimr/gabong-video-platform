<script lang="ts">
  import { page } from "$app/state";
  import { sidebarState } from "$lib/stores/sidebar.svelte";
  import { t } from "$lib/stores/i18n";
  import {
    Home,
    PlaySquare,
    FolderOpen,
    Clock,
    Library,
    X,
    ThumbsUp,
  } from "@lucide/svelte";

  const navItems = [
    { href: "/", icon: Home, label: "common.home" },
    { href: "/most-liked", icon: ThumbsUp, label: "common.mostLiked" },
    { href: "/categories", icon: FolderOpen, label: "common.categories" },
    { href: "/watch-later", icon: Clock, label: "common.watchLater" },
    { href: "/playlists", icon: Library, label: "common.playlists" },
  ];

  function isActive(path: string) {
    if (path === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(path);
  }
</script>

<!-- Mobile Overlay Backdrop -->
{#if sidebarState.isOpen}
  <button
    onclick={() => sidebarState.close()}
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden border-none p-0 m-0 w-full h-full cursor-default"
    aria-label={$t("common.closeMenu")}
  ></button>
{/if}

<aside
  class="fixed lg:sticky top-14 lg:top-[57px] left-0 z-40 lg:z-30 w-64 h-[calc(100dvh-theme(spacing.14)*2)] lg:h-[calc(100vh-57px)] bg-surface-950 lg:bg-transparent border-r lg:border-r-0 border-surface-800/50 transition-transform duration-300 transform {sidebarState.isOpen
    ? 'translate-x-0'
    : '-translate-x-full lg:translate-x-0'}"
>
  <div
    class="flex flex-col h-full bg-surface-950 lg:bg-transparent overflow-y-auto scrollbar-hide"
  >
    <!-- Mobile Header -->
    <div
      class="flex lg:hidden items-center justify-between px-4 h-14 border-b border-surface-800/50"
    >
      <span class="text-xl font-black tracking-tighter text-gradient"
        >Gabong</span
      >
      <button
        onclick={() => sidebarState.close()}
        class="p-2 text-surface-500 hover:bg-surface-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={$t("common.closeMenu")}
      >
        <X size={20} strokeWidth={2.5} />
      </button>
    </div>

    <div class="p-2 lg:p-4 space-y-6">
      <!-- Discover Section -->
      <div class="space-y-1">
        <h3
          class="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 mb-2"
        >
          {$t("common.discover")}
        </h3>
        <nav class="space-y-0.5">
          {#each navItems.slice(0, 3) as item}
            <a
              href={item.href}
              onclick={() => sidebarState.close()}
              class="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              {isActive(item.href)
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-surface-400 hover:bg-surface-800'}"
            >
              <item.icon
                size={18}
                strokeWidth={isActive(item.href) ? 2.5 : 2}
                class="transition-transform group-hover:scale-110"
              />
              <span>{item.label.startsWith('common.') ? $t(item.label) : item.label}</span>
            </a>
          {/each}
        </nav>
      </div>

      <!-- Library Section -->
      <div class="space-y-1">
        <h3
          class="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 mb-2"
        >
          {$t("common.library")}
        </h3>
        <nav class="space-y-0.5">
          {#each navItems.slice(3) as item}
            <a
              href={item.href}
              onclick={() => sidebarState.close()}
              class="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              {isActive(item.href)
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-surface-400 hover:bg-surface-800'}"
            >
              <item.icon
                size={18}
                strokeWidth={isActive(item.href) ? 2.5 : 2}
                class="transition-transform group-hover:scale-110"
              />
              <span>{item.label.startsWith('common.') ? $t(item.label) : item.label}</span>
            </a>
          {/each}
        </nav>
      </div>
    </div>
  </div>
</aside>
