<script lang="ts">
  import { MessageSquare, Bug, Lightbulb, HelpCircle, Send, Loader2 } from '@lucide/svelte';
  import Modal from './ui/Modal.svelte';
  import { feedbackModal } from '$lib/stores/feedbackModal.svelte';
  import { useCreateFeedback } from '$lib/api/mutations/feedbacks';
  import { toaster } from '$lib/toaster';
  import type { FeedbackType } from '$lib/types';

  const createFeedback = useCreateFeedback();

  let formData = $state({
    type: 'suggestion' as FeedbackType,
    title: '',
    content: '',
  });

  let isSubmitting = $state(false);

  const feedbackTypes: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
    { value: 'bug', label: 'Báo lỗi', icon: Bug },
    { value: 'suggestion', label: 'Góp ý', icon: Lightbulb },
    { value: 'other', label: 'Khác', icon: HelpCircle },
  ];

  function resetForm() {
    formData = {
      type: 'suggestion',
      title: '',
      content: '',
    };
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    isSubmitting = true;

    try {
      await createFeedback.mutateAsync(formData);
      toaster.success({ title: 'Gửi feedback thành công!' });
      resetForm();
      feedbackModal.close();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Có lỗi xảy ra';
      toaster.error({ title: message });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<Modal bind:open={feedbackModal.isOpen} title="Gửi Feedback" size="md">
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-surface-300 mb-2">Loại feedback</label>
      <div class="grid grid-cols-3 gap-2">
        {#each feedbackTypes as { value, label, icon: Icon }}
          <button
            type="button"
            onclick={() => (formData.type = value)}
            class="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
              {formData.type === value
              ? 'border-primary-500 bg-primary-500/10 text-primary-400'
              : 'border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-600'}"
          >
            <Icon size={20} />
            <span class="text-xs font-medium">{label}</span>
          </button>
        {/each}
      </div>
    </div>

    <div>
      <label for="feedback-title" class="block text-sm font-medium text-surface-300 mb-1.5">
        Tiêu đề
      </label>
      <input
        id="feedback-title"
        type="text"
        bind:value={formData.title}
        placeholder="Nhập tiêu đề..."
        maxlength={200}
        required
        class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
      />
    </div>

    <div>
      <label for="feedback-content" class="block text-sm font-medium text-surface-300 mb-1.5">
        Nội dung
      </label>
      <textarea
        id="feedback-content"
        bind:value={formData.content}
        placeholder="Mô tả chi tiết..."
        rows={5}
        maxlength={5000}
        required
        class="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition resize-none"
      ></textarea>
      <div class="text-xs text-surface-500 text-right mt-1">
        {formData.content.length}/5000
      </div>
    </div>

    <div class="flex gap-2 justify-end pt-2">
      <button
        type="button"
        onclick={() => feedbackModal.close()}
        class="px-4 py-2 text-sm font-medium text-surface-300 hover:text-surface-100 transition"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <Loader2 size={16} class="animate-spin" />
          Đang gửi...
        {:else}
          <Send size={16} />
          Gửi feedback
        {/if}
      </button>
    </div>
  </form>
</Modal>
