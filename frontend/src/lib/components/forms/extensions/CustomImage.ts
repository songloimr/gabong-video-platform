import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { fileToBase64 } from '$lib/utils/file';

export interface ImageUploadOptions {
	/**
	 * Callback for uploading image file to server
	 * Should return the URL of the uploaded image
	 */
	onUpload?: (file: File) => Promise<string>;
	
	/**
	 * Maximum file size in bytes (default: 5MB)
	 */
	maxSize?: number;
	
	/**
	 * Allowed MIME types
	 */
	allowedTypes?: string[];
	
	/**
	 * Allow base64 images when upload fails or no upload handler
	 */
	fallbackToBase64?: boolean;
}

/**
 * Custom Image extension with upload support
 * Extends the default TipTap Image extension with:
 * - File upload handling
 * - Drag & drop support
 * - Paste image support
 * - File size validation
 * - MIME type validation
 */
export const CustomImage = Image.extend<ImageUploadOptions>({
	name: 'customImage',
	
	addOptions() {
		return {
			...this.parent?.(),
			inline: false,
			allowBase64: false, // Disable by default, only use via fallback
			maxSize: 5 * 1024 * 1024, // 5MB
			allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
			fallbackToBase64: false,
			onUpload: undefined,
		};
	},
	
	addProseMirrorPlugins() {
		const options = this.options;
		const editor = this.editor;
		
		return [
			new Plugin({
				key: new PluginKey('imageUpload'),
				props: {
					handleDOMEvents: {
						// Handle paste events
						paste(view, event) {
							const items = event.clipboardData?.items;
							if (!items) return false;
							
							for (const item of Array.from(items)) {
								if (item.type.indexOf('image') === 0) {
									event.preventDefault();
									const file = item.getAsFile();
									if (file) {
										handleImageFile(file, view, options, editor);
									}
									return true;
								}
							}
							return false;
						},
						
						// Handle drop events
						drop(view, event) {
							const hasFiles = event.dataTransfer?.files?.length;
							if (!hasFiles) return false;
							
							const images = Array.from(event.dataTransfer.files).filter(file =>
								file.type.indexOf('image') === 0
							);
							
							if (images.length === 0) return false;
							
							event.preventDefault();
							
							const { schema } = view.state;
							const coordinates = view.posAtCoords({
								left: event.clientX,
								top: event.clientY,
							});
							
							images.forEach(async (image) => {
								const url = await processImageFile(image, options);
								if (url && coordinates) {
									const node = schema.nodes.customImage?.create({ src: url });
									if (node) {
										const transaction = view.state.tr.insert(coordinates.pos, node);
										view.dispatch(transaction);
									}
								}
							});
							
							return true;
						},
					},
				},
			}),
		];
	},
});

/**
 * Handle image file upload with validation
 */
async function handleImageFile(
	file: File,
	view: any,
	options: ImageUploadOptions,
	editor: any
): Promise<void> {
	const url = await processImageFile(file, options);
	if (url) {
		editor.chain().focus().setImage({ src: url }).run();
	}
}

/**
 * Process and upload image file
 * Returns the image URL or null if failed
 */
async function processImageFile(
	file: File,
	options: ImageUploadOptions
): Promise<string | null> {
	// Validate file size
	if (options.maxSize && file.size > options.maxSize) {
		const maxMB = (options.maxSize / (1024 * 1024)).toFixed(1);
		alert(`Image size exceeds ${maxMB}MB limit`);
		return null;
	}
	
	// Validate MIME type
	if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
		alert(`Invalid image type. Allowed: ${options.allowedTypes.join(', ')}`);
		return null;
	}
	
	// Try to upload if handler provided
	if (options.onUpload) {
		try {
			return await options.onUpload(file);
		} catch (error) {
			console.error('Image upload failed:', error);
			
			// Fallback to base64 if enabled
			if (options.fallbackToBase64) {
				try {
					return await fileToBase64(file);
				} catch (base64Error) {
					console.error('Base64 conversion failed:', base64Error);
					return null;
				}
			}
			return null;
		}
	}
	
	// Use base64 if no upload handler and fallback enabled
	if (options.fallbackToBase64) {
		try {
			return await fileToBase64(file);
		} catch (error) {
			console.error('Base64 conversion failed:', error);
			return null;
		}
	}
	
	alert('Image upload is not configured');
	return null;
}

export default CustomImage;
