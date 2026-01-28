<script lang="ts">
  import { t } from 'svelte-i18n';
  export let onClick: () => void;
  export let hasMore = false;
  export let loading = false;
</script>

{#if hasMore}
  <div class="flex justify-center mt-4">
    <button
      class="btn btn-ghost text-primary-600"
      disabled={loading}
      on:click={onClick}
    >
      {loading ? $t('common.loading') : $t('comment.loadMore')}
    </button>
  </div>
{/if}