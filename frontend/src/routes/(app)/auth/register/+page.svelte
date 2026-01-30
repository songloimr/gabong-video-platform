<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import {
    User,
    Lock,
    Mail,
    ArrowRight,
    LoaderCircle,
    AlertCircle,
    Check,
    X as XIcon,
  } from "@lucide/svelte";
  import { useRegister } from "$lib/api/mutations/auth";
  import {
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    validateUsername,
    validatePassword,
  } from "$lib/utils/validation";
  import { errorDialog } from "$lib/stores/errorDialog.svelte";

  const registerMutation = useRegister();
  let username = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let formError = $state("");

  // Password strength calculation
  const passwordStrength = $derived(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: $t("passwordStrength.weak"), color: "bg-red-500" };
    if (score <= 3) return { score, label: $t("passwordStrength.fair"), color: "bg-yellow-500" };
    if (score <= 4) return { score, label: $t("passwordStrength.good"), color: "bg-blue-500" };
    return { score, label: $t("passwordStrength.strong"), color: "bg-green-500" };
  });

  // Derived validation
  const usernameError = $derived(username ? validateUsername(username) : null);
  const passwordError = $derived(password ? validatePassword(password) : null);
  const confirmError = $derived(
    confirmPassword && password !== confirmPassword
      ? $t("auth.confirmPasswordMismatch")
      : null,
  );

  const isFormValid = $derived(
    username &&
      password &&
      confirmPassword &&
      !usernameError &&
      !passwordError &&
      password === confirmPassword,
  );

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = "";

    const usernameValidation = validateUsername(username);
    if (usernameValidation) {
      formError = usernameValidation;
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      formError = passwordValidation;
      return;
    }

    if (password !== confirmPassword) {
      formError = $t("auth.confirmPasswordMismatch");
      return;
    }

    registerMutation.mutate({
      username: username.toLowerCase(),
      password,
      email: email || undefined,
    }, {
      onSuccess: () => {
        window.location.href = '/';
      },
      onError: (e: any) => {
        const message = e.response?.data?.message || $t("auth.registrationFailedDesc");
        errorDialog.show($t("auth.registrationFailedTitle"), message);
      },
    });
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
      class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full"
    ></div>
    <div
      class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-surface-600/10 blur-[120px] rounded-full"
    ></div>
  </div>

  <!-- Register Form Card -->
  <div class="relative w-full max-w-[500px] z-10 py-12">
    <div
      class="bg-surface-900/50 backdrop-blur-xl border border-white/5 shadow-2xl rounded-lg overflow-hidden p-8 sm:p-10"
    >
      <div class="space-y-8">
        <div class="text-center space-y-2">
          <h1
            class="text-3xl font-display font-black text-surface-100 tracking-tighter uppercase"
          >
            {$t("auth.accountText")} <span class="text-primary-600">{$t("auth.createAccount")}</span>
          </h1>
          <p class="text-xs font-body font-semibold text-surface-400">
            {$t("auth.noAccount")}
            <a
              href="/auth/login"
              class="text-primary-400 font-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              {$t("auth.login")}
            </a>
          </p>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">

          <!-- Validation Error Message (form-level only) -->
          {#if formError}
            <div
              class="flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-500 font-bold text-xs animate-shake"
            >
              <AlertCircle size={16} strokeWidth={2.5} />
              {formError}
            </div>
          {/if}

          <div class="space-y-4">
            <!-- Username -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between ml-1 mr-1">
                <label
                  for="username"
                  class="block text-xs font-black uppercase tracking-wider text-surface-400"
                >
                  {$t("auth.username")} * <span class="text-surface-600 text-[10px] font-normal normal-case">({$t("auth.minChars", { values: { min: 3 } })}, a-z, 0-9)</span>
                </label>
                <span
                  class="text-xs font-bold {username.length >
                  USERNAME_MAX_LENGTH
                    ? 'text-red-400'
                    : 'text-surface-500'}"
                >
                  {username.length}/{USERNAME_MAX_LENGTH}
                </span>
              </div>
              <div class="relative group">
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
                >
                  <User
                    size={16}
                    strokeWidth={2.5}
                    class="group-focus-within:text-primary-600 transition-colors"
                  />
                </div>
                <input
                  id="username"
                  type="text"
                  bind:value={username}
                  placeholder={$t("auth.usernamePlaceholder")}
                  maxlength={USERNAME_MAX_LENGTH + 5}
                  class="w-full pl-10 pr-3 py-3 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600 {usernameError
                    ? 'border-red-500/50'
                    : ''}"
                  required
                />
              </div>
              {#if usernameError}
                <p
                  class="text-xs font-bold text-red-500 ml-1 animate-fade-in flex items-center gap-1"
                >
                  <XIcon size={12} />
                  {usernameError}
                </p>
              {/if}
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label
                for="email"
                class="block text-xs font-black uppercase tracking-wider text-surface-400 ml-1"
              >
                {$t("auth.email")}
                <span class="text-surface-600 text-[10px] font-normal normal-case">{$t("auth.optional")}</span>
              </label>
              <div class="relative group">
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
                >
                  <Mail
                    size={16}
                    strokeWidth={2.5}
                    class="group-focus-within:text-primary-600 transition-colors"
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  placeholder={$t("auth.emailPlaceholder")}
                  class="w-full pl-10 pr-3 py-3 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600"
                />
              </div>
            </div>

            <!-- Password Fields -->
            <div class="space-y-4">
              <!-- Password -->
              <div class="space-y-1.5">
                <label
                  for="password"
                  class="block text-xs font-black uppercase tracking-wider text-surface-400 ml-1"
                >
                  {$t("auth.password")} * <span class="text-surface-600 text-[10px] font-normal normal-case">({$t("auth.minChars", { values: { min: PASSWORD_MIN_LENGTH } })})</span>
                </label>
                <div class="relative group">
                  <div
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
                  >
                    <Lock
                      size={16}
                      strokeWidth={2.5}
                      class="group-focus-within:text-primary-600 transition-colors"
                    />
                  </div>
                  <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="••••••••"
                    maxlength={PASSWORD_MAX_LENGTH + 5}
                    class="w-full pl-10 pr-3 py-3 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600 {passwordError
                      ? 'border-red-500/50'
                      : ''}"
                    required
                  />
                </div>
                
                <!-- Password Strength Indicator -->
                {#if password}
                  <div class="ml-1 space-y-1.5 animate-fade-in">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div class="h-full {passwordStrength().color} transition-all duration-300" style="width: {(passwordStrength().score / 5) * 100}%"></div>
                      </div>
                      <span class="text-xs font-bold {passwordStrength().color.replace('bg-', 'text-')}">{passwordStrength().label}</span>
                    </div>
                    <div class="text-[10px] text-surface-500 space-y-0.5">
                      <div class="flex items-center gap-1.5">
                        {#if password.length >= 8}<Check size={10} class="text-green-500" />{:else}<XIcon size={10} class="text-surface-600" />{/if}
                        <span>{$t("auth.passwordRequirements.minChars")}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        {#if /[a-z]/.test(password) && /[A-Z]/.test(password)}<Check size={10} class="text-green-500" />{:else}<XIcon size={10} class="text-surface-600" />{/if}
                        <span>{$t("auth.passwordRequirements.case")}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        {#if /\d/.test(password)}<Check size={10} class="text-green-500" />{:else}<XIcon size={10} class="text-surface-600" />{/if}
                        <span>{$t("auth.passwordRequirements.number")}</span>
                      </div>
                    </div>
                  </div>
                {/if}
                
                {#if passwordError}
                  <p
                    class="text-xs font-bold text-red-500 ml-1 animate-fade-in flex items-center gap-1"
                  >
                    <XIcon size={12} />
                    {passwordError}
                  </p>
                {/if}
              </div>

              <!-- Confirm Password -->
              <div class="space-y-1.5">
                <label
                  for="confirmPassword"
                  class="block text-xs font-black uppercase tracking-wider text-surface-400 ml-1"
                >
                  {$t("auth.confirmPassword")} *
                </label>
                <div class="relative group">
                  <div
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10"
                  >
                    <Lock
                      size={16}
                      strokeWidth={2.5}
                      class="group-focus-within:text-primary-600 transition-colors"
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    bind:value={confirmPassword}
                    placeholder="••••••••"
                    maxlength={PASSWORD_MAX_LENGTH + 5}
                    class="w-full pl-10 pr-3 py-3 bg-surface-950 border border-surface-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-surface-100 placeholder:text-surface-600 {confirmError
                      ? 'border-red-500/50'
                      : ''}"
                    required
                  />
                </div>
                {#if confirmError}
                  <p
                    class="text-xs font-bold text-red-500 ml-1 animate-fade-in flex items-center gap-1"
                  >
                    <XIcon size={12} />
                    {confirmError}
                  </p>
                {:else if confirmPassword && password === confirmPassword}
                  <p class="text-xs font-bold text-green-500 ml-1 animate-fade-in flex items-center gap-1">
                    <Check size={12} />
                    {$t("auth.passwordsMatch")}
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending || !isFormValid}
            class="w-full py-3 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-lg hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 min-h-[44px]"
          >
            {#if registerMutation.isPending}
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              <span>{$t("auth.registering")}</span>
            {:else}
              <span>{$t("auth.register")}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
