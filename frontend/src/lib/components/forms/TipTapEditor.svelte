<script lang="ts">
	import { createEditor, EditorContent } from "svelte-tiptap";
	import StarterKit from "@tiptap/starter-kit";
	import TaskList from "@tiptap/extension-task-list";
	import TaskItem from "@tiptap/extension-task-item";
	import TextAlign from "@tiptap/extension-text-align";
	import Highlight from "@tiptap/extension-highlight";
	import Placeholder from "@tiptap/extension-placeholder";
	import CustomImage from "./extensions/CustomImage";
	import { sanitizeHTML } from "$lib/utils/sanitize";
	import { validateImageFile } from "$lib/utils/file";
	import type { Editor } from "@tiptap/core";

	import {
		Bold,
		Italic,
		Strikethrough,
		List,
		ListOrdered,
		ListTodo,
		Quote,
		Code,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Highlighter,
		Image as ImageIcon,
		Upload,
		Heading1,
		Heading2,
		Heading3,
		Undo,
		Redo,
		ChevronDown,
		Type,
		Text,
	} from "@lucide/svelte";

	interface Props {
		value?: string;
		readonly?: boolean;
		onUpdate?: (html: string) => void;
		placeholder?: string;
		/** Callback for uploading images - should return the uploaded image URL */
		onImageUpload?: (file: File) => Promise<string>;
		/** Enable sanitization of HTML content (default: true) */
		sanitize?: boolean;
	}

	let {
		value = $bindable(""),
		readonly = false,
		onUpdate,
		placeholder = "Write something...",
		onImageUpload,
		sanitize = true,
	}: Props = $props();

	// Dropdown states
	let showHeadingMenu = $state(false);
	let showListMenu = $state(false);
	let showImageMenu = $state(false);
	
	// Image upload state
	let imageFileInput: HTMLInputElement;

	const editor = createEditor({
		extensions: [
			StarterKit,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight,
			CustomImage.configure({
				onUpload: onImageUpload,
				fallbackToBase64: !onImageUpload, // Use base64 if no upload handler
				maxSize: 5 * 1024 * 1024, // 5MB
				allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
			}),
			Placeholder.configure({
				placeholder,
			}),
		],
		content: value,
		editable: !readonly,
		onUpdate: ({ editor }) => {
			let html = editor.getHTML();
			
			// Sanitize HTML if enabled
			if (sanitize) {
				html = sanitizeHTML(html);
			}
			
			if (value !== html) {
				value = html;
				onUpdate?.(html);
			}
		},
	});

	$effect(() => {
		if ($editor && value !== $editor.getHTML()) {
			// Sanitize incoming value as well
			const cleanValue = sanitize ? sanitizeHTML(value) : value;
			$editor.commands.setContent(cleanValue, { emitUpdate: false });
		}
	});

	$effect(() => {
		if ($editor) {
			$editor.setEditable(!readonly);
		}
	});

	function addImageFromURL() {
		const url = window.prompt("Enter image URL");
		if (url && $editor) {
			$editor.chain().focus().setImage({ src: url }).run();
		}
		showImageMenu = false;
	}
	
	function triggerImageUpload() {
		imageFileInput?.click();
		showImageMenu = false;
	}
	
	async function handleImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !$editor) return;
		
		// Validate file
		const validationError = validateImageFile(file, {
			maxSize: 5 * 1024 * 1024,
			allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
		});
		
		if (validationError) {
			alert(validationError);
			input.value = '';
			return;
		}
		
		// The CustomImage extension will handle the upload
		// We just need to trigger the file read
		const reader = new FileReader();
		reader.onload = () => {
			// Create a temporary DataTransfer to trigger the extension's paste handler
			const items = new DataTransfer();
			items.items.add(file);
			
			// Let the extension handle it by dispatching a paste event
			// For now, we'll use the onImageUpload callback if provided
			if (onImageUpload) {
				onImageUpload(file).then(url => {
					$editor?.chain().focus().setImage({ src: url }).run();
				}).catch(error => {
					console.error('Upload failed:', error);
					alert('Failed to upload image');
				});
			} else {
				// Fallback to base64
				$editor.chain().focus().setImage({ src: reader.result as string }).run();
			}
		};
		reader.readAsDataURL(file);
		
		// Reset input
		input.value = '';
	}

	// Close dropdowns on outside click
	function closeMenus() {
		showHeadingMenu = false;
		showListMenu = false;
		showImageMenu = false;
	}
</script>

<svelte:window onclick={closeMenus} />

<div
	class="border border-surface-700 rounded-lg overflow-hidden bg-surface-900"
>
	{#if $editor && !readonly}
		<div
			class="toolbar flex flex-wrap gap-1 p-1.5 border-b border-surface-700 bg-surface-800/50 backdrop-blur-sm sticky top-0 z-10"
		>
			<!-- Text Style -->
			<div class="flex gap-0.5 mr-1">
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('bold')
						? 'active'
						: ''}"
					onclick={() => $editor.chain().focus().toggleBold().run()}
					title="Bold"
				>
					<Bold size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('italic')
						? 'active'
						: ''}"
					onclick={() => $editor.chain().focus().toggleItalic().run()}
					title="Italic"
				>
					<Italic size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('strike')
						? 'active'
						: ''}"
					onclick={() => $editor.chain().focus().toggleStrike().run()}
					title="Strikethrough"
				>
					<Strikethrough size={16} />
				</button>
			</div>

			<div class="w-px h-6 bg-surface-700/50 self-center"></div>

			<!-- Heading Dropdown -->
			<div class="relative mx-1">
				<button
					type="button"
					class="toolbar-btn flex items-center gap-1 min-w-[70px] justify-between {showHeadingMenu
						? 'bg-surface-700'
						: ''}"
					onclick={(e) => {
						e.stopPropagation();
						showHeadingMenu = !showHeadingMenu;
						showListMenu = false;
					}}
				>
					<div class="flex items-center gap-1.5">
						<Type size={16} />
						<span
							class="text-[10px] font-bold uppercase tracking-wider"
						>
							{#if $editor.isActive("heading", { level: 1 })}H1
							{:else if $editor.isActive( "heading", { level: 2 }, )}H2
							{:else if $editor.isActive( "heading", { level: 3 }, )}H3
							{:else}Text{/if}
						</span>
					</div>
					<ChevronDown size={12} class="opacity-50" />
				</button>

				{#if showHeadingMenu}
					<div class="dropdown-menu animate-scale-in">
						<button
							type="button"
							class="dropdown-item {$editor.isActive('paragraph')
								? 'active'
								: ''}"
							onclick={() =>
								$editor.chain().focus().setParagraph().run()}
						>
							<Text size={16} />
							<span>Paragraph</span>
						</button>
						<button
							type="button"
							class="dropdown-item {$editor.isActive('heading', {
								level: 1,
							})
								? 'active'
								: ''}"
							onclick={() =>
								$editor
									.chain()
									.focus()
									.toggleHeading({ level: 1 })
									.run()}
						>
							<Heading1 size={16} />
							<span>Heading 1</span>
						</button>
						<button
							type="button"
							class="dropdown-item {$editor.isActive('heading', {
								level: 2,
							})
								? 'active'
								: ''}"
							onclick={() =>
								$editor
									.chain()
									.focus()
									.toggleHeading({ level: 2 })
									.run()}
						>
							<Heading2 size={16} />
							<span>Heading 2</span>
						</button>
						<button
							type="button"
							class="dropdown-item {$editor.isActive('heading', {
								level: 3,
							})
								? 'active'
								: ''}"
							onclick={() =>
								$editor
									.chain()
									.focus()
									.toggleHeading({ level: 3 })
									.run()}
						>
							<Heading3 size={16} />
							<span>Heading 3</span>
						</button>
					</div>
				{/if}
			</div>

			<div class="w-px h-6 bg-surface-700/50 self-center"></div>

			<!-- List Dropdown -->
			<div class="relative mx-1">
				<button
					type="button"
					class="toolbar-btn flex items-center gap-1 {showListMenu
						? 'bg-surface-700'
						: ''}"
					onclick={(e) => {
						e.stopPropagation();
						showListMenu = !showListMenu;
						showHeadingMenu = false;
					}}
				>
					<List size={16} />
					<ChevronDown size={12} class="opacity-50" />
				</button>

				{#if showListMenu}
					<div class="dropdown-menu animate-scale-in">
						<button
							type="button"
							class="dropdown-item {$editor.isActive('bulletList')
								? 'active'
								: ''}"
							onclick={() =>
								$editor
									.chain()
									.focus()
									.toggleBulletList()
									.run()}
						>
							<List size={16} />
							<span>Bullet List</span>
						</button>
						<button
							type="button"
							class="dropdown-item {$editor.isActive(
								'orderedList',
							)
								? 'active'
								: ''}"
							onclick={() =>
								$editor
									.chain()
									.focus()
									.toggleOrderedList()
									.run()}
						>
							<ListOrdered size={16} />
							<span>Ordered List</span>
						</button>
						<button
							type="button"
							class="dropdown-item {$editor.isActive('taskList')
								? 'active'
								: ''}"
							onclick={() =>
								$editor.chain().focus().toggleTaskList().run()}
						>
							<ListTodo size={16} />
							<span>Task List</span>
						</button>
					</div>
				{/if}
			</div>

			<div class="w-px h-6 bg-surface-700/50 self-center"></div>

			<!-- Alignment -->
			<div class="flex gap-0.5 mx-1">
				<button
					type="button"
					class="toolbar-btn {$editor.isActive({ textAlign: 'left' })
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().setTextAlign("left").run()}
					title="Align Left"
				>
					<AlignLeft size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive({
						textAlign: 'center',
					})
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().setTextAlign("center").run()}
					title="Align Center"
				>
					<AlignCenter size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive({ textAlign: 'right' })
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().setTextAlign("right").run()}
					title="Align Right"
				>
					<AlignRight size={16} />
				</button>
			</div>

			<div class="w-px h-6 bg-surface-700/50 self-center"></div>

			<!-- Formatting -->
			<div class="flex gap-0.5 mx-1">
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('highlight')
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().toggleHighlight().run()}
					title="Highlight"
				>
					<Highlighter size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('blockquote')
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().toggleBlockquote().run()}
					title="Blockquote"
				>
					<Quote size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn {$editor.isActive('codeBlock')
						? 'active'
						: ''}"
					onclick={() =>
						$editor.chain().focus().toggleCodeBlock().run()}
					title="Code Block"
				>
					<Code size={16} />
				</button>
				
				<!-- Image Dropdown -->
				<div class="relative">
					<button
						type="button"
						class="toolbar-btn flex items-center gap-1 {showImageMenu
							? 'bg-surface-700'
							: ''}"
						onclick={(e) => {
							e.stopPropagation();
							showImageMenu = !showImageMenu;
							showHeadingMenu = false;
							showListMenu = false;
						}}
						title="Add Image"
					>
						<ImageIcon size={16} />
						<ChevronDown size={12} class="opacity-50" />
					</button>

					{#if showImageMenu}
						<div class="dropdown-menu animate-scale-in">
							<button
								type="button"
								class="dropdown-item"
								onclick={addImageFromURL}
							>
								<ImageIcon size={16} />
								<span>From URL</span>
							</button>
							<button
								type="button"
								class="dropdown-item"
								onclick={triggerImageUpload}
							>
								<Upload size={16} />
								<span>Upload File</span>
							</button>
						</div>
					{/if}
				</div>
				
				<!-- Hidden file input for image upload -->
				<input
					type="file"
					accept="image/jpeg,image/png,image/gif,image/webp"
					class="hidden"
					bind:this={imageFileInput}
					onchange={handleImageUpload}
				/>
			</div>

			<div class="flex-grow"></div>

			<!-- History -->
			<div class="flex gap-0.5">
				<button
					type="button"
					class="toolbar-btn"
					onclick={() => $editor.chain().focus().undo().run()}
					disabled={!$editor.can().undo()}
					title="Undo"
				>
					<Undo size={16} />
				</button>
				<button
					type="button"
					class="toolbar-btn"
					onclick={() => $editor.chain().focus().redo().run()}
					disabled={!$editor.can().redo()}
					title="Redo"
				>
					<Redo size={16} />
				</button>
			</div>
		</div>
	{/if}
	<div class="editor-content {readonly ? 'readonly' : ''}">
		<EditorContent editor={$editor} />
	</div>
</div>

<style>
	@reference "../../../routes/layout.css";

	.toolbar-btn {
		@apply p-2 rounded-md transition-all text-surface-400 hover:text-surface-100 hover:bg-surface-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none;
	}

	.toolbar-btn.active {
		@apply text-primary-400 bg-primary-500/10;
	}

	.dropdown-menu {
		@apply absolute top-full left-0 mt-1 min-w-[160px] bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-20 p-1 overflow-hidden;
	}

	.dropdown-item {
		@apply flex items-center gap-3 w-full p-2.5 rounded-md text-sm text-surface-300 hover:bg-surface-700 hover:text-surface-100 transition-colors text-left;
	}

	.dropdown-item.active {
		@apply bg-primary-500/10 text-primary-400;
	}

	.editor-content :global(.ProseMirror) {
		@apply min-h-[300px] p-6 outline-none text-surface-200 leading-relaxed;
	}

	.editor-content.readonly :global(.ProseMirror) {
		@apply min-h-0 p-0 bg-transparent border-none;
	}

	/* Tiptap Specific Content Styles */
	:global(.ProseMirror h1) {
		@apply text-3xl font-black mb-4 mt-2 text-surface-100;
	}
	:global(.ProseMirror h2) {
		@apply text-2xl font-black mb-3 mt-4 text-surface-100;
	}
	:global(.ProseMirror h3) {
		@apply text-xl font-bold mb-2 mt-3 text-surface-100;
	}
	:global(.ProseMirror p) {
		@apply mb-4;
	}

	:global(.ProseMirror ul) {
		@apply list-disc ml-6 mb-4;
	}
	:global(.ProseMirror ol) {
		@apply list-decimal ml-6 mb-4;
	}

	:global(.ProseMirror blockquote) {
		@apply border-l-4 border-primary-500 pl-4 py-2 my-6 bg-surface-800/50 italic text-surface-300 rounded-r-lg;
	}

	:global(.ProseMirror code) {
		@apply bg-surface-800 text-primary-400 px-1.5 py-0.5 rounded font-mono text-sm;
	}

	:global(.ProseMirror pre) {
		@apply bg-surface-950 text-surface-300 p-4 rounded-xl font-mono text-sm my-6 overflow-x-auto border border-surface-800;
	}

	:global(.ProseMirror pre code) {
		@apply bg-transparent text-inherit p-0 rounded-none;
	}

	:global(.ProseMirror img) {
		@apply max-w-full h-auto rounded-xl my-6 border border-surface-800 shadow-xl;
	}

	:global(.ProseMirror mark) {
		@apply bg-primary-500/30 text-primary-200 px-1 rounded;
	}

	:global(.ProseMirror ul[data-type="taskList"]) {
		@apply list-none ml-0 p-0;
	}

	:global(.ProseMirror ul[data-type="taskList"] li) {
		@apply flex items-start gap-3 mb-2;
	}

	:global(.ProseMirror ul[data-type="taskList"] label) {
		@apply flex items-center select-none cursor-pointer pt-1;
	}

	:global(.ProseMirror ul[data-type="taskList"] input[type="checkbox"]) {
		@apply w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-600 focus:ring-offset-surface-900;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		@apply text-surface-600 float-left h-0 pointer-events-none italic;
		content: attr(data-placeholder);
	}
</style>
