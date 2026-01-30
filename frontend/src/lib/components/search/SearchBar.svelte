<script lang="ts">
  import { goto } from "$app/navigation";
  import { t } from "$lib/stores/i18n";
  import { Search as SearchIcon, X } from "@lucide/svelte";

  let { class: className = "" } = $props();
  let query = $state("");

  function handleSearch() {
    if (!query.trim()) return;
    goto(`/search?q=${encodeURIComponent(query)}`);
  }
</script>

<div class="relative w-full group {className}">
  <div
    class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors z-10 pointer-events-none"
  >
    <SearchIcon size={16} strokeWidth={2.5} />
  </div>
  <input
    type="text"
    bind:value={query}
    onkeydown={(e) => e.key === "Enter" && handleSearch()}
    placeholder={$t("common.search")}
    aria-label={$t("common.search")}
    class="w-full pl-9 pr-9 py-2 bg-surface-800/40 border border-transparent focus:border-primary-500/50 focus:bg-surface-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-950 rounded text-sm font-body text-surface-100 placeholder:text-surface-500 transition-all outline-none"
  />
  {#if query}
    <button
      type="button"
      onclick={() => (query = "")}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors z-10 focus-visible:outline-none focus-visible:text-primary-400"
      aria-label="Clear search"
    >
      <X size={16} strokeWidth={2.5} />
    </button>
  {/if}
</div>
