import { browser } from '$app/environment';
import type { User } from '$lib/types';

interface AuthState {
    user: User | null;
    access_token: string | null;
    refresh_token: string | null;
}

class AuthStore {
    state = $state<AuthState>({
        user: null,
        access_token: null,
        refresh_token: null
    });

    get user() { return this.state.user; }
    get access_token() { return this.state.access_token; }
    get refresh_token() { return this.state.refresh_token; }
    get isAuthenticated() { return !!this.state.access_token; }

    setAuth(auth: AuthState | null) {
        if (auth) {
            this.state.user = auth.user;
            this.state.access_token = auth.access_token;
            this.state.refresh_token = auth.refresh_token;
            if (browser) {
                localStorage.setItem('auth', JSON.stringify(auth));
            }
        } else {
            this.clearAuth();
        }
    }

    loadAuth() {
        if (!browser) return;
        const stored = localStorage.getItem('auth');
        if (stored) {
            try {
                const auth = JSON.parse(stored);
                this.state.user = auth.user;
                this.state.access_token = auth.access_token;
                this.state.refresh_token = auth.refresh_token;
            } catch (e) {
                console.error('Failed to load auth:', e);
            }
        }
    }

    clearAuth() {
        this.state.user = null;
        this.state.access_token = null;
        this.state.refresh_token = null;
        if (browser) {
            localStorage.removeItem('auth');
        }
    }

    getUserRole(): 'user' | 'admin' | null {
        return this.state.user?.role || null;
    }
}

export const auth = new AuthStore();
