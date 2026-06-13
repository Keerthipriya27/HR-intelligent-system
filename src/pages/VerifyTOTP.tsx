import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { MFAVerification } from '../auth/MFAVerification';
import { BusinessBackground } from '../components/3d/BusinessBackground';

export function VerifyTOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, status, isLoading, completeMfaLogin, pendingFactorId } = useAuth();
  const [factorId] = useState<string>(pendingFactorId ?? '');

  useEffect(() => {
    if (!isLoading && status !== 'mfa_required' && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    if (!isLoading && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isLoading, status, isAuthenticated, navigate, location]);

  const handleVerify = async (code: string) => {
    if (!factorId) {
      return { error: 'No MFA factor configured. Please sign in again.' };
    }
    return await completeMfaLogin(factorId, code);
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="page-3d flex items-center justify-center">
        <BusinessBackground variant="auth" density="low" />
        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  if (status !== 'mfa_required' && !isAuthenticated) {
    return null;
  }

  return (
    <div className="page-3d flex items-center justify-center relative overflow-hidden">
      <BusinessBackground variant="auth" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center shadow-xl shadow-violet-300/40 orb-pulse">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">CostIQ</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Two-Factor Authentication Required</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-strong rounded-3xl p-8 auth-card-3d auth-card-glow"
        >
          <MFAVerification factorId={factorId} onVerify={handleVerify} onCancel={handleBackToLogin} mode="login" />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Secured with Supabase Auth + TOTP Multi-Factor Authentication
        </motion.p>
      </div>
    </div>
  );
}
