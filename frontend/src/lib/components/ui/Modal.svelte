<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "@lucide/svelte";
  import { Dialog } from "@skeletonlabs/skeleton-svelte";

  interface Props {
    open?: boolean;
    title?: string;
    size?: "sm" | "md" | "lg" | "full";
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    title,
    size = "md",
    children,
    footer,
  }: Props = $props();
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Backdrop
    class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-all duration-300"
  />
  <Dialog.Positioner
    class="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
  >
    <Dialog.Content
      class="relative bg-surface-900 rounded-lg shadow-2xl max-w-full max-h-[90vh] flex flex-col overflow-hidden border border-surface-800 animate-in fade-in zoom-in duration-200
        {size === 'sm' ? 'w-full max-w-md' : ''}
        {size === 'md' ? 'w-full max-w-lg' : ''}
        {size === 'lg' ? 'w-full max-w-2xl' : ''}
        {size === 'full' ? 'w-full max-w-6xl' : ''}"
    >
      {#if title}
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-surface-800/50 bg-surface-800/50"
        >
          <Dialog.Title
            class="text-sm font-black uppercase tracking-widest text-surface-100"
          >
            {title}
          </Dialog.Title>
          <Dialog.CloseTrigger
            class="p-1 text-surface-400 hover:text-surface-200 transition-colors rounded-md hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={2.5} />
          </Dialog.CloseTrigger>
        </div>
      {/if}

      <div class="flex-1 overflow-y-auto px-4 py-5">
        {@render children()}
      </div>

      {#if footer}
        <div
          class="px-4 py-3 border-t border-surface-800/50 bg-surface-800/50 flex justify-end gap-2"
        >
          {@render footer()}
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
