<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth.svelte";
  import { loginModal } from "$lib/stores/loginModal.svelte";
  import { feedbackModal } from "$lib/stores/feedbackModal.svelte";
  import { sidebarState } from "$lib/stores/sidebar.svelte";
  import { t } from "$lib/stores/i18n";
  import Search from "$lib/components/search/SearchBar.svelte";
  import NotificationBell from "$lib/components/ui/NotificationBell.svelte";
  import LanguageSwitcher from "$lib/components/ui/LanguageSwitcher.svelte";
  import { getAvatarUrl } from "$lib/utils/formatters";
  import {
    Menu,
    Upload,
    User,
    LogOut,
    ChevronDown,
    Home,
    PlaySquare,
    Clock,
    X,
    MessageSquare,
  } from "@lucide/svelte";
  import { useLogout } from "$lib/api/mutations/auth";

  const logoutMutation = useLogout();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      goto("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
</script>

<header
  class="sticky top-0 z-50 transition-all duration-300 border-b border-surface-800/50 pt-safe"
>
  <div class="absolute inset-0 glass z-[-1]"></div>
  <div class="max-w-[1920px] mx-auto">
    <div class="px-3 sm:px-6 lg:px-8">
      <!-- Main Row -->
      <div
        class="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4"
      >
        <!-- Logo & Mobile Menu -->
        <div class="flex items-center gap-2 sm:gap-8">
          <button
            onclick={() => sidebarState.toggle()}
            class="lg:hidden p-2 text-surface-400 hover:bg-surface-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={sidebarState.isOpen ? $t("common.closeMenu") : $t("common.openMenu")}
            aria-expanded={sidebarState.isOpen}
          >
            {#if sidebarState.isOpen}
              <X size={20} strokeWidth={2.5} />
            {:else}
              <Menu size={20} strokeWidth={2.5} />
            {/if}
          </button>

          <a
            href="/"
            class="text-xl sm:text-2xl font-display font-black tracking-tighter text-gradient hover:opacity-80 transition-opacity"
          >
            Gabong
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <!-- <a
              href="/"
              class="group flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 font-display font-semibold text-xs
              {page.url.pathname === '/'
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-surface-400 hover:bg-surface-800 hover:text-primary-400'}"
            >
              <Home
                size={16}
                strokeWidth={page.url.pathname === "/" ? 2.5 : 2}
              />
              <span>{$t("common.home")}</span>
            </a> -->
            <button
              onclick={() => feedbackModal.open()}
              class="group flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 font-display font-semibold text-xs text-surface-400 hover:bg-surface-800 hover:text-primary-400"
            >
              <MessageSquare size={16} strokeWidth={2} />
              <span>Feedback</span>
            </button>
          </nav>
        </div>

        <!-- Search Bar (Desktop & Tablet) -->
        <div class="flex-1 max-w-xl hidden sm:block">
          <Search />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1 sm:gap-2">
          <div class="flex items-center gap-0.5 sm:gap-1">
            <LanguageSwitcher />
          </div>

          {#if auth.user}
            <div class="flex items-center gap-1 sm:gap-2">
              <a
                href="/videos/upload"
                class="hidden lg:flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg shadow-md shadow-primary-600/20 transition-all active:scale-95"
              >
                <Upload size={16} strokeWidth={2.5} />
                <span class="font-bold text-xs tracking-wide"
                  >{$t("common.upload")}</span
                >
              </a>

              <NotificationBell />

              <!-- User Dropdown -->
              <div class="relative group max-sm:hidden">
                <button
                  class="flex items-center gap-1 p-0.5 rounded-lg hover:bg-surface-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label={$t("common.userMenu")}
                  aria-haspopup="true"
                >
                  <div class="relative">
                    {#if auth.user.avatar_url}
                      <img
                        src={getAvatarUrl(auth.user.avatar_url)}
                        alt={auth.user.username}
                        class="w-8 h-8 rounded-lg object-cover ring-2 ring-surface-800/50 shadow-sm group-hover:ring-primary-500 transition-all"
                      />
                    {:else}
                      <div
                        class="w-8 h-8 rounded-lg bg-gradient-to-br from-surface-700 to-surface-800 flex items-center justify-center ring-2 ring-surface-800/50 shadow-sm group-hover:ring-primary-500 transition-all"
                      >
                        <User size={18} class="text-surface-400" />
                      </div>
                    {/if}
                  </div>
                  <ChevronDown
                    size={12}
                    class="hidden sm:block opacity-40 group-hover:opacity-100 transition-opacity"
                  />
                </button>

                <!-- Dropdown Menu -->
                <div
                  class="absolute right-0 mt-1 w-56 bg-surface-900 border border-surface-800 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 overflow-hidden"
                >
                  <div class="p-4 border-b border-surface-800/50">
                    <p class="font-bold text-surface-100 truncate text-sm">
                      {auth.user.username}
                    </p>
                    <p
                      class="text-[10px] text-surface-400 truncate mt-0.5 font-medium"
                    >
                      {auth.user.email}
                    </p>
                  </div>
                  <div class="p-1.5">
                    <a
                      href="/profile"
                      class="flex items-center gap-3 px-3 py-2 text-xs font-bold text-surface-300 hover:bg-primary-500/10 hover:text-primary-400 rounded-md transition-all"
                    >
                      <User size={16} />
                      {$t("common.profile")}
                    </a>
                    {#if auth.getUserRole() === "admin"}
                      <a
                        href="/admin"
                        class="flex items-center gap-3 px-3 py-2 text-xs font-bold text-surface-300 hover:bg-primary-500/10 hover:text-primary-400 rounded-md transition-all"
                      >
                        <Menu size={16} />
                        {$t("admin.dashboard")}
                      </a>
                    {/if}
                    <div class="my-1 border-t border-surface-800/50"></div>
                    <button
                      onclick={handleLogout}
                      disabled={logoutMutation.isPending}
                      class="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {$t("common.logout")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {:else}
            <div class="flex items-center gap-1 sm:gap-2">
              <button
                onclick={() => loginModal.open()}
                class="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-surface-400 hover:text-white transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>{$t("common.login")}</span>
              </button>
              <a
                href="/auth/register"
                class="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all active:scale-95 border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <span>{$t("common.register")}</span>
              </a>
            </div>
          {/if}
        </div>
      </div>

      <!-- Mobile Search Row -->
      <div class="sm:hidden pb-3">
        <Search />
      </div>
    </div>
  </div>
</header>
