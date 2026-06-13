import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, UserRole } from '../lib/types';

// ─── Sign Up ───

export interface SignUpResult {
  error: string | null;
  user: User | null;
  session: { accessToken: string; refreshToken: string; expiresAt: number } | null;
  emailConfirmationRequired: boolean;
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'employee',
  department?: string
): Promise<SignUpResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', user: null, session: null, emailConfirmationRequired: false };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        department: department ?? '',
      },
    },
  });

  if (error) {
    return { error: error.message, user: null, session: null, emailConfirmationRequired: false };
  }

  if (!data.user) {
    return { error: 'Sign up failed: no user returned', user: null, session: null, emailConfirmationRequired: false };
  }

  const user: User = {
    id: data.user.id,
    name: data.user.user_metadata?.name ?? email.split('@')[0],
    email: data.user.email ?? email,
    role: data.user.user_metadata?.role ?? role,
    department: data.user.user_metadata?.department ?? department,
    mfaEnabled: false,
  };

  return {
    error: null,
    user,
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at ?? Date.now() + 3600000,
        }
      : null,
    emailConfirmationRequired: !data.session && !data.user.confirmed_at,
  };
}

// ─── Sign In ───

export interface SignInResult {
  error: string | null;
  user: User | null;
  session: { accessToken: string; refreshToken: string; expiresAt: number } | null;
  mfaRequired: boolean;
  mfaFactors: Array<{ id: string; factorType: string }>;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', user: null, session: null, mfaRequired: false, mfaFactors: [] };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Check if MFA is required (Supabase v2 returns code 'mfa_required')
    const isMfaRequired = (error as any)?.code === 'mfa_required' || error.message?.includes('MFA');
    if (isMfaRequired) {
      // Fetch the user's MFA factors to get the factor ID for challenging
      try {
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const all = factorsData?.all ?? [];
        const verified = all.filter((f: any) => f.status === 'verified');
        return {
          error: null,
          user: null,
          session: null,
          mfaRequired: true,
          mfaFactors: verified.map((f: any) => ({ id: f.id, factorType: f.factor_type })),
        };
      } catch {
        // If we can't list factors, still indicate MFA is required
        return {
          error: null,
          user: null,
          session: null,
          mfaRequired: true,
          mfaFactors: [],
        };
      }
    }
    return { error: error.message, user: null, session: null, mfaRequired: false, mfaFactors: [] };
  }

  if (!data.user) {
    return { error: 'Sign in failed: no user returned', user: null, session: null, mfaRequired: false, mfaFactors: [] };
  }

  // Check for MFA factors in the successful response (MFA is optional in Supabase config)
  const factors = (data.user as any)?.factors ?? [];
  const verifiedFactors = factors.filter((f: any) => f.status === 'verified');

  if (verifiedFactors.length > 0) {
    // User has MFA enabled — require TOTP challenge even though password succeeded
    return {
      error: null,
      user: null,
      session: null,
      mfaRequired: true,
      mfaFactors: verifiedFactors.map((f: any) => ({ id: f.id, factorType: f.factor_type })),
    };
  }

  const user: User = {
    id: data.user.id,
    name: data.user.user_metadata?.name ?? email.split('@')[0],
    email: data.user.email ?? email,
    role: data.user.user_metadata?.role ?? 'employee',
    department: data.user.user_metadata?.department,
    mfaEnabled: false,
  };

  return {
    error: null,
    user,
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at ?? Date.now() + 3600000,
        }
      : null,
    mfaRequired: false,
    mfaFactors: [],
  };
}

// ─── Sign Out ───

export async function signOut(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.auth.signOut();
  return error?.message ?? null;
}

// ─── Resend Confirmation Email ───

export async function resendConfirmationEmail(email: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase is not configured.';
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return error?.message ?? null;
}

// ─── Get Current Session ───

export async function getCurrentSession(): Promise<{
  user: User | null;
  session: { accessToken: string; refreshToken: string; expiresAt: number } | null;
}> {
  if (!isSupabaseConfigured()) {
    return { user: null, session: null };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { user: null, session: null };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { user: null, session: null };
  }

  const user: User = {
    id: userData.user.id,
    name: userData.user.user_metadata?.name ?? userData.user.email?.split('@')[0] ?? 'User',
    email: userData.user.email ?? '',
    role: userData.user.user_metadata?.role ?? 'employee',
    department: userData.user.user_metadata?.department,
    mfaEnabled: (userData.user.factors ?? []).some((f: any) => f.status === 'verified'),
  };

  return {
    user,
    session: {
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      expiresAt: sessionData.session.expires_at ?? Date.now() + 3600000,
    },
  };
}

// ─── Update User Role (Admin only) ───

export async function updateUserRole(userId: string, role: UserRole): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase is not configured.';
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  return error?.message ?? null;
}

// ─── Update Profile ───

export async function updateProfile(updates: {
  name?: string;
  department?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase is not configured.';

  const metadata: Record<string, string> = {};
  if (updates.name !== undefined) metadata.name = updates.name;
  if (updates.department !== undefined) metadata.department = updates.department;

  const { error } = await supabase.auth.updateUser({
    data: metadata,
  });

  return error?.message ?? null;
}

// ─── On Auth State Change ───

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}
