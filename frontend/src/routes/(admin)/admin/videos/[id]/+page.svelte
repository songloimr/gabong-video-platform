<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { api } from "$lib/api/client";
  import { toaster } from "$lib/toaster";
  import IMask from "imask";
  import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    Clock,
    Captions,
    Bookmark,
    Languages,
    CirclePlay,
    TriangleAlert,
    X,
  } from "@lucide/svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
    import type { ApiResponse, VideoMarkup, VideoSubtitle } from "$lib/types";
  let videoId = $state("");
  
  $effect(() => {
    videoId = page.params.id || "";
  });

  const queryClient = useQueryClient();

  const subtitlesQuery = createQuery(() => ({
    queryKey: ['subtitles', videoId],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<VideoSubtitle[]>>(`/api/subtitles?videoId=${videoId}`);
      return response.data || [];
    },
    enabled: !!videoId,
  }));

  const markupsQuery = createQuery(() => ({
    queryKey: ['video-markups', videoId],
    queryFn: async () => {
      const { data: response } = await api.get<ApiResponse<VideoMarkup[]>>(`/api/video-markups?videoId=${videoId}`);
      return response.data || [];
    },
    enabled: !!videoId,
  }));

  const createSubtitleMutation = createMutation(() => ({
    mutationFn: async (data: { video_id: string; label: string; language_code: string; vtt_content: string }) => {
      const { data: response } = await api.post('/api/subtitles', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', videoId] });
    },
  }));

  const updateSubtitleMutation = createMutation(() => ({
    mutationFn: async ({ id, ...data }: { id: string; label?: string; language_code?: string; vtt_content?: string }) => {
      const { data: response } = await api.put(`/api/subtitles/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', videoId] });
    },
  }));

  const deleteSubtitleMutation = createMutation(() => ({
    mutationFn: async (id: string) => {
      const { data: response } = await api.delete(`/api/subtitles/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', videoId] });
    },
  }));

  const createMarkupMutation = createMutation(() => ({
    mutationFn: async (data: { video_id: string; text: string; time: number; width?: string }) => {
      const { data: response } = await api.post('/api/video-markups', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', videoId] });
    },
  }));

  const updateMarkupMutation = createMutation(() => ({
    mutationFn: async ({ id, ...data }: { id: string; text?: string; time?: number; width?: string }) => {
      const { data: response } = await api.put(`/api/video-markups/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', videoId] });
    },
  }));

  const deleteMarkupMutation = createMutation(() => ({
    mutationFn: async (id: string) => {
      const { data: response } = await api.delete(`/api/video-markups/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', videoId] });
    },
  }));

  // IMask action for VTT time format (00:00:00.000)
  function timeMask(node: HTMLInputElement, options: { value: string; onUpdate: (val: string) => void }) {
    const mask = IMask(node, {
      mask: '00:00:00.000',
      lazy: false,
      placeholderChar: '0',
    });

    mask.value = options.value || '00:00:00.000';

    mask.on('complete', () => {
      options.onUpdate(mask.value);
    });

    mask.on('accept', () => {
      options.onUpdate(mask.value);
    });

    return {
      update(newOptions: { value: string; onUpdate: (val: string) => void }) {
        if (mask.value !== newOptions.value) {
          mask.value = newOptions.value || '00:00:00.000';
        }
      },
      destroy() {
        mask.destroy();
      },
    };
  }

  // IMask action for width format (e.g., 5s, 10s, 120s)
  function widthMask(node: HTMLInputElement, options: { value: string; onUpdate: (val: string) => void }) {
    const mask = IMask(node, {
      mask: 'num`s',
      blocks: {
        num: {
          mask: Number,
          min: 1,
          max: 999,
          scale: 0,
        },
      },
      lazy: false,
    });

    const numericValue = options.value?.replace('s', '') || '5';
    mask.value = numericValue + 's';

    mask.on('accept', () => {
      options.onUpdate(mask.value);
    });

    return {
      update(newOptions: { value: string; onUpdate: (val: string) => void }) {
        const newNumericValue = newOptions.value?.replace('s', '') || '5';
        if (!mask.value.startsWith(newNumericValue)) {
          mask.value = newNumericValue + 's';
        }
      },
      destroy() {
        mask.destroy();
      },
    };
  }

  // Subtitle modal state
  let showSubtitleModal = $state(false);
  let editingSubtitle = $state<any>(null);
  let subtitleLabel = $state("");
  let subtitleLanguageCode = $state("vi");
  
  interface SubtitleCue {
    id: string;
    startTime: string;
    endTime: string;
    text: string;
  }
  
  let subtitleCues = $state<SubtitleCue[]>([]);
  
  function generateCueId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
  
  function parseVttToRows(vttContent: string): SubtitleCue[] {
    if (!vttContent || !vttContent.trim()) return [];
    
    const lines = vttContent.split('\n');
    const cues: SubtitleCue[] = [];
    let i = 0;
    
    // Skip WEBVTT header
    while (i < lines.length && !lines[i].includes('-->')) {
      i++;
    }
    
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.includes('-->')) {
        const [startTime, endTime] = line.split('-->').map(t => t.trim());
        const textLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
          textLines.push(lines[i].trim());
          i++;
        }
        cues.push({
          id: generateCueId(),
          startTime: startTime || '00:00:00.000',
          endTime: endTime || '00:00:05.000',
          text: textLines.join('\n'),
        });
      } else {
        i++;
      }
    }
    
    return cues;
  }
  
  function rowsToVtt(cues: SubtitleCue[]): string {
    if (cues.length === 0) return '';
    
    // Sort by start time
    const sorted = [...cues].sort((a, b) => {
      return timeToSeconds(a.startTime) - timeToSeconds(b.startTime);
    });
    
    let vtt = 'WEBVTT\n\n';
    sorted.forEach((cue) => {
      vtt += `${cue.startTime} --> ${cue.endTime}\n`;
      vtt += `${cue.text}\n\n`;
    });
    
    return vtt.trim();
  }
  
  function timeToSeconds(time: string): number {
    const parts = time.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
    } else if (parts.length === 2) {
      const [m, s] = parts;
      return parseInt(m) * 60 + parseFloat(s);
    }
    return parseFloat(time) || 0;
  }
  
  function addCue() {
    const lastCue = subtitleCues[subtitleCues.length - 1];
    const newStartTime = lastCue ? lastCue.endTime : '00:00:00.000';
    const newEndSeconds = timeToSeconds(newStartTime) + 5;
    const newEndTime = secondsToVttTime(newEndSeconds);
    
    subtitleCues = [...subtitleCues, {
      id: generateCueId(),
      startTime: newStartTime,
      endTime: newEndTime,
      text: '',
    }];
  }
  
  function removeCue(id: string) {
    subtitleCues = subtitleCues.filter(c => c.id !== id);
  }

  function updateCueStartTime(id: string, value: string) {
    subtitleCues = subtitleCues.map(c => c.id === id ? { ...c, startTime: value } : c);
  }

  function updateCueEndTime(id: string, value: string) {
    subtitleCues = subtitleCues.map(c => c.id === id ? { ...c, endTime: value } : c);
  }

  function updateCueText(id: string, value: string) {
    subtitleCues = subtitleCues.map(c => c.id === id ? { ...c, text: value } : c);
  }
  
  function secondsToVttTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = (seconds % 60).toFixed(3);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.padStart(6, '0')}`;
  }

  // Markup modal state
  let showMarkupModal = $state(false);
  let editingMarkup = $state<any>(null);
  let markupForm = $state({
    text: "",
    time: 0,
    width: "5s",
  });

  // Delete confirmation
  let showDeleteModal = $state(false);
  let deleteTarget = $state<{ type: "subtitle" | "markup"; id: string } | null>(null);

  function openSubtitleModal(subtitle?: any) {
    if (subtitle) {
      editingSubtitle = subtitle;
      subtitleLabel = subtitle.label;
      subtitleLanguageCode = subtitle.language_code;
      subtitleCues = parseVttToRows(subtitle.vtt_content);
    } else {
      editingSubtitle = null;
      subtitleLabel = "";
      subtitleLanguageCode = "vi";
      subtitleCues = [];
    }
    showSubtitleModal = true;
  }

  function openMarkupModal(markup?: any) {
    if (markup) {
      editingMarkup = markup;
      markupForm = {
        text: markup.text,
        time: markup.time,
        width: markup.width || "5s",
      };
    } else {
      editingMarkup = null;
      markupForm = { text: "", time: 0, width: "5s" };
    }
    showMarkupModal = true;
  }

  function openDeleteModal(type: "subtitle" | "markup", id: string) {
    deleteTarget = { type, id };
    showDeleteModal = true;
  }

  async function saveSubtitle() {
    const vttContent = rowsToVtt(subtitleCues);
    
    try {
      if (editingSubtitle) {
        await updateSubtitleMutation.mutateAsync({
          id: editingSubtitle.id,
          label: subtitleLabel,
          language_code: subtitleLanguageCode,
          vtt_content: vttContent,
        });
        toaster.create({ title: "Success", description: "Subtitle updated", type: "success" });
      } else {
        await createSubtitleMutation.mutateAsync({
          video_id: videoId,
          label: subtitleLabel,
          language_code: subtitleLanguageCode,
          vtt_content: vttContent,
        });
        toaster.create({ title: "Success", description: "Subtitle created", type: "success" });
      }
      showSubtitleModal = false;
    } catch (error: any) {
      toaster.create({ title: "Error", description: error.response?.data?.message || "Failed to save subtitle", type: "error" });
    }
  }

  async function saveMarkup() {
    try {
      if (editingMarkup) {
        await updateMarkupMutation.mutateAsync({
          id: editingMarkup.id,
          ...markupForm,
        });
        toaster.create({ title: "Success", description: "Markup updated", type: "success" });
      } else {
        await createMarkupMutation.mutateAsync({
          video_id: videoId,
          ...markupForm,
        });
        toaster.create({ title: "Success", description: "Markup created", type: "success" });
      }
      showMarkupModal = false;
    } catch (error: any) {
      toaster.create({ title: "Error", description: error.response?.data?.message || "Failed to save markup", type: "error" });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "subtitle") {
        await deleteSubtitleMutation.mutateAsync(deleteTarget.id);
        toaster.create({ title: "Success", description: "Subtitle deleted", type: "success" });
      } else {
        await deleteMarkupMutation.mutateAsync(deleteTarget.id);
        toaster.create({ title: "Success", description: "Markup deleted", type: "success" });
      }
      showDeleteModal = false;
      deleteTarget = null;
    } catch (error: any) {
      toaster.create({ title: "Error", description: error.response?.data?.message || "Failed to delete", type: "error" });
    }
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Language code to flag emoji mapping
  const languageFlags: Record<string, string> = {
    vi: "VN",
    en: "EN",
    ja: "JP",
    ko: "KR",
    zh: "CN",
    fr: "FR",
    de: "DE",
    es: "ES",
    th: "TH",
  };

  function getLanguageFlag(code?: string): string {
    return languageFlags[code?.toLowerCase() || "vi"] || code?.toUpperCase() || "vi";
  }
</script>

<svelte:head>
  <title>Subtitles & Markups - Admin Panel</title>
</svelte:head>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <button 
      onclick={() => goto("/admin/videos")} 
      class="p-1.5 rounded-sm bg-surface-600 text-surface-300 hover:bg-surface-500 transition-colors"
    >
      <ArrowLeft class="h-4 w-4" />
    </button>
    <h1 class="text-xl font-bold text-surface-100">Subtitles & Markups</h1>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Subtitles Section -->
    <div class="bg-surface-800/50 backdrop-blur rounded-sm border border-surface-700">
      <div class="flex items-center justify-between px-3 py-2 border-b border-surface-700">
        <div class="flex items-center gap-2">
          <Captions class="h-4 w-4 text-primary-400" />
          <h2 class="text-sm font-black uppercase tracking-wider text-surface-100">Subtitles</h2>
        </div>
        <button
          onclick={() => openSubtitleModal()}
          class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-sm text-xs font-bold transition-colors"
        >
          <Plus class="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <div class="p-3 space-y-2 min-h-50">
        {#if subtitlesQuery.isLoading}
          {#each Array(2) as _}
            <div class="h-12 bg-surface-700 animate-pulse rounded-sm"></div>
          {/each}
        {:else if subtitlesQuery.data?.length === 0}
          <div class="flex flex-col items-center justify-center py-8 text-surface-400">
            <Languages class="h-8 w-8 text-surface-500 mb-2" />
            <p class="text-xs font-bold">No subtitles yet</p>
          </div>
        {:else}
          {#each subtitlesQuery.data || [] as subtitle}
            <div class="flex items-center justify-between p-2.5 bg-surface-900/50 hover:bg-surface-700/50 rounded-sm border border-surface-700/50 transition-colors">
              <div class="flex items-center gap-2.5">
                <span class="px-1.5 py-0.5 text-[10px] font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-sm">
                  {getLanguageFlag(subtitle.language_code)}
                </span>
                <span class="font-bold text-surface-100 text-sm">{subtitle.label}</span>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  onclick={() => openSubtitleModal(subtitle)} 
                  class="p-1.5 rounded-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Edit"
                >
                  <Pencil class="h-3.5 w-3.5" />
                </button>
                <button 
                  onclick={() => openDeleteModal("subtitle", subtitle.id)} 
                  class="p-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Markups Section -->
    <div class="bg-surface-800/50 backdrop-blur rounded-sm border border-surface-700">
      <div class="flex items-center justify-between px-3 py-2 border-b border-surface-700">
        <div class="flex items-center gap-2">
          <Bookmark class="h-4 w-4 text-amber-400" />
          <h2 class="text-sm font-black uppercase tracking-wider text-surface-100">Markups</h2>
        </div>
        <button
          onclick={() => openMarkupModal()}
          class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-sm text-xs font-bold transition-colors"
        >
          <Plus class="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <div class="p-3 space-y-2 min-h-50">
        {#if markupsQuery.isLoading}
          {#each Array(2) as _}
            <div class="h-12 bg-surface-700 animate-pulse rounded-sm"></div>
          {/each}
        {:else if markupsQuery.data?.length === 0}
          <div class="flex flex-col items-center justify-center py-8 text-surface-400">
            <CirclePlay class="h-8 w-8 text-surface-500 mb-2" />
            <p class="text-xs font-bold">No markups yet</p>
          </div>
        {:else}
          {#each markupsQuery.data || [] as markup}
            <div class="flex items-center justify-between p-2.5 bg-surface-900/50 hover:bg-surface-700/50 rounded-sm border border-surface-700/50 transition-colors">
              <div class="flex items-center gap-2.5">
                <span class="px-2 py-1 text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-sm">
                  {formatTime(markup.time)}
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-bold bg-surface-700 text-surface-300 rounded-sm">
                  {markup.width}
                </span>
                <span class="font-bold text-surface-100 text-sm">{markup.text}</span>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  onclick={() => openMarkupModal(markup)} 
                  class="p-1.5 rounded-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Edit"
                >
                  <Pencil class="h-3.5 w-3.5" />
                </button>
                <button 
                  onclick={() => openDeleteModal("markup", markup.id)} 
                  class="p-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Subtitle Modal -->
<Modal bind:open={showSubtitleModal} title={editingSubtitle ? "Edit Subtitle" : "Add Subtitle"} size="lg">
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="subtitle-label" class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5">
          Label
        </label>
        <input 
          id="subtitle-label"
          type="text" 
          bind:value={subtitleLabel} 
          placeholder="e.g., Vietnamese" 
          class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors font-bold"
        />
      </div>
      <div>
        <label for="subtitle-lang" class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5">
          Language Code
        </label>
        <input 
          id="subtitle-lang"
          type="text" 
          bind:value={subtitleLanguageCode} 
          placeholder="e.g., vi, en, ja" 
          class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="block text-[10px] font-black uppercase tracking-widest text-surface-400">
          Subtitle Cues ({subtitleCues.length})
        </label>
        <button 
          onclick={addCue} 
          class="flex items-center gap-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 rounded-sm text-[10px] font-bold transition-colors"
        >
          <Plus class="h-3 w-3" />
          Add Cue
        </button>
      </div>
      
      <div class="max-h-87.5 overflow-y-auto space-y-2 pr-1">
        {#if subtitleCues.length === 0}
          <div class="flex flex-col items-center justify-center py-8 border border-dashed border-surface-600 rounded-sm bg-surface-900/30">
            <Captions class="h-6 w-6 text-surface-500 mb-2" />
            <p class="text-xs text-surface-400">No cues yet. Click "Add Cue" to start.</p>
          </div>
        {:else}
          {#each subtitleCues as cue, i (cue.id)}
            <div class=" flex items-center justify-center gap-2 p-2 bg-surface-900/50 rounded-sm border border-surface-700/50">
              <span class="flex items-center justify-center w-6 h-6 bg-surface-700 text-surface-400 rounded-sm text-[10px] font-bold mt-4">
                {i + 1}
              </span>
              <div class="flex-1 grid grid-cols-[120px_120px_1fr] gap-2">
                <div>
                  <label class="block text-[10px] text-surface-500 uppercase tracking-wide mb-1">Start</label>
                  <input 
                    type="text" 
                    value={cue.startTime}
                    use:timeMask={{ value: cue.startTime, onUpdate: (val) => updateCueStartTime(cue.id, val) }}
                    placeholder="00:00:00.000"
                    class="w-full px-2 py-1.5 bg-surface-800 border border-surface-600 rounded-sm text-xs font-mono focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-surface-500 uppercase tracking-wide mb-1">End</label>
                  <input 
                    type="text" 
                    value={cue.endTime}
                    use:timeMask={{ value: cue.endTime, onUpdate: (val) => updateCueEndTime(cue.id, val) }}
                    placeholder="00:00:05.000"
                    class="w-full px-2 py-1.5 bg-surface-800 border border-surface-600 rounded-sm text-xs font-mono focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-[10px] text-surface-500 uppercase tracking-wide mb-1">Text</label>
                  <input 
                    type="text" 
                    value={cue.text}
                    oninput={(e) => updateCueText(cue.id, (e.target as HTMLInputElement).value)}
                    placeholder="Subtitle text..."
                    class="w-full  overflow-x-auto px-2 py-1.5 bg-surface-800 border border-surface-600 rounded-sm text-xs focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              <button 
                onclick={() => removeCue(cue.id)} 
                class="p-1.5 hover:bg-red-500/20 text-red-400 rounded-sm transition-colors mt-4"
                title="Remove cue"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="flex gap-2 justify-end pt-4 border-t border-surface-700/50">
      <button 
        onclick={() => (showSubtitleModal = false)} 
        class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
      >
        Cancel
      </button>
      <button 
        onclick={saveSubtitle} 
        class="px-6 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-bold shadow-lg shadow-primary-900/20"
        disabled={!subtitleLabel || createSubtitleMutation.isPending || updateSubtitleMutation.isPending}
      >
        {#if createSubtitleMutation.isPending || updateSubtitleMutation.isPending}
          Saving...
        {:else}
          Save Subtitle
        {/if}
      </button>
    </div>
  </div>
</Modal>

<!-- Markup Modal -->
<Modal bind:open={showMarkupModal} title={editingMarkup ? "Edit Markup" : "Add Markup"} size="md">
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="markup-time" class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5">
          Time (seconds)
        </label>
        <input 
          id="markup-time"
          type="number" 
          bind:value={markupForm.time} 
          min={0} 
          class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
        />
        <div class="flex items-center gap-1.5 text-[10px] text-surface-400 mt-1.5">
          <Clock class="h-3 w-3" />
          <span>Preview: {formatTime(markupForm.time)}</span>
        </div>
      </div>
      <div>
        <label for="markup-width" class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5">
          Width
        </label>
        <input 
          id="markup-width"
          type="text"
          use:widthMask={{ value: markupForm.width, onUpdate: (val) => markupForm.width = val }}
          class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
        />
      </div>
    </div>

    <div>
      <label for="markup-text" class="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1.5">
        Text
      </label>
      <input 
        id="markup-text"
        type="text" 
        bind:value={markupForm.text} 
        placeholder="Markup text..." 
        class="w-full px-3 py-2 rounded-sm border border-surface-600 bg-surface-900/50 text-surface-100 text-sm focus:outline-none focus:border-amber-500 transition-colors font-bold"
      />
    </div>

    <div class="flex gap-2 justify-end pt-4 border-t border-surface-700/50">
      <button 
        onclick={() => (showMarkupModal = false)} 
        class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
      >
        Cancel
      </button>
      <button 
        onclick={saveMarkup} 
        class="px-6 py-2 rounded-sm bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm font-bold shadow-lg shadow-amber-900/20"
        disabled={!markupForm.text || createMarkupMutation.isPending || updateMarkupMutation.isPending}
      >
        {#if createMarkupMutation.isPending || updateMarkupMutation.isPending}
          Saving...
        {:else}
          Save Markup
        {/if}
      </button>
    </div>
  </div>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:open={showDeleteModal} title="Confirm Delete" size="sm">
  <div class="space-y-4">
    <div class="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
      <TriangleAlert class="h-5 w-5 text-red-400 flex-shrink-0" />
      <p class="text-sm text-surface-300">
        Are you sure you want to delete this <span class="font-bold text-surface-100">{deleteTarget?.type}</span>? This action cannot be undone.
      </p>
    </div>

    <div class="flex gap-2 justify-end pt-4 border-t border-surface-700/50">
      <button 
        onclick={() => (showDeleteModal = false)} 
        class="px-4 py-2 rounded-sm border border-surface-600 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
      >
        Cancel
      </button>
      <button 
        onclick={confirmDelete} 
        class="px-6 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-bold"
        disabled={deleteSubtitleMutation.isPending || deleteMarkupMutation.isPending}
      >
        {#if deleteSubtitleMutation.isPending || deleteMarkupMutation.isPending}
          Deleting...
        {:else}
          Delete
        {/if}
      </button>
    </div>
  </div>
</Modal>
