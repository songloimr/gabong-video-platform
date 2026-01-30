import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for DOMPurify to allow TipTap-safe HTML
 * while preventing XSS attacks
 */
const TIPTAP_ALLOWED_TAGS = [
	// Text formatting
	'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
	// Headings
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
	// Lists
	'ul', 'ol', 'li',
	// Blockquote
	'blockquote',
	// Media
	'img',
	// Marks
	'mark', 'span',
	// Task lists
	'input'
];

const TIPTAP_ALLOWED_ATTR = [
	'href', 'target', 'rel', // Links
	'src', 'alt', 'title', 'width', 'height', // Images
	'class', 'data-*', // Styling and data attributes
	'style', // Inline styles (will be further filtered)
	'type', 'checked', 'disabled', // Task list inputs
	'align' // Text alignment
];

/**
 * Sanitize HTML content to prevent XSS while preserving TipTap formatting
 * 
 * @param dirty - The HTML string to sanitize
 * @param options - Additional DOMPurify configuration options
 * @returns Sanitized HTML string
 * 
 * @example
 * ```ts
 * const clean = sanitizeHTML('<p>Hello <script>alert("XSS")</script></p>');
 * // Returns: '<p>Hello </p>'
 * ```
 */
export function sanitizeHTML(dirty: string, options: any = {}): string {
	const config: any = {
		ALLOWED_TAGS: TIPTAP_ALLOWED_TAGS,
		ALLOWED_ATTR: TIPTAP_ALLOWED_ATTR,
		// Allow data attributes for TipTap functionality
		ALLOW_DATA_ATTR: true,
		// Don't allow unknown protocols in URLs
		ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
		// Keep relative URLs
		KEEP_CONTENT: true,
		// Return empty string instead of null
		RETURN_DOM: false,
		RETURN_DOM_FRAGMENT: false,
		// Prevent DOM clobbering
		SANITIZE_DOM: true,
		// Additional security
		FORCE_BODY: false,
		// Remove script-like attributes
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseenter', 'onfocus'],
		// Forbid script tags even if somehow passed
		FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base', 'link', 'meta', 'style'],
		...options
	};

	// Additional hook to sanitize style attributes
	DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
		// Remove dangerous CSS
		if (data.attrName === 'style') {
			// Remove expressions, behaviors, and bindings
			data.attrValue = data.attrValue
				.replace(/expression\s*\(/gi, '')
				.replace(/behavior\s*:/gi, '')
				.replace(/binding\s*:/gi, '')
				.replace(/javascript\s*:/gi, '')
				.replace(/vbscript\s*:/gi, '')
				.replace(/@import/gi, '')
				.replace(/url\s*\(/gi, '');
		}
	});

	const clean = DOMPurify.sanitize(dirty, config);
	
	// Remove hooks after use to prevent memory leaks
	DOMPurify.removeAllHooks();
	
	return typeof clean === 'string' ? clean : clean.toString();
}

/**
 * Strict sanitization that removes all HTML tags
 * Use for plain text fields that should never contain HTML
 * 
 * @param dirty - The string to sanitize
 * @returns Plain text without any HTML
 * 
 * @example
 * ```ts
 * const clean = sanitizePlainText('<p>Hello <b>World</b></p>');
 * // Returns: 'Hello World'
 * ```
 */
export function sanitizePlainText(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true
	});
}

/**
 * Validate if HTML content is safe (doesn't contain malicious code)
 * Returns true if content is safe, false otherwise
 * 
 * @param html - The HTML string to validate
 * @returns true if safe, false if contains potentially malicious content
 */
export function isHTMLSafe(html: string): boolean {
	const sanitized = sanitizeHTML(html);
	// If sanitization changed the content significantly, it contained malicious code
	// We normalize both to handle whitespace differences
	const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
	return normalize(sanitized) === normalize(html);
}

/**
 * Test data for sanitization - DO NOT use in production rendering!
 * These are common XSS attack vectors to test sanitization
 */
export const XSS_TEST_PAYLOADS = [
	'<script>alert("XSS")</script>',
	'<img src=x onerror=alert("XSS")>',
	'<svg onload=alert("XSS")>',
	'<iframe src="javascript:alert(\'XSS\')"></iframe>',
	'<body onload=alert("XSS")>',
	'<input onfocus=alert("XSS") autofocus>',
	'<style>body{background:url("javascript:alert(\'XSS\')")}</style>',
	'<a href="javascript:alert(\'XSS\')">Click me</a>',
	'<div style="background:url(javascript:alert(\'XSS\'))">',
	'<object data="javascript:alert(\'XSS\')">',
] as const;
