<script lang="ts">
  import AuthGuard from "$lib/components/auth/AuthGuard.svelte";
  import AdminSidebar from "$lib/components/admin/AdminSidebar.svelte";
  import { Menu } from "@lucide/svelte";

  let { children } = $props();
  let sidebarOpen = $state(false);
</script>

<AuthGuard requiredRole="admin">
  <div
    class="flex min-h-screen bg-surface-950 text-surface-200 lg:flex-row flex-col"
  >
    <!-- Mobile Header -->
    <header
      class="lg:hidden flex items-center justify-between p-4 bg-surface-950 border-b border-surface-800/50 sticky top-0 z-30"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-sm bg-primary-500/10 flex items-center justify-center border border-primary-500/20"
        >
          <div class="w-4 h-4 bg-primary-500 rounded-full"></div>
        </div>
        <span
          class="text-xs font-black uppercase tracking-widest text-surface-100"
          >Admin Panel</span
        >
      </div>
      <button
        class="p-2 rounded-sm bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
        onclick={() => (sidebarOpen = !sidebarOpen)}
      >
        <Menu size={20} />
      </button>
    </header>

    <!-- Admin Sidebar -->
    <AdminSidebar bind:isOpen={sidebarOpen} />

    <!-- Admin Content -->
    <main class="flex-1 overflow-x-hidden relative">
      <!-- Background Decorative Element -->
      <div
        class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
      ></div>

      <div class="relative p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
        {@render children()}
      </div>
    </main>
  </div>
</AuthGuard>
