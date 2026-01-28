<script lang="ts">
  import { t } from "svelte-i18n";
</script>

<footer
  class="hidden md:block bg-surface-950/30 border-t border-surface-800/50 pt-16 pb-8 mt-12 transition-all duration-300"
>
  <div class="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div class="space-y-6">
        <div class="text-3xl font-black tracking-tighter text-gradient">
          Gabong
        </div>
        <p
          class="text-sm font-medium text-surface-400 leading-relaxed max-w-xs"
        >
          The next generation video streaming platform for creators and viewers
          alike. Enjoy high quality content, anywhere.
        </p>
      </div>

      <div class="space-y-6">
        <h4
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          Platform
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
          Community
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
              >Creators</a
            >
          </li>
        </ul>
      </div>

      <div class="space-y-6">
        <h4
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          Legal
        </h4>
        <ul class="space-y-4">
          <li>
            <a
              href="/privacy"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >Privacy Policy</a
            >
          </li>
          <li>
            <a
              href="/terms"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >Terms of Service</a
            >
          </li>
          <li>
            <a
              href="/cookies"
              class="text-sm font-semibold text-surface-400 hover:text-primary-400 transition-colors"
              >Cookie Policy</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-surface-800/50"
    >
      <div class="text-xs font-bold text-surface-500">
        &copy; {new Date().getFullYear()} Gabong Video Platform. All rights reserved.
      </div>
      <div class="flex items-center gap-6">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span
          class="text-xs font-black uppercase tracking-widest text-surface-500"
          >Systems Operational</span
        >
      </div>
    </div>
  </div>
</footer>
