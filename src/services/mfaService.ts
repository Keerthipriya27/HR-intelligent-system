import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MFAEnrollment } from '../lib/types';

// ─── Enroll in TOTP MFA ───

export interface EnrollResult {
  error: string | null;
  enrollment: MFAEnrollment | null;
}

export async function enrollTOTP(): Promise<EnrollResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', enrollment: null };
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });

  if (error) {
    return { error: error.message, enrollment: null };
  }

  if (!data) {
    return { error: 'Enrollment failed: no data returned', enrollment: null };
  }

  return {
    error: null,
    enrollment: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    },
  };
}

// ─── Verify TOTP Enrollment ───

export interface VerifyEnrollmentResult {
  error: string | null;
  verified: boolean;
}

export async function verifyEnrollment(
  factorId: string,
  code: string
): Promise<VerifyEnrollmentResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', verified: false };
  }

  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) {
    return { error: error.message, verified: false };
  }

  if (!data) {
    return { error: 'Challenge failed: no data', verified: false };
  }

  const verifyResult = await supabase.auth.mfa.verify({
    factorId,
    challengeId: data.id,
    code,
  });

  if (verifyResult.error) {
    return { error: verifyResult.error.message, verified: false };
  }

  return { error: null, verified: true };
}

// ─── Challenge TOTP (for login) ───

export interface ChallengeResult {
  error: string | null;
  challengeId: string | null;
}

export async function challengeTOTP(factorId: string): Promise<ChallengeResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', challengeId: null };
  }

  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) {
    return { error: error.message, challengeId: null };
  }

  return { error: null, challengeId: data.id };
}

// ─── Verify TOTP Challenge (for login) ───

export interface VerifyChallengeResult {
  error: string | null;
  verified: boolean;
}

export async function verifyChallenge(
  factorId: string,
  challengeId: string,
  code: string
): Promise<VerifyChallengeResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', verified: false };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    return { error: error.message, verified: false };
  }

  return { error: null, verified: true };
}

// ─── Get MFA Factors ───

export async function getMFAFactors(): Promise<{
  error: string | null;
  factors: Array<{ id: string; factorType: string; status: string }>;
  isMFAEnabled: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.', factors: [], isMFAEnabled: false };
  }

  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    return { error: error.message, factors: [], isMFAEnabled: false };
  }

  const allFactors = data?.all ?? [];
  const verifiedFactors = allFactors.filter((f: any) => f.status === 'verified');

  return {
    error: null,
    factors: allFactors.map((f: any) => ({
      id: f.id,
      factorType: f.factor_type,
      status: f.status,
    })),
    isMFAEnabled: verifiedFactors.length > 0,
  };
}

// ─── Unenroll MFA ───

export async function unenrollMFA(factorId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return 'Supabase is not configured.';

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return error?.message ?? null;
}
