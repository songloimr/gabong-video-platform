<script lang="ts">
  import { locale, locales } from "svelte-i18n";
  import { browser } from "$app/environment";
  import { Languages } from "@lucide/svelte";

  const languageNames: Record<string, string> = {
    vi: "Tiếng Việt",
    en: "English",
  };

  let isOpen = $state(false);

  function switchLocale(newLocale: string) {
    locale.set(newLocale);
    if (browser) {
      localStorage.setItem("locale", newLocale);
    }
    isOpen = false;
  }
</script>

<div class="relative">
  <button
    onclick={() => (isOpen = !isOpen)}
    class="p-2 text-surface-300 hover:text-primary-400 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
    aria-label="Change language"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <Languages size={20} />
    <span class="hidden sm:inline ml-2">{languageNames[$locale || "vi"]}</span>
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-40 bg-surface-800 border border-surface-700 rounded-lg shadow-lg z-50"
      role="listbox"
      aria-label="Available languages"
    >
      {#each $locales as lang}
        <button
          onclick={() => switchLocale(lang)}
          class="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-700 text-surface-300 focus-visible:outline-none focus-visible:bg-surface-700 {$locale ===
          lang
            ? 'font-bold'
            : ''}"
          role="option"
          aria-selected={$locale === lang}
        >
          <span>{languageNames[lang]}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
