/**
 * Centralized validation constants for the frontend.
 * Keep in sync with backend validation.
 */

// Title validation
export const TITLE_MIN_LENGTH = 2;
export const TITLE_MAX_LENGTH = 60;
export const TITLE_ERROR_MIN = `Tiêu đề phải có ít nhất ${TITLE_MIN_LENGTH} ký tự`;
export const TITLE_ERROR_MAX = `Tiêu đề không được vượt quá ${TITLE_MAX_LENGTH} ký tự`;

// Description validation
export const DESCRIPTION_MAX_LENGTH = 1300;
export const DESCRIPTION_ERROR_MAX = `Mô tả không được vượt quá ${DESCRIPTION_MAX_LENGTH} ký tự`;

// Username validation
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9]+$/;
export const USERNAME_ERROR_MIN = `Tên người dùng phải có ít nhất ${USERNAME_MIN_LENGTH} ký tự`;
export const USERNAME_ERROR_MAX = `Tên người dùng không được vượt quá ${USERNAME_MAX_LENGTH} ký tự`;
export const USERNAME_ERROR_PATTERN = 'Tên người dùng chỉ được chứa chữ thường (a-z) và số (0-9)';

// Password validation
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 25;
export const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
export const PASSWORD_ERROR_MIN = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`;
export const PASSWORD_ERROR_MAX = `Mật khẩu không được vượt quá ${PASSWORD_MAX_LENGTH} ký tự`;
export const PASSWORD_ERROR_PATTERN = 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số';

// Search validation
export const SEARCH_MAX_LENGTH = 50;
export const SEARCH_ERROR_MAX = `Tìm kiếm không được vượt quá ${SEARCH_MAX_LENGTH} ký tự`;

/**
 * Validates username format
 */
export function validateUsername(username: string): string | null {
    if (!username) return 'Vui lòng nhập tên người dùng';
    if (username.length < USERNAME_MIN_LENGTH) return USERNAME_ERROR_MIN;
    if (username.length > USERNAME_MAX_LENGTH) return USERNAME_ERROR_MAX;
    if (!USERNAME_PATTERN.test(username)) return USERNAME_ERROR_PATTERN;
    return null;
}

/**
 * Validates password format
 */
export function validatePassword(password: string): string | null {
    if (!password) return 'Vui lòng nhập mật khẩu';
    if (password.length < PASSWORD_MIN_LENGTH) return PASSWORD_ERROR_MIN;
    if (password.length > PASSWORD_MAX_LENGTH) return PASSWORD_ERROR_MAX;
    if (!PASSWORD_PATTERN.test(password)) return PASSWORD_ERROR_PATTERN;
    return null;
}

/**
 * Validates title format
 */
export function validateTitle(title: string): string | null {
    if (!title) return 'Vui lòng nhập tiêu đề';
    if (title.length < TITLE_MIN_LENGTH) return TITLE_ERROR_MIN;
    if (title.length > TITLE_MAX_LENGTH) return TITLE_ERROR_MAX;
    return null;
}

/**
 * Validates description length
 */
export function validateDescription(description: string): string | null {
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
        return DESCRIPTION_ERROR_MAX;
    }
    return null;
}

/**
 * Validates search query
 */
export function validateSearch(search: string): string | null {
    if (search && search.length > SEARCH_MAX_LENGTH) {
        return SEARCH_ERROR_MAX;
    }
    return null;
}

/**
 * Strips HTML tags for plain text length calculation
 */
export function getPlainTextLength(html: string): number {
    if (!html) return 0;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent?.length || 0;
}
