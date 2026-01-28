<script lang="ts">
  import { type Snippet } from "svelte";
  import { page } from "$app/state";
  import { auth } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { Loader2 } from "@lucide/svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  interface Props {
    children: Snippet;
    requiredRole?: "admin" | "user";
  }

  let { children, requiredRole = "user" }: Props = $props();
  let isChecking = $state(true);
  let authLoaded = $state(false);

  onMount(() => {
    auth.loadAuth();
    authLoaded = true;
  });

  $effect(() => {
    if (!browser || !authLoaded) return;

    if (!auth.isAuthenticated) {
      const currentPath = page.url.pathname + page.url.search;
      if (!currentPath.startsWith('/auth/')) {
        goto(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } else if (requiredRole === "admin" && auth.getUserRole() !== "admin") {
      goto("/");
    } else {
      isChecking = false;
    }
  });
</script>

{#if isChecking}
  <div class="flex items-center justify-center min-h-[50vh]">
    <div class="flex flex-col items-center gap-2">
      <div class="animate-spin text-primary">
        <Loader2 size={32} />
      </div>
      <p class="text-sm text-muted-foreground italic">
        Checking authentication...
      </p>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
