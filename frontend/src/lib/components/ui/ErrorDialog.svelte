<script lang="ts">
  import { X, TriangleAlert } from "@lucide/svelte";
  import { Dialog } from "@skeletonlabs/skeleton-svelte";
  import { errorDialog } from "$lib/stores/errorDialog.svelte";
</script>

<Dialog open={errorDialog.open} onOpenChange={(e) => (errorDialog.open = e.open)}>
  <Dialog.Backdrop
    class="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm transition-all duration-300"
  />
  <Dialog.Positioner
    class="fixed inset-0 z-101 flex items-center justify-center p-4 sm:p-6"
  >
    <Dialog.Content
      class="relative bg-surface-900 rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-surface-700/50 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Close button - absolute positioned -->
      <Dialog.CloseTrigger
        class="absolute top-3 right-3 p-1.5 text-surface-500 hover:text-surface-300 transition-colors rounded-lg hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 z-10"
        aria-label="Close dialog"
      >
        <X size={18} strokeWidth={2} />
      </Dialog.CloseTrigger>

      <!-- Content -->
      <div class="px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <!-- Icon -->
        <div
          class="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5 ring-1 ring-red-500/20"
        >
          <TriangleAlert size={28} strokeWidth={2} class="text-red-400" />
        </div>

        <!-- Title -->
        <Dialog.Title class="text-lg font-semibold text-surface-50 mb-2">
          {errorDialog.title}
        </Dialog.Title>

        <!-- Message -->
        <p class="text-sm text-surface-400 leading-relaxed max-w-70">
          {errorDialog.message}
        </p>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6 pt-2">
        <button
          onclick={() => errorDialog.hide()}
          class="w-full px-4 py-2.5 rounded-lg bg-surface-800 text-surface-200 hover:bg-surface-700 active:bg-surface-750 transition-all duration-150 text-sm font-medium border border-surface-700 hover:border-surface-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
        >
          Got it
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
