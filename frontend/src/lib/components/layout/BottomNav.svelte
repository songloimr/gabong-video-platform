<script lang="ts">
  import { page } from "$app/state";
  import { t } from "svelte-i18n";
  import {
    Home,
    PlaySquare,
    FolderOpen,
    Clock,
    User,
    Upload,
    Menu,
    SquarePlay,
    House,
  } from "@lucide/svelte";

  function isRouteActive(route: string): boolean {
    const currentRoute = page.route.id;
    if (!currentRoute) return false;
    if (route === currentRoute) return true;
    if (route !== "/" && currentRoute.startsWith(route)) return true;
    return false;
  }
</script>

<nav
  class="fixed bottom-0 left-0 right-0 border-t border-surface-800/50 md:hidden z-50 pb-safe transition-all duration-300"
>
  <div class="absolute inset-0 glass z-[-1]"></div>
  <div class="flex items-center justify-around h-14">
    <a
      href="/"
      class="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 {isRouteActive(
        '/',
      )
        ? 'text-primary-400'
        : 'text-surface-400'}"
      aria-label={$t("common.home")}
      aria-current={isRouteActive('/') ? 'page' : undefined}
    >
      <div
        class="transition-transform duration-300 {isRouteActive('/')
          ? 'scale-110'
          : 'active:scale-90'}"
      >
        <House size={18} strokeWidth={isRouteActive("/") ? 2.5 : 2} />
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest"
        >{$t("common.home")}</span
      >
      {#if isRouteActive("/")}
        <div
          class="absolute top-0 w-6 h-0.5 bg-primary-400 rounded-b-full"
        ></div>
      {/if}
    </a>

    <a
      href="/videos"
      class="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 {isRouteActive(
        '/videos',
      )
        ? 'text-primary-400'
        : 'text-surface-400'}"
      aria-label={$t("common.newest")}
      aria-current={isRouteActive('/videos') ? 'page' : undefined}
    >
      <div
        class="transition-transform duration-300 {isRouteActive('/videos')
          ? 'scale-110'
          : 'active:scale-90'}"
      >
        <SquarePlay
          size={18}
          strokeWidth={isRouteActive("/videos") ? 2.5 : 2}
        />
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest"
        >{$t("common.newest")}</span
      >
      {#if isRouteActive("/videos")}
        <div
          class="absolute top-0 w-6 h-0.5 bg-primary-400 rounded-b-full"
        ></div>
      {/if}
    </a>

    <a
      href="/videos/upload"
      class="relative flex flex-col items-center justify-center gap-0.5 w-full h-full text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      aria-label={$t("common.upload")}
    >
      <div
        class="p-1.5 bg-primary-600 text-white rounded-lg shadow-md shadow-primary-600/20 active:scale-90 transition-all"
      >
        <Upload size={18} strokeWidth={2.5} />
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest"
        >{$t("common.upload")}</span
      >
    </a>

    <a
      href="/watch-later"
      class="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 {isRouteActive(
        '/watch-later',
      )
        ? 'text-primary-400'
        : 'text-surface-400'}"
      aria-label={$t("common.watchLater")}
      aria-current={isRouteActive('/watch-later') ? 'page' : undefined}
    >
      <div
        class="transition-transform duration-300 {isRouteActive('/watch-later')
          ? 'scale-110'
          : 'active:scale-90'}"
      >
        <Clock
          size={18}
          strokeWidth={isRouteActive("/watch-later") ? 2.5 : 2}
        />
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest"
        >{$t("common.watchLater")}</span
      >
      {#if isRouteActive("/watch-later")}
        <div
          class="absolute top-0 w-6 h-0.5 bg-primary-400 rounded-b-full"
        ></div>
      {/if}
    </a>

    <a
      href="/profile"
      class="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 {isRouteActive(
        '/profile',
      )
        ? 'text-primary-400'
        : 'text-surface-400'}"
      aria-label={$t("common.profile")}
      aria-current={isRouteActive('/profile') ? 'page' : undefined}
    >
      <div
        class="transition-transform duration-300 {isRouteActive('/profile')
          ? 'scale-110'
          : 'active:scale-90'}"
      >
        <User size={18} strokeWidth={isRouteActive("/profile") ? 2.5 : 2} />
      </div>
      <span class="text-[9px] font-black uppercase tracking-widest"
        >{$t("common.profile")}</span
      >
      {#if isRouteActive("/profile")}
        <div
          class="absolute top-0 w-6 h-0.5 bg-primary-400 rounded-b-full"
        ></div>
      {/if}
    </a>
  </div>
</nav>
