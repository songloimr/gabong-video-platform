<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { auth } from "$lib/stores/auth.svelte";
  import { useUpdateProfile, useUpdateAvatar } from "$lib/api/mutations/users";
  import TipTapEditor from "$lib/components/forms/TipTapEditor.svelte";
  import {
    User,
    Mail,
    Calendar,
    Shield,
    Camera,
    Save,
    Loader2,
  } from "@lucide/svelte";
  import { toaster } from "$lib/toaster";
  import { getAvatarUrl } from "$lib/utils/formatters";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let authChecked = $state(false);

  onMount(() => {
    auth.loadAuth();
    authChecked = true;
  });

  $effect(() => {
    if (browser && authChecked && !auth.isAuthenticated) {
      // Show a brief loading message before redirect
      setTimeout(() => {
        goto("/auth/login?redirect=/profile");
      }, 100);
    }
  });

  let email = $state(auth.user?.email || "");
  let bio = $state(auth.user?.bio || "");
  let isUploadingAvatar = $state(false);
  let isSavingProfile = $state(false);
  let avatarKey = $state(Date.now());

  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} ${$t("common.units.b")}`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${$t("common.units.kb")}`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${$t("common.units.mb")}`;
  }

  function getErrorMessage(error: any): string {
    const data = error.response?.data;
    if (!data) return $t("profile.uploadError");

    if (data.message?.includes("file size")) {
      const match = data.message.match(/current file size is (\d+), expected size is less than (\d+)/);
      if (match) {
        const currentSize = formatFileSize(parseInt(match[1]));
        const maxSize = formatFileSize(parseInt(match[2]));
        return $t("profile.fileTooLarge", { values: { currentSize, maxSize } });
      }
    }

    return data.message || $t("profile.uploadError");
  }

  async function handleAvatarChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || isUploadingAvatar) return;

    isUploadingAvatar = true;
    try {
      const updatedUser = await updateAvatarMutation.mutateAsync(file);

      if (updatedUser && auth.user) {
        auth.setAuth({
          user: { ...auth.user, avatar_url: updatedUser.avatar_url },
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
        });
        avatarKey = Date.now();
        toaster.create({ title: $t("common.success"), description: $t("profile.avatarUpdated"), type: "success" });
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toaster.create({ title: $t("common.error"), description: getErrorMessage(error), type: "error" });
    } finally {
      isUploadingAvatar = false;
      target.value = "";
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (isSavingProfile) return;

    isSavingProfile = true;
    try {
      const updatedUser = await updateProfileMutation.mutateAsync({ email, bio });

      if (updatedUser) {
        auth.setAuth({
          user: updatedUser,
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
        });
      }

      toaster.create({ title: $t("common.success"), description: $t("profile.profileUpdated"), type: "success" });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toaster.create({ title: $t("common.error"), description: error.response?.data?.message || $t("profile.updateError"), type: "error" });
    } finally {
      isSavingProfile = false;
    }
  }
</script>

<svelte:head>
  <title>{$t("profile.title")} - Gabong</title>
</svelte:head>

{#if !auth.isAuthenticated && authChecked}
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
    <div class="text-center space-y-4 animate-fade-in">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-2">
        <Loader2 size={32} class="text-primary-400 animate-spin" />
      </div>
      <h2 class="text-xl font-bold text-surface-100">{$t("auth.authRequired")}</h2>
      <p class="text-sm text-surface-400">{$t("auth.redirecting")}</p>
    </div>
  </div>
{:else}
<div class="min-h-[calc(100vh-120px)] px-4 py-6 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    <div class="bg-surface-900/80 backdrop-blur-sm rounded-2xl border border-surface-800/50 overflow-hidden">
      <div class="relative">
        <div class="h-24 sm:h-32 bg-gradient-to-br from-primary-600/30 via-primary-700/20 to-surface-900">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--color-primary-500)/0.15),transparent_50%)]"></div>
        </div>
        
        <div class="relative -mt-12 sm:-mt-14 px-4 sm:px-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div class="relative shrink-0 group">
              {#if isUploadingAvatar}
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-surface-900 shadow-xl bg-surface-800 flex items-center justify-center">
                  <Loader2 size={32} class="text-primary-400 animate-spin" />
                </div>
              {:else}
                <img
                  src="{getAvatarUrl(auth.user?.avatar_url!)}"
                  alt={$t("common.avatar")}
                  loading="lazy"
                  decoding="async"
                  class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-surface-900 shadow-xl"
                />
                <label
                  class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={24} class="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={handleAvatarChange}
                  />
                </label>
              {/if}
            </div>

            <div class="flex-1 pb-3 text-center sm:text-left">
              <h1 class="text-xl sm:text-2xl font-black tracking-tight text-surface-50">
                {auth.user?.username}
              </h1>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-surface-400">
                  <Shield size={14} class="text-primary-400" />
                  <span class="uppercase tracking-wide">{auth.user?.role}</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs font-medium text-surface-500">
                  <Calendar size={14} />
                  <span>
                    {auth.user?.created_at
                      ? $t("profile.joined", { values: { date: new Date(auth.user.created_at).toLocaleDateString() } })
                      : $t("common.notAvailable")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center sm:justify-start gap-2 mt-4 pb-4 sm:hidden">
            <label
              class="flex items-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              class:opacity-50={isUploadingAvatar}
              class:cursor-not-allowed={isUploadingAvatar}
            >
              {#if isUploadingAvatar}
                <Loader2 size={16} class="animate-spin" />
                <span>{$t("common.uploading")}</span>
              {:else}
                <Camera size={16} />
                <span>{$t("profile.changeAvatar")}</span>
              {/if}
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
        </div>
      </div>

      <form onsubmit={handleSubmit}>
        <div class="px-4 sm:px-6 pb-6 space-y-5">
          <div class="flex items-center gap-2 pt-2 border-t border-surface-800/50">
            <h2 class="text-[10px] font-black uppercase tracking-[0.15em] text-surface-500 py-3">
              {$t("profile.info")}
            </h2>
          </div>

          <div class="space-y-2">
            <label
              for="username"
              class="text-[10px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-2"
            >
              <User size={12} />
              {$t("common.username")}
            </label>
            <input
              id="username"
              type="text"
              value={auth.user?.username || ""}
              disabled
              class="w-full px-4 py-3 bg-surface-800/30 border border-surface-700/50 rounded-xl text-sm font-medium text-surface-400 cursor-not-allowed"
            />
          </div>

          <div class="space-y-2">
            <label
              for="email"
              class="text-[10px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-2"
            >
              <Mail size={12} />
              {$t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              class="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-sm font-medium text-surface-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
            />
          </div>

          <div class="space-y-2">
            <label
              for="bio"
              class="text-[10px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-2"
            >
              <Shield size={12} />
              {$t("profile.bio")}
            </label>
            <TipTapEditor
              bind:value={bio}
              placeholder={$t("profile.bioPlaceholder")}
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              class="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
            >
              {#if isSavingProfile}
                <Loader2 size={16} class="animate-spin" />
                <span>{$t("profile.saving")}</span>
              {:else}
                <Save size={16} />
                <span>{$t("profile.saveChanges")}</span>
              {/if}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}
