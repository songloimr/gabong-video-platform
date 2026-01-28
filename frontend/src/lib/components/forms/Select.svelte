<script lang="ts">
  export let label = '';
  export let value = '';
  export let options: { value: string; label: string }[] = [];
  export let error = '';
</script>

<label class="label">
  {#if label}<span class="label-text">{label}</span>{/if}
  <select class="select" class:select-error={error} bind:value {...$$restProps}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if error}<span class="label-text-alt text-error">{error}</span>{/if}
</label>