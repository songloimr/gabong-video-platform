<script lang="ts">
  import { t } from "svelte-i18n";
  import AuthGuard from "$lib/components/auth/AuthGuard.svelte";
  import TipTapEditor from "$lib/components/forms/TipTapEditor.svelte";
  import { useUploadVideo } from "$lib/api/mutations/videos";
  import {
    TITLE_MIN_LENGTH,
    TITLE_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
    validateTitle,
    validateDescription,
    getPlainTextLength,
  } from "$lib/utils/validation";
  import {
    Upload,
    Video,
    Image,
    Link,
    AlertCircle,
    ArrowRight,
    LoaderCircle,
    CircleCheckBig,
    FileVideo,
    X,
  } from "@lucide/svelte";
  import { Switch, Progress } from "@skeletonlabs/skeleton-svelte";
  import type { PageProps } from "./$types";
  import { auth } from "$lib/stores/auth.svelte";
  import { errorDialog } from "$lib/stores/errorDialog.svelte";

  let { data }: PageProps = $props();

  // Check if user is admin
  const isAdmin = $derived(auth.user?.role === 'admin');


  // Form state
  let title = $state("");
  let description = $state("");
  let embedUrl = $state("");
  let thumbnailUrl = $state("");
  let categoryId = $state("");
  let videoFile = $state<File | null>(null);
  let thumbnailFile = $state<File | null>(null);

  // UI state
  let activeTab = $state<"embed" | "upload">("upload");
  let useCustomThumbnail = $state(false);
  let thumbnailType = $state<"url" | "file">("url");
  let isSubmitting = $state(false);
  let uploadProgress = $state(0);
  let error = $state("");
  let success = $state(false);
  let dragOver = $state(false);
  let thumbnailUrlError = $state<string | null>(null);
  let thumbnailUrlValid = $state(false);

  // Derived validation states
  const titleError = $derived(title ? validateTitle(title.trim()) : null);
  const descriptionLength = $derived(getPlainTextLength(description));
  const descriptionError = $derived(
    descriptionLength > DESCRIPTION_MAX_LENGTH
      ? `Mô tả vượt quá ${descriptionLength - DESCRIPTION_MAX_LENGTH} ký tự`
      : null,
  );

  const uploadMutation = useUploadVideo();

  const MAX_FILE_SIZE = data.siteSettings?.max_upload_size_mb!  * 1024 * 1024; // 500MB
  const ALLOWED_TYPES = data.siteSettings?.allowed_video_formats!

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];


      if (file.size > MAX_FILE_SIZE) {
        error = `File quá lớn. Dung lượng tối đa là ${data.siteSettings?.max_upload_size_mb}MB.`;
        target.value = "";
        return;
      }

      if (
        !ALLOWED_TYPES.includes(file.type) &&
        !file.name.match(new RegExp(`\\.(${ALLOWED_TYPES.join("|")})$`, "i"))
      ) {
        error =
          "Định dạng file không được hỗ trợ. Vui lòng chọn file MP4, MKV, MOV hoặc WebM.";
        target.value = "";
        return;
      }

      error = "";
      videoFile = file;
      if (!title) {
        // Auto-fill title with filename (without extension)
        title = videoFile.name.replace(/\.[^/.]+$/, "");
      }
    }
  }

  function handleThumbSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      thumbnailFile = target.files[0];
    }
  }

  // Validate thumbnail URL by trying to load it
  function validateThumbnailUrl() {
    if (!thumbnailUrl.trim()) {
      thumbnailUrlError = null;
      thumbnailUrlValid = false;
      return;
    }

    thumbnailUrlError = null;
    thumbnailUrlValid = false;

    const img = new window.Image();
    img.onload = () => {
      thumbnailUrlValid = true;
      thumbnailUrlError = null;
    };
    img.onerror = () => {
      thumbnailUrlValid = false;
      thumbnailUrlError =
        "Không thể tải ảnh. Vui lòng kiểm tra lại URL hoặc ảnh bị chặn CORS.";
    };
    img.src = thumbnailUrl.trim();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    error = "";

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (file.size > MAX_FILE_SIZE) {
        error = "File quá lớn. Dung lượng tối đa là 500MB.";
        return;
      }

      if (
        !ALLOWED_TYPES.includes(file.type) &&
        !file.name.match(/\.(mp4|mkv|mov|webm)$/i)
      ) {
        error =
          "Định dạng file không được hỗ trợ. Vui lòng chọn file MP4, MKV, MOV hoặc WebM.";
        return;
      }

      videoFile = file;
      if (!title) {
        title = videoFile.name.replace(/\.[^/.]+$/, "");
      }
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = "";
    uploadProgress = 0;

    // Validate title
    const titleValidationError = validateTitle(title.trim());
    if (titleValidationError) {
      error = titleValidationError;
      return;
    }

    // Validate description
    const descValidationError = validateDescription(description);
    if (descValidationError) {
      error = descValidationError;
      return;
    }

    if (activeTab === "embed" && !embedUrl.trim()) {
      error = "Vui lòng nhập URL embed";
      return;
    }

    if (activeTab === "upload" && !videoFile) {
      error = "Vui lòng chọn file video để upload";
      return;
    }

    isSubmitting = true;

    try {
      let payload: any;

      if (activeTab === "upload" || thumbnailFile) {
        payload = new FormData();
        if (videoFile) payload.append("file", videoFile);
        if (thumbnailFile) payload.append("thumbnail", thumbnailFile);

        payload.append("title", title.trim());
        if (description) payload.append("description", description);
        if (useCustomThumbnail && thumbnailType === "url" && thumbnailUrl) {
          payload.append("thumbnail_url", thumbnailUrl.trim());
        }
        if (categoryId) payload.append("category_id", categoryId);
        payload.append("source_type", activeTab);

        if (activeTab === "embed" && embedUrl) {
          payload.append("embed_url", embedUrl.trim());
        }
      } else {
        payload = {
          title: title.trim(),
          description: description || undefined,
          embed_url: embedUrl.trim() || undefined,
          thumbnail_url:
            useCustomThumbnail && thumbnailUrl.trim()
              ? thumbnailUrl.trim()
              : undefined,
          category_id: categoryId || undefined,
          source_type: "embed",
        };
      }

      const result = await uploadMutation.mutateAsync({
        input: payload,
        onProgress: (p) => {
          uploadProgress = p;
        },
      });

      success = true;

    } catch (err: any) {
      const message = err.response?.data?.message || "Có lỗi xảy ra khi upload video";
      errorDialog.show("Upload Failed", message);
    } finally {
      isSubmitting = false;
    }
  }

  function handleDescriptionUpdate(html: string) {
    description = html;
  }
</script>

<svelte:head>
  <title>{$t("video.uploadTitle")} - Gabong</title>
</svelte:head>

<AuthGuard>
  <div class="min-h-[calc(100vh-64px)] bg-surface-950 py-8 sm:py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="mb-8 sm:mb-10">
        <div
          class="flex items-center gap-2 text-primary-400 font-black text-[10px] uppercase tracking-widest mb-2"
        >
          <Upload size={12} strokeWidth={3} />
          <span>Creator Studio</span>
        </div>
        <h1
          class="text-3xl sm:text-4xl font-black tracking-tighter text-surface-100 uppercase"
        >
          Upload <span class="text-primary-500">Video</span>
        </h1>
        <p class="text-surface-400 mt-2 font-medium">
          Chia sẻ video của bạn với cộng đồng Gabong
        </p>
      </div>

      {#if success}
        <!-- Success State -->
        <div
          class="bg-green-950/30 border border-green-500/30 rounded-2xl p-8 text-center animate-fade-in"
        >
          <div
            class="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
          >
            <CircleCheckBig size={32} class="text-green-500" />
          </div>
          <h2 class="text-xl font-black text-surface-100 mb-2">
            Video đã được gửi!
          </h2>
          <p class="text-surface-400 font-medium">
            Video của bạn đang chờ duyệt. Bạn sẽ được chuyển hướng đến trang
            video...
          </p>
        </div>
      {:else}
        <!-- Upload Form -->
        <form onsubmit={handleSubmit} class="space-y-6">
          <!-- Source Type Tabs -->
          <div class="flex gap-2 p-1 bg-surface-900 rounded-xl">
            {#if isAdmin}
              <button
                type="button"
                onclick={() => (activeTab = "embed")}
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all {activeTab ===
                'embed'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-surface-400 hover:text-surface-200'}"
              >
                <Link size={16} />
                Embed URL
              </button>
            {/if}
            <button
              type="button"
              onclick={() => (activeTab = "upload")}
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all {activeTab ===
              'upload'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-surface-400 hover:text-surface-200'}"
            >
              <Video size={16} />
              Upload File
            </button>
          </div>

          <!-- Error Message -->
          {#if error}
            <div
              class="flex items-center gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm animate-fade-in"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          {/if}

          <!-- File Upload Zone -->
          {#if activeTab === "upload"}
            <div class="space-y-2">
              <label
                for="videoFile"
                class="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1"
              >
                File Video *
              </label>

              {#if !videoFile}
                <div
                  role="button"
                  tabindex="0"
                  class="relative group cursor-pointer"
                  ondrop={handleDrop}
                  ondragover={(e) => {
                    e.preventDefault();
                    dragOver = true;
                  }}
                  ondragleave={() => (dragOver = false)}
                  onclick={() => document.getElementById("file-input")?.click()}
                  onkeydown={(e) =>
                    e.key === "Enter" &&
                    document.getElementById("file-input")?.click()}
                >
                  <div
                    class="flex flex-col items-center justify-center gap-4 p-12 bg-surface-900 border-2 border-dashed {dragOver
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-surface-800'} rounded-2xl transition-all group-hover:border-primary-500/50 group-hover:bg-primary-500/5"
                  >
                    <div
                      class="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center text-surface-400 group-hover:text-primary-400 transition-colors"
                    >
                      <Upload size={32} strokeWidth={2.5} />
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-bold text-surface-100">
                        Kéo thả video vào đây
                      </p>
                      <p class="text-sm text-surface-500 mt-1">
                        Hoặc nhấp để chọn file từ máy tính
                      </p>
                    </div>
                    <div
                      class="flex gap-4 text-[10px] font-black uppercase tracking-widest text-surface-600"
                    >
                      <span>MP4, MKV, MOV</span>
                      <span>•</span>
                      <span>Tối đa 500MB</span>
                    </div>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="video/*"
                    class="hidden"
                    onchange={handleFileSelect}
                  />
                </div>
              {:else}
                <div class="space-y-4 animate-scale-in">
                  <div
                    class="flex items-center gap-4 p-4 bg-surface-900 border border-surface-800 rounded-xl"
                  >
                    <div
                      class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-500"
                    >
                      <FileVideo size={24} />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-surface-100 truncate">
                        {videoFile.name}
                      </p>
                      <p class="text-xs text-surface-500 mt-0.5">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onclick={() => (videoFile = null)}
                      class="p-2 text-surface-500 hover:text-red-400 transition-colors"
                      disabled={isSubmitting}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {#if isSubmitting && uploadProgress > 0}
                    <div class="space-y-2">
                      <div
                        class="flex justify-between text-xs font-bold uppercase tracking-wider"
                      >
                        <span class="text-primary-400">Đang tải lên...</span>
                        <span class="text-surface-400">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} max={100}>
                        <Progress.Track
                          class="h-2 bg-surface-900 rounded-full overflow-hidden border border-surface-800"
                        >
                          <Progress.Range class="h-full bg-primary-500" />
                        </Progress.Track>
                      </Progress>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Embed URL Input -->
          {#if activeTab === "embed"}
            <div class="space-y-2">
              <label
                for="embedUrl"
                class="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1"
              >
                URL Embed *
              </label>
              <div class="relative">
                <Link
                  size={18}
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"
                />
                <input
                  id="embedUrl"
                  type="url"
                  bind:value={embedUrl}
                  placeholder="https://example.com/embed/video"
                  class="w-full pl-12 pr-4 py-4 bg-surface-900 border border-surface-800 rounded-xl text-surface-100 font-medium placeholder:text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
              <p class="text-xs text-surface-500 ml-1">
                Hỗ trợ các nền tảng: YouTube, Vimeo, và các URL embed khác
              </p>
            </div>
          {/if}

          <!-- Title -->
          <div class="space-y-2">
            <div class="flex items-center justify-between ml-1 mr-1">
              <label
                for="title"
                class="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-400"
              >
                Tiêu đề video *
              </label>
              <span
                class="text-[10px] font-bold {title.length > TITLE_MAX_LENGTH
                  ? 'text-red-400'
                  : 'text-surface-500'}"
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="title"
              type="text"
              bind:value={title}
              placeholder="Nhập tiêu đề video (tối thiểu 2 ký tự)"
              maxlength={TITLE_MAX_LENGTH + 10}
              class="w-full px-4 py-4 bg-surface-900 border rounded-xl text-surface-100 font-medium placeholder:text-surface-600 focus:outline-none focus:ring-2 transition-all {titleError
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-surface-800 focus:ring-primary-500/50 focus:border-primary-500/50'}"
            />
            {#if titleError && title.length > 0}
              <p class="text-xs text-red-400 ml-1 animate-fade-in">
                {titleError}
              </p>
            {/if}
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between ml-1 mr-1">
              <label
                for="description"
                class="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-400"
              >
                Mô tả video
              </label>
              <span
                class="text-[10px] font-bold {descriptionLength >
                DESCRIPTION_MAX_LENGTH
                  ? 'text-red-400'
                  : 'text-surface-500'}"
              >
                {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <div id="description">
              <TipTapEditor
                bind:value={description}
                onUpdate={handleDescriptionUpdate}
                placeholder="Mô tả video của bạn..."
              />
            </div>
            {#if descriptionError}
              <p class="text-xs text-red-400 ml-1 animate-fade-in">
                {descriptionError}
              </p>
            {/if}
          </div>

          <!-- Thumbnail Toggle -->
          <div class="space-y-4">
            <!-- Toggle Switch -->
            <div
              class="flex items-center justify-between p-4 bg-surface-900 border border-surface-800 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <Image size={20} class="text-surface-400" />
                <div>
                  <p class="text-sm font-bold text-surface-100">
                    Tùy chỉnh Thumbnail
                  </p>
                  <p class="text-xs text-surface-500">Thêm ảnh bìa cho video</p>
                </div>
              </div>
              <Switch
                checked={useCustomThumbnail}
                onCheckedChange={(details) => {
                  useCustomThumbnail = details.checked;
                  if (!useCustomThumbnail) {
                    thumbnailUrl = "";
                    thumbnailFile = null;
                    thumbnailUrlError = null;
                    thumbnailUrlValid = false;
                  }
                }}
                class="flex items-center gap-3"
              >
                <Switch.Control
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                  {useCustomThumbnail
                    ? 'bg-primary-500'
                    : 'bg-surface-700'}"
                >
                  <Switch.Thumb
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200
                    {useCustomThumbnail
                      ? 'translate-x-6'
                      : 'translate-x-1'}"
                  />
                </Switch.Control>
                <Switch.HiddenInput />
              </Switch>
            </div>

            <!-- Thumbnail Options (only show when enabled) -->
            {#if useCustomThumbnail}
              <div class="space-y-3 animate-scale-in">
                <!-- Source Type Selector -->
                <div class="flex gap-2">
                  <button
                    type="button"
                    onclick={() => {
                      thumbnailType = "url";
                      thumbnailFile = null;
                    }}
                    class="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all {thumbnailType ===
                    'url'
                      ? 'bg-primary-500 text-surface-900'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'}"
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onclick={() => {
                      thumbnailType = "file";
                      thumbnailUrl = "";
                      thumbnailUrlError = null;
                      thumbnailUrlValid = false;
                    }}
                    class="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all {thumbnailType ===
                    'file'
                      ? 'bg-primary-500 text-surface-900'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'}"
                  >
                    File
                  </button>
                </div>

                {#if thumbnailType === "url"}
                  <div class="space-y-3 animate-scale-in">
                    <div class="relative">
                      <Link
                        size={18}
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"
                      />
                      <input
                        id="thumbnailUrl"
                        type="url"
                        bind:value={thumbnailUrl}
                        onblur={validateThumbnailUrl}
                        oninput={() => {
                          thumbnailUrlError = null;
                          thumbnailUrlValid = false;
                        }}
                        placeholder="https://example.com/thumbnail.jpg"
                        class="w-full pl-12 pr-4 py-4 bg-surface-900 border rounded-xl text-surface-100 font-medium placeholder:text-surface-600 focus:outline-none focus:ring-2 transition-all {thumbnailUrlError
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : thumbnailUrlValid
                            ? 'border-green-500/50 focus:ring-green-500/50'
                            : 'border-surface-800 focus:ring-primary-500/50'}"
                      />
                      {#if thumbnailUrlValid}
                        <div
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                        >
                          <CircleCheckBig size={18} />
                        </div>
                      {/if}
                    </div>

                    {#if thumbnailUrlError}
                      <p
                        class="text-xs text-red-400 animate-fade-in flex items-center gap-2"
                      >
                        <AlertCircle size={14} />
                        {thumbnailUrlError}
                      </p>
                    {/if}

                    {#if thumbnailUrlValid && thumbnailUrl}
                      <div
                        class="p-3 bg-surface-800/50 rounded-xl border border-surface-700"
                      >
                        <p
                          class="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-2"
                        >
                          Preview
                        </p>
                        <img
                          src={thumbnailUrl}
                          alt="Thumbnail preview"
                          class="w-full max-h-40 object-contain rounded-lg"
                        />
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="animate-scale-in">
                    {#if !thumbnailFile}
                      <button
                        type="button"
                        onclick={() =>
                          document.getElementById("thumb-input")?.click()}
                        class="w-full py-6 border-2 border-dashed border-surface-800 rounded-xl text-surface-500 font-bold text-sm hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Image size={24} />
                        <span>Chọn file ảnh (JPG, PNG, WebP)</span>
                        <span class="text-[10px] text-surface-600"
                          >Tối đa 5MB</span
                        >
                      </button>
                      <input
                        id="thumb-input"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onchange={handleThumbSelect}
                      />
                    {:else}
                      <div
                        class="flex items-center gap-4 p-4 bg-surface-900 border border-surface-800 rounded-xl"
                      >
                        <div
                          class="w-16 h-12 bg-surface-800 rounded-lg overflow-hidden border border-surface-700 shrink-0"
                        >
                          <img
                            src={URL.createObjectURL(thumbnailFile)}
                            alt="Preview"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p
                            class="text-sm font-bold text-surface-100 truncate"
                          >
                            {thumbnailFile.name}
                          </p>
                          <p class="text-xs text-surface-500 mt-0.5">
                            {(thumbnailFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onclick={() => (thumbnailFile = null)}
                          class="p-2 text-surface-500 hover:text-red-400 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label
              for="category"
              class="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1"
            >
              Danh mục
            </label>
            <select
              id="category"
              bind:value={categoryId}
              class="w-full px-4 py-4 bg-surface-900 border border-surface-800 rounded-xl text-surface-100 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">Chọn danh mục</option>
              {#if data.categories}
                {#each data.categories as category}
                  <option value={category.id}>{category.name}</option>
                {/each}
              {/if}
            </select>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isSubmitting ||
              !title.trim() ||
              (activeTab === "upload" && !videoFile) ||
              (activeTab === "embed" && !embedUrl.trim())}
            class="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-surface-900 rounded-xl font-black uppercase tracking-[0.15em] text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-xl shadow-white/10 group"
          >
            {#if isSubmitting}
              <LoaderCircle size={18} class="animate-spin" />
              <span>
                {#if activeTab === "upload" && uploadProgress < 100}
                  Đang tải lên ({uploadProgress}%)
                {:else}
                  Đang xử lý...
                {/if}
              </span>
            {:else}
              {#if activeTab === "upload"}
                <Upload size={18} />
                <span>Upload Video</span>
              {:else}
                <Video size={18} />
                <span>Publish Video</span>
              {/if}
              <ArrowRight
                size={18}
                class="group-hover:translate-x-1 transition-transform"
              />
            {/if}
          </button>

          <!-- Note -->
          <p
            class="text-center text-[10px] text-surface-500 font-bold uppercase tracking-widest"
          >
            Bằng cách nhấn nút, bạn đồng ý với Điều khoản của Gabong
          </p>
        </form>
      {/if}
    </div>
  </div>
</AuthGuard>
