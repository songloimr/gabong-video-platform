<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { User, Lock, ArrowRight, Loader2 } from "@lucide/svelte";
  import { useLogin } from "$lib/api/mutations/auth";
  import { auth } from "$lib/stores/auth.svelte";
  import { page } from "$app/state";
  import { errorDialog } from "$lib/stores/errorDialog.svelte";

  const loginMutation = useLogin();
  let username = $state("");
  let password = $state("");
  let rememberMe = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    try {
      const result = await loginMutation.mutateAsync({
        username,
        password,
        remember_me: rememberMe ? true : undefined,
      })

      auth.setAuth({
        user: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      // Get redirect path from query param or default to home
      const redirectPath = page.url.searchParams.get("redirect") || "/";

      // Perform full page refresh as requested by user
      window.location.href = redirectPath;
    } catch (e: any) {
      const message =
        e.response?.data?.message ||
        $t("auth.loginFailedDesc");
      errorDialog.show($t("auth.loginFailedTitle"), message);
      loginMutation.reset();
    }
  }
</script>

<div
  class="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in overflow-hidden bg-surface-950"
>
  <!-- Decorative background elements -->
  <div
    class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
  >
    <div
      class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full"
    ></div>
    <div
      class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-surface-600/10 blur-[120px] rounded-full"
    ></div>
  </div>

  <!-- Login Form Card -->
  <div class="relative w-full max-w-105 z-10">
    <div
      class="bg-surface-900/50 backdrop-blur-xl border border-white/5 shadow-2xl rounded-lg overflow-hidden p-8 sm:p-10"
    >
      <div class="space-y-8">
        <div class="text-center space-y-2">
          <h1
            class="text-3xl font-display font-black text-surface-100 tracking-tighter uppercase"
          >
            {@html $t("auth.welcomeBack")}
          </h1>
          <p class="text-xs font-body font-semibold text-surface-400">
            {$t("auth.hasAccount")}
            <a
              href="/auth/register"
              class="text-primary-400 font-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              {$t("auth.register")}
            </a>
          </p>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="space-y-4">
            <div class="relative group">
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
              >
                <User
                  size={14}
                  strokeWidth={2.5}
                  class="group-focus-within:text-primary-600 transition-colors"
                />
              </div>
              <input
                id="username"
                type="text"
                bind:value={username}
                placeholder={$t("auth.username")}
                class="w-full pl-9 pr-3 py-2.5 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600"
                required
              />
            </div>

            <div class="relative group">
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
              >
                <Lock
                  size={14}
                  strokeWidth={2.5}
                  class="group-focus-within:text-primary-600 transition-colors"
                />
              </div>
              <input
                id="password"
                type="password"
                bind:value={password}
                placeholder={$t("auth.password")}
                class="w-full pl-9 pr-3 py-2.5 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600"
                required
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                id="remember"
                bind:checked={rememberMe}
                class="w-4 h-4 rounded border-surface-800 text-primary-600 focus:ring-2 focus:ring-primary-500/20 cursor-pointer bg-surface-950"
              />
              <span
                class="text-xs font-bold text-surface-400 group-hover:text-surface-100 transition-colors"
              >
                {$t("auth.rememberMeText")}
              </span>
            </label>
            <a
              href="/auth/forgot-password"
              class="text-xs font-black text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              {$t("auth.forgotPassword")}
            </a>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || !username || !password}
            class="w-full py-3 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-lg hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 min-h-11"
          >
            {#if loginMutation.isPending}
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              <span>{$t("auth.loggingIn")}</span>
            {:else}
              <span>{$t("auth.login")}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
