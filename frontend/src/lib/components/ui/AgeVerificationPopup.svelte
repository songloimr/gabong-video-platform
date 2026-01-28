<script lang="ts">
  import { AlertTriangle } from "@lucide/svelte";
  import { Dialog } from "@skeletonlabs/skeleton-svelte";
  import { browser } from "$app/environment";

  interface Props {
    open: boolean;
    onConfirm: () => void;
  }

  let { open = $bindable(false), onConfirm }: Props = $props();

  function handleConfirm() {
    if (browser) {
      localStorage.setItem('age_verified', 'true');
    }
    onConfirm();
    open = false;
  }

  function handleExit() {
    window.location.href = 'https://www.google.com';
  }
</script>

<Dialog {open} onOpenChange={(e) => {}}>
  <Dialog.Backdrop
    class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md animate-fade-in"
  />
  <Dialog.Positioner
    class="fixed inset-0 z-[201] flex items-center justify-center p-4"
  >
    <Dialog.Content
      class="relative bg-surface-900 rounded-lg shadow-2xl w-full max-w-md border border-surface-700 overflow-hidden animate-scale-in"
    >
      <div class="p-8 text-center">
        <div class="mx-auto w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-5 animate-pulse">
          <AlertTriangle size={36} class="text-yellow-500" strokeWidth={2.5} />
        </div>
        
        <h2 class="text-2xl font-display font-black text-surface-50 mb-3">
          Xác nhận độ tuổi
        </h2>
        
        <p class="text-surface-300 text-sm leading-relaxed mb-6">
          Trang web này chứa nội dung dành cho người trên 18 tuổi. 
          Bằng việc tiếp tục, bạn xác nhận rằng bạn đã đủ 18 tuổi.
        </p>

        <div class="flex flex-col gap-3">
          <button
            onclick={handleConfirm}
            class="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-display font-bold rounded-md transition-all hover:shadow-lg hover:shadow-primary-500/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
          >
            Tôi đủ 18 tuổi
          </button>
          <button
            onclick={handleExit}
            class="w-full py-3.5 px-4 bg-surface-800 hover:bg-surface-700 text-surface-200 font-body font-semibold rounded-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-600"
          >
            Thoát <span class="text-xs text-surface-500">(redirects to Google)</span>
          </button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
