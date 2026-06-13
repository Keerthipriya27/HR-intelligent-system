import { useAuthContext } from './AuthProvider';

// ─── Convenience Hook ───

export function useAuth() {
  const ctx = useAuthContext();

  return {
    user: ctx.user,
    status: ctx.status,
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.status === 'authenticated',
    isUnauthenticated: ctx.status === 'unauthenticated',
    isMfaRequired: ctx.status === 'mfa_required',
    mfaPending: ctx.mfaPending,
    pendingFactorId: ctx.pendingFactorId,
    login: ctx.login,
    signup: ctx.signup,
    logout: ctx.logout,
    completeMfaSetup: ctx.completeMfaSetup,
    completeMfaLogin: ctx.completeMfaLogin,
    setMfaPending: ctx.setMfaPending,
    checkAccess: ctx.checkAccess,
    restoreSession: ctx.restoreSession,
  };
}
