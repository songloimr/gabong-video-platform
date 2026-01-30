<script lang="ts">
  import { t } from "$lib/stores/i18n";
  import { X } from "@lucide/svelte";
  import { Dialog } from "@skeletonlabs/skeleton-svelte";

  interface Props {
    open?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleConfirm() {
    onConfirm?.();
    open = false;
  }

  function handleCancel() {
    onCancel?.();
    open = false;
  }
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Backdrop
    class="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm transition-all duration-300"
  />
  <Dialog.Positioner
    class="fixed inset-0 z-101 flex items-center justify-center p-4 sm:p-6"
  >
    <Dialog.Content
      class="relative bg-surface-900 rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-surface-800 animate-in fade-in zoom-in duration-200"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-surface-800/50 bg-surface-800/50"
      >
        <Dialog.Title
          class="text-sm font-black uppercase tracking-widest text-surface-100"
        >
          {title || $t("common.confirm")}
        </Dialog.Title>
        <Dialog.CloseTrigger
          class="p-1 text-surface-400 hover:text-surface-200 transition-colors rounded-md hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={$t("common.close")}
        >
          <X size={18} strokeWidth={2.5} />
        </Dialog.CloseTrigger>
      </div>

      <div class="px-4 py-5">
        <p class="text-sm text-surface-300">{message}</p>
      </div>

      <div
        class="px-4 py-3 border-t border-surface-800/50 bg-surface-800/50 flex justify-end gap-2"
      >
        <button
          onclick={handleCancel}
          class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
        >
          {cancelText || $t("common.cancel")}
        </button>
        <button
          onclick={handleConfirm}
          class="px-4 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-bold"
        >
          {confirmText || $t("common.ok")}
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
