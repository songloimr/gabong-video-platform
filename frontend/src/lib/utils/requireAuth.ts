import { auth } from '$lib/stores/auth.svelte';
import { loginModal } from '$lib/stores/loginModal.svelte';

/**
 * Checks if the user is authenticated.
 * If not, opens the login modal and returns false.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export function requireAuth(): boolean {
  if (!auth.user) {
    loginModal.open();
    return false;
  }

  return true;
}

