import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizePlainText, isHTMLSafe, XSS_TEST_PAYLOADS } from '$lib/utils/sanitize';

describe('sanitizeHTML', () => {
	it('should remove script tags', () => {
		const dirty = '<p>Hello</p><script>alert("XSS")</script>';
		const clean = sanitizeHTML(dirty);
		expect(clean).not.toContain('<script>');
		expect(clean).toContain('<p>Hello</p>');
	});

	it('should remove event handlers', () => {
		const dirty = '<img src="test.jpg" onerror="alert(\'XSS\')">';
		const clean = sanitizeHTML(dirty);
		expect(clean).not.toContain('onerror');
	});

	it('should preserve safe TipTap HTML', () => {
		const safe = '<h1>Heading</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p>';
		const clean = sanitizeHTML(safe);
		expect(clean).toBe(safe);
	});

	it('should remove iframe tags', () => {
		const dirty = '<p>Safe</p><iframe src="javascript:alert(\'XSS\')"></iframe>';
		const clean = sanitizeHTML(dirty);
		expect(clean).not.toContain('<iframe>');
		expect(clean).toContain('<p>Safe</p>');
	});

	it('should sanitize inline styles with javascript', () => {
		const dirty = '<div style="background:url(javascript:alert(\'XSS\'))">Test</div>';
		const clean = sanitizeHTML(dirty);
		expect(clean).not.toContain('javascript:');
	});
});

describe('sanitizePlainText', () => {
	it('should remove all HTML tags', () => {
		const dirty = '<p>Hello <strong>World</strong></p>';
		const clean = sanitizePlainText(dirty);
		expect(clean).toBe('Hello World');
		expect(clean).not.toContain('<');
	});

	it('should keep text content only', () => {
		const dirty = '<script>alert("XSS")</script>Important Text';
		const clean = sanitizePlainText(dirty);
		expect(clean).toBe('Important Text');
	});
});

describe('isHTMLSafe', () => {
	it('should return false for malicious HTML', () => {
		const malicious = '<script>alert("XSS")</script>';
		expect(isHTMLSafe(malicious)).toBe(false);
	});

	it('should return true for safe HTML', () => {
		const safe = '<p>Hello <strong>World</strong></p>';
		expect(isHTMLSafe(safe)).toBe(true);
	});
});

describe('XSS Test Payloads', () => {
	it('should sanitize all XSS test payloads', () => {
		XSS_TEST_PAYLOADS.forEach(payload => {
			const clean = sanitizeHTML(payload);
			// None of the payloads should contain script-like content after sanitization
			expect(clean).not.toContain('<script>');
			expect(clean).not.toContain('javascript:');
			expect(clean).not.toContain('onerror=');
			expect(clean).not.toContain('onload=');
		});
	});

	it('should mark all XSS payloads as unsafe', () => {
		XSS_TEST_PAYLOADS.forEach(payload => {
			expect(isHTMLSafe(payload)).toBe(false);
		});
	});
});
