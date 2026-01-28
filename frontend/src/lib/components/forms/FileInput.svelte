<script lang="ts">
  export let label = '';
  export let error = '';
  export let accept = 'video/*';
  export let multiple = false;
  
  let files: FileList;
</script>

<label class="label">
  {#if label}<span class="label-text">{label}</span>{/if}
  <input
    type="file"
    class="file-input file-input-bordered w-full"
    class:file-input-error={error}
    {accept}
    {multiple}
    bind:files
    {...$$restProps}
  />
  {#if error}<span class="label-text-alt text-error">{error}</span>{/if}
</label>