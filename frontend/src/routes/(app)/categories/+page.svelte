<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import Seo from "$lib/components/Seo.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo
  siteName={data.siteSettings.site_name}
  siteUrl={data.siteSettings.site_url}
  title={$t("common.categories")}
/>

<div class="container mx-auto px-4 py-6 md:py-8">
  <h1 class="text-2xl md:text-3xl font-display font-bold text-surface-100 mb-8">
    {$t("common.categories")}
  </h1>

  {#if data.categories.length > 0}
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
    >
      {#each data.categories as category (category.id)}
        <a
          href={`/categories/${category.slug}`}
          class="group relative flex flex-col bg-surface-900 rounded-md overflow-hidden border border-surface-800/50 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-22"
        >
          <div class="aspect-video bg-surface-800 relative overflow-hidden">
            <div
              class="absolute inset-0 bg-linear-to-br from-primary-500/15 to-primary-600/25"
            ></div>
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--color-primary-400)/0.2),transparent_70%)]"
            ></div>
            <div class="w-full h-full flex items-center justify-center p-3">
              <span
                class="text-sm sm:text-base text-white font-bold text-center leading-tight"
              >
                {category.name}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="text-center py-20 animate-fade-in">
      <div class="max-w-md mx-auto">
        <p class="text-lg font-black text-surface-100">
          {$t("common.noResults")}
        </p>
      </div>
    </div>
  {/if}
</div>
