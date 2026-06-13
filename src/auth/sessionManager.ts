import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Session Manager ───

class SessionManager {
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(event: SessionEvent) => void> = [];

  startAutoRefresh(): void {
    if (this.refreshTimer) return;

    this.refreshTimer = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          this.emit({ type: 'REFRESH_FAILED', error: error.message });
        } else if (data.session) {
          this.emit({ type: 'TOKEN_REFRESHED', expiresAt: data.session.expires_at });
        }
      } catch {
        this.emit({ type: 'REFRESH_FAILED', error: 'Session refresh failed' });
      }
    }, SESSION_CHECK_INTERVAL);
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  subscribe(listener: (event: SessionEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: SessionEvent): void {
    this.listeners.forEach(l => l(event));
  }

  async checkSessionTimeout(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;

    const createdAt = (data.session as any).created_at ? new Date((data.session as any).created_at).getTime() : Date.now();
    const elapsed = Date.now() - createdAt;

    if (elapsed > SESSION_TIMEOUT_MS) {
      await supabase.auth.signOut();
      this.emit({ type: 'SESSION_TIMEOUT' });
      return false;
    }

    return true;
  }

  getSessionTimeout(): number {
    return SESSION_TIMEOUT_MS;
  }
}

export type SessionEvent =
  | { type: 'TOKEN_REFRESHED'; expiresAt?: number }
  | { type: 'REFRESH_FAILED'; error: string }
  | { type: 'SESSION_TIMEOUT' }
  | { type: 'SESSION_RESTORED' }
  | { type: 'SESSION_EXPIRED' };

export const sessionManager = new SessionManager();

// ─── Secure Local Storage ───

const STORAGE_PREFIX = 'hrci_auth_';

export const secureStorage = {
  set(key: string, value: string): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      // Storage quota exceeded or unavailable
      console.warn('[SecureStorage] Failed to save:', key);
    }
  },

  get(key: string): string | null {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // ignore
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};
