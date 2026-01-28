/**
 * Convert a File object to base64 string
 * 
 * @param file - The file to convert
 * @returns Promise that resolves to base64 data URL
 * 
 * @example
 * ```ts
 * const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
 * const base64 = await fileToBase64(file);
 * // Returns: 'data:image/jpeg;base64,...'
 * ```
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('Failed to read file as base64'));
			}
		};
		
		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};
		
		reader.readAsDataURL(file);
	});
}

/**
 * Validate image file
 * 
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(
	file: File,
	options: {
		maxSize?: number;
		allowedTypes?: string[];
	} = {}
): string | null {
	const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;
	
	// Check file size
	if (file.size > maxSize) {
		const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
		return `File size exceeds ${maxMB}MB limit`;
	}
	
	// Check MIME type
	if (!allowedTypes.includes(file.type)) {
		return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
	}
	
	return null;
}
