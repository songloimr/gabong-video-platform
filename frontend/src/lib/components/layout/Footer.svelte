<script lang="ts">
  import { page } from "$app/state";
  import { t } from "$lib/stores/i18n";
  import type { LayoutData } from "../../../routes/(app)/$types";

  const { siteSettings } = $derived(page.data as LayoutData);
</script>

<footer
  class="hidden md:block bg-surface-950/30 border-t border-surface-800/50 pt-16 pb-8 mt-12 transition-all duration-300"
>
  <div class="max-w-480 mx-auto px-6 sm:px-8 lg:px-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div class="space-y-6">
        <div class="text-3xl font-black tracking-tighter text-gradient">
          {siteSettings.site_name}
        </div>
        <p
          class="text-sm font-medium text-surface-400 leading-relaxed max-w-xs"
        >
          {$t("footer.tagline")}
        </p>
      </div>

      <div class="space-y-6">
        <h4
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          {$t("footer.platform")}
        </h4>
        <ul class="space-y-4">
          <li>
            <a
              href="/"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("common.home")}</a
            >
          </li>
          <li>
            <a
              href="/videos"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("common.newest")}</a
            >
          </li>
          <li>
            <a
              href="/categories"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("common.categories")}</a
            >
          </li>
        </ul>
      </div>

      <div class="space-y-6">
        <h4
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          {$t("footer.community")}
        </h4>
        <ul class="space-y-4">
          <li>
            <a
              href="/playlists"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("common.playlists")}</a
            >
          </li>
          <li>
            <a
              href="/profiles"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("footer.creators")}</a
            >
          </li>
        </ul>
      </div>

      <div class="space-y-6">
        <h4
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          {$t("footer.legal")}
        </h4>
        <ul class="space-y-4">
          <li>
            <a
              href="/privacy"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("footer.privacyPolicy")}</a
            >
          </li>
          <li>
            <a
              href="/terms"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("footer.termsOfService")}</a
            >
          </li>
          <li>
            <a
              href="/cookies"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >{$t("footer.cookiePolicy")}</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-surface-800/50"
    >
      <div class="text-xs font-bold text-surface-500">
        &copy; {new Date().getFullYear()}
        {siteSettings.site_name}. {$t("footer.copyright")}
      </div>
      <div class="flex items-center gap-6">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span
          class="text-xs font-black uppercase tracking-widest text-surface-500"
          >{$t("footer.systemsOperational")}</span
        >
      </div>
    </div>
  </div>
</footer>
