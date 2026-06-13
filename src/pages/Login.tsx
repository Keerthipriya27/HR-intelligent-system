import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, TrendingUp, Shield, Send } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { MFAVerification } from '../auth/MFAVerification';
import { BusinessBackground } from '../components/3d/BusinessBackground';
import { cn } from '../lib/utils';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, mfaPending, completeMfaLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'login' | 'totp'>('login');
  const [mfaFactorId, setMfaFactorId] = useState<string>('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    if (result.mfaRequired && result.mfaFactorId) {
      setMfaFactorId(result.mfaFactorId);
      setStep('totp');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
  };

  const handleMfaVerify = async (code: string) => {
    if (!mfaFactorId) return { error: 'No MFA factor configured' };
    return await completeMfaLogin(mfaFactorId, code);
  };

  const handleMfaComplete = () => {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="page-3d flex items-center justify-center relative overflow-hidden">
      <BusinessBackground variant="auth" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
          <p className="text-sm text-slate-400 mt-1">HR Intelligence Platform</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-strong rounded-3xl p-8 auth-card-3d auth-card-glow"
        >
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
                  <p className="text-sm text-slate-400">Sign in to your account</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" autoFocus required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="......"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("text-sm flex items-start gap-2 p-3 rounded-xl border",
                      error.toLowerCase().includes('email not confirmed')
                        ? 'bg-amber-50 border-amber-200/50 text-amber-700'
                        : 'bg-rose-50 border-rose-200/50 text-rose-500')}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">
                      {error.toLowerCase().includes('email not confirmed')
                        ? 'Your email has not been confirmed yet. Please check your inbox (and spam folder) for the confirmation link.'
                        : error}
                    </span>
                  </motion.p>
                )}
                {error && error.toLowerCase().includes('email not confirmed') && !resendSent && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <button
                      type="button"
                      onClick={async () => {
                        setResendingEmail(true);
                        try {
                          const { resendConfirmationEmail } = await import('../services/authService');
                          const err = await resendConfirmationEmail(email);
                          if (err) setError(err);
                          else setResendSent(true);
                        } catch {
                          setError('Failed to resend confirmation email');
                        } finally {
                          setResendingEmail(false);
                        }
                      }}
                      disabled={resendingEmail}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-all disabled:opacity-50"
                    >
                      {resendingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Resend confirmation email
                    </button>
                  </motion.div>
                )}
                {resendSent && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200/50 text-center">
                    ✉️ Confirmation email sent! Check your inbox.
                  </motion.p>
                )}

                <button type="submit" disabled={!email.trim() || !password.trim() || isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-xl hover:shadow-violet-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Sign In</>}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-violet-600 font-semibold hover:text-violet-700">Create one</Link>
                </p>
              </motion.form>
            ) : (
              <motion.div key="totp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <MFAVerification factorId={mfaFactorId} onVerify={handleMfaVerify} onCancel={() => setStep('login')} mode="login" />
                {!mfaPending && (
                  <div className="mt-4">
                    <button onClick={handleMfaComplete} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                      Continue to Dashboard
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Secured with Supabase Auth + TOTP Multi-Factor Authentication
        </motion.p>
      </div>
    </div>
  );
}
