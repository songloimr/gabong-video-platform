<script lang="ts">
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let error = '';
  export let rows = 3;
</script>

<label class="label">
  {#if label}<span class="label-text">{label}</span>{/if}
  <textarea class="textarea" class:textarea-error={error} {placeholder} {rows} bind:value {...$$restProps}></textarea>
  {#if error}<span class="label-text-alt text-error">{error}</span>{/if}
</label>