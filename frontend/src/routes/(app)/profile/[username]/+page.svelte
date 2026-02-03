<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { page } from "$app/state";
  import { useUser } from "$lib/api/queries/users";
  import { auth } from "$lib/stores/auth.svelte";
  import { getAvatarUrl } from "$lib/utils/formatters";
  import Seo from "$lib/components/Seo.svelte";

  const userQuery = useUser(page.params.username!);

  const isOwnProfile = $derived(auth.user?.username === page.params.username!);
</script>

<Seo title={userQuery.data?.username || $t("common.profile")} />

<div class="container mx-auto px-4 py-6 md:py-8">
  {#if userQuery.isLoading}
    <div class="flex items-center justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if userQuery.data}
    <div class="mb-8">
      <div
        class="bg-surface-800 rounded-lg p-6 md:flex md:items-center md:gap-8"
      >
        {#if userQuery.data.avatar_url}
          <img
            src={getAvatarUrl(userQuery.data.avatar_url)}
            alt={userQuery.data.username}
            loading="lazy"
            decoding="async"
            class="w-24 h-24 rounded-full ring-4 ring-surface-800/50 shadow-lg"
          />
        {:else}
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-surface-800/50 shadow-lg"
          >
            {userQuery.data.username.charAt(0).toUpperCase()}
          </div>
        {/if}

        <div class="flex-1">
          <h1 class="text-2xl md:text-3xl font-bold text-surface-100">
            {userQuery.data.username}
          </h1>
          {#if userQuery.data.bio}
            <p class="text-surface-400 mt-2">
              {userQuery.data.bio}
            </p>
          {/if}
          <p class="text-sm text-surface-500">
            {$t("profile.joined", { values: { date: new Date(userQuery.data.created_at).toLocaleDateString() } })}
          </p>
          {#if isOwnProfile}
            <a href="/profile" class="text-primary-400 hover:underline">
              {$t("profile.editProfile")}
            </a>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-lg text-surface-400">{$t("errors.userNotFound")}</p>
    </div>
  {/if}
</div>
