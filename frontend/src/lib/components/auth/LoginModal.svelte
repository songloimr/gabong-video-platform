<script lang="ts">
  import { loginModal } from "$lib/stores/loginModal.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { useLogin } from "$lib/api/mutations/auth";
  import { goto } from "$app/navigation";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { t } from "svelte-i18n";
  import { User, Lock, Loader2 } from "@lucide/svelte";

  let username = $state("");
  let password = $state("");
  let rememberMe = $state(true);
  let error = $state("");

  const loginMutation = useLogin();

  async function handleLogin() {
    error = "";
    try {
      const result = await loginMutation.mutateAsync({
        username,
        password,
        remember_me: rememberMe,
      });

      auth.setAuth({
        user: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      loginModal.close();
    } catch (e: any) {
      error =
        e.response?.data?.message ||
        "Login failed. Please check your credentials.";
    }
  }

  function handleRegister() {
    loginModal.close();
    goto("/auth/register");
  }
</script>

<Modal bind:open={loginModal.isOpen} title={$t("auth.loginTitle")} size="sm">
  <form onsubmit={handleLogin} class="space-y-3 pt-1">
    {#if error}
      <div
        class="p-2.5 text-[11px] font-bold text-red-500 bg-red-950/20 rounded-lg border border-red-900/30"
      >
        {error}
      </div>
    {/if}

    <div class="space-y-3">
      <div class="relative">
        <label for="modal-username" class="sr-only">{$t("auth.username")}</label
        >
        <div
          class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
        >
          <User size={14} strokeWidth={2.5} />
        </div>
        <input
          id="modal-username"
          type="text"
          bind:value={username}
          placeholder={$t("auth.username")}
          required
          class="w-full pl-9 pr-3 py-2.5 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
        />
      </div>

      <div class="relative">
        <label for="modal-password" class="sr-only">{$t("auth.password")}</label
        >
        <div
          class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
        >
          <Lock size={14} strokeWidth={2.5} />
        </div>
        <input
          id="modal-password"
          type="password"
          bind:value={password}
          placeholder={$t("auth.password")}
          required
          class="w-full pl-9 pr-3 py-2.5 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
        />
      </div>
    </div>

    <div class="flex items-center justify-between py-0.5">
      <label class="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          bind:checked={rememberMe}
          class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
        <span
          class="text-[11px] font-bold text-surface-400 group-hover:text-surface-100 transition-colors"
        >
          {$t("auth.rememberMe")}
        </span>
      </label>
      <a
        href="/auth/forgot-password"
        class="text-[11px] font-black text-primary-600 hover:underline"
        onclick={() => loginModal.close()}
      >
        {$t("auth.forgotPassword")}?
      </a>
    </div>

    <button
      type="submit"
      disabled={loginMutation.isPending}
      class="w-full py-2.5 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
    >
      {#if loginMutation.isPending}
        <div
          class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></div>
        <span>{$t("auth.loggingIn")}...</span>
      {:else}
        <span>{$t("auth.login")}</span>
      {/if}
    </button>

    <div class="text-center pt-2">
      <p class="text-[11px] font-bold text-surface-400">
        {$t("auth.noAccount")}
        <a
          href="/auth/register"
          class="text-primary-600 hover:underline font-black"
          onclick={() => loginModal.close()}
        >
          {$t("auth.register")}
        </a>
      </p>
    </div>
  </form>
</Modal>
