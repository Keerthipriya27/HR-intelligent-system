import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, AuthStatus, UserRole } from '../lib/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getCurrentSession, onAuthStateChange, signOut as authSignOut } from '../services/authService';
import { removeAllTrustedDevices } from './TrustedDevice';
import { sessionManager } from './sessionManager';

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  mfaPending: boolean;
  pendingFactorId: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null; mfaRequired: boolean; mfaFactorId?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole, department?: string) => Promise<{ error: string | null; needsMfaSetup: boolean; emailConfirmationRequired?: boolean; email?: string }>;
  logout: () => Promise<void>;
  completeMfaSetup: () => Promise<void>;
  completeMfaLogin: (factorId: string, code: string) => Promise<{ error: string | null }>;
  setMfaPending: (v: boolean) => void;
  checkAccess: (requiredRoles?: UserRole[]) => boolean;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const initRef = useRef(false);

  const restoreSession = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setStatus('unauthenticated');
      setIsLoading(false);
      return;
    }
    try {
      const result = await getCurrentSession();
      if (result.user && result.session) {
        // If user has MFA enabled, force TOTP verification every session restore
        if (result.user.mfaEnabled) {
          setUser(result.user);
          setMfaPending(true);
          // Fetch the verified factor ID for TOTP challenge
          try {
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const all = factorsData?.all ?? [];
            const verified = all.filter((f: any) => f.status === 'verified');
            const factorId = verified[0]?.id;
            if (factorId) {
              setPendingFactorId(factorId);
            }
          } catch {
            // If we can't list factors, still require MFA
          }
          setStatus('mfa_required');
        } else {
          setUser(result.user);
          setStatus('authenticated');
          sessionManager.startAutoRefresh();
        }
      } else {
        setStatus('unauthenticated');
        setUser(null);
      }
    } catch {
      setStatus('unauthenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    restoreSession();
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStatus('unauthenticated');
        sessionManager.stopAutoRefresh();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const u: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'User',
            email: session.user.email ?? '',
            role: session.user.user_metadata?.role ?? 'employee',
            department: session.user.user_metadata?.department,
            mfaEnabled: (session.user.factors ?? []).some((f: any) => f.status === 'verified'),
          };
          setUser(u);
          setStatus('authenticated');
          sessionManager.startAutoRefresh();
        }
      }
    });
    return () => {
      subscription.unsubscribe();
      sessionManager.stopAutoRefresh();
    };
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { signIn } = await import('../services/authService');
      const result = await signIn(email, password);
      if (result.error) {
        return { error: result.error, mfaRequired: false };
      }
      if (result.mfaRequired) {
        setMfaPending(true);
        const factorId = result.mfaFactors[0]?.id;
        setPendingFactorId(factorId);
        setStatus('mfa_required');
        return { error: null, mfaRequired: true, mfaFactorId: factorId };
      }
      if (result.user && result.session) {
        setUser(result.user);
        setStatus('authenticated');
      }
      return { error: null, mfaRequired: false };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Login failed', mfaRequired: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole, department?: string) => {
    setIsLoading(true);
    try {
      const { signUp } = await import('../services/authService');
      const result = await signUp(email, password, name, role, department);
      if (result.error) {
        return { error: result.error, needsMfaSetup: false };
      }
      if (result.user && result.session) {
        setUser(result.user);
        setStatus('authenticated');
        return { error: null, needsMfaSetup: true };
      }
      // Email confirmation required — session is null
      if (result.emailConfirmationRequired) {
        return {
          error: null,
          needsMfaSetup: false,
          emailConfirmationRequired: true,
          email: result.user?.email,
        };
      }
      return { error: null, needsMfaSetup: false, emailConfirmationRequired: false, email: undefined };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Signup failed', needsMfaSetup: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        removeAllTrustedDevices();
      }
      await authSignOut();
      setUser(null);
      setStatus('unauthenticated');
      setMfaPending(false);
      setPendingFactorId(null);
      sessionManager.stopAutoRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const completeMfaSetup = useCallback(async () => {
    if (user) {
      setUser({ ...user, mfaEnabled: true });
    }
  }, [user]);

  const completeMfaLogin = useCallback(async (factorId: string, code: string) => {
    setIsLoading(true);
    try {
      const { verifyChallenge, challengeTOTP } = await import('../services/mfaService');
      const challengeResult = await challengeTOTP(factorId);
      if (challengeResult.error) {
        return { error: challengeResult.error };
      }
      const verifyResult = await verifyChallenge(factorId, challengeResult.challengeId!, code);
      if (verifyResult.error) {
        return { error: verifyResult.error };
      }
      const result = await getCurrentSession();
      if (result.user) {
        setUser(result.user);
        setStatus('authenticated');
        setMfaPending(false);
        setPendingFactorId(null);
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'MFA verification failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAccess = useCallback((requiredRoles?: UserRole[]): boolean => {
    if (!user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, status, isLoading, mfaPending, pendingFactorId, login, signup, logout, completeMfaSetup, completeMfaLogin, setMfaPending, checkAccess, restoreSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
