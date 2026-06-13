import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, Loader2, AlertCircle, ArrowRight, TrendingUp, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { MFASetup } from '../auth/MFASetup';
import { BusinessBackground } from '../components/3d/BusinessBackground';
import { cn } from '../lib/utils';
import type { UserRole } from '../lib/types';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'employee', label: 'Employee', description: 'View your own meeting costs' },
  { value: 'manager', label: 'Manager', description: 'View team data and attribution' },
  { value: 'finance', label: 'Finance', description: 'Full cost analytics and exports' },
  { value: 'admin', label: 'Admin', description: 'Full system access and configuration' },
];

export function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'signup' | 'mfa' | 'confirm_email'>('signup');
  const [signupEmail, setSignupEmail] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && step === 'signup') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, step]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const result = await signup(email.trim(), password, name.trim(), role, department.trim() || undefined);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    if (result.emailConfirmationRequired) {
      setSignupEmail(email.trim());
      setStep('confirm_email');
      setIsSubmitting(false);
      return;
    }
    if (result.needsMfaSetup) {
      setStep('mfa');
    } else {
      navigate('/', { replace: true });
    }
    setIsSubmitting(false);
  };

  const handleMfaComplete = () => navigate('/', { replace: true });
  const handleMfaSkip = () => navigate('/', { replace: true });
  const selectedRole = ROLES.find(r => r.value === role);

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
          {step === 'signup' ? (
            <motion.form onSubmit={handleSignup} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
                <p className="text-sm text-slate-400">Set up your HR intelligence access</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="Jane Smith"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" autoFocus required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="jane@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <button type="button" onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 bg-white/60 text-sm text-left text-slate-700 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all">
                    {selectedRole?.label ?? 'Select role'}
                  </button>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {showRoleDropdown && (
                  <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {ROLES.map(r => (
                      <button key={r.value} type="button" onClick={() => { setRole(r.value); setShowRoleDropdown(false); }}
                        className={cn('w-full text-left px-4 py-2.5 text-sm transition-colors', role === r.value ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-slate-400">{r.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Department (optional)</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Engineering, Product, Finance..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/60 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm" />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-rose-500 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </motion.p>
              )}

              <button type="submit" disabled={!name.trim() || !email.trim() || !password.trim() || isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-xl hover:shadow-violet-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Create Account</>}
              </button>

              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">Sign in</Link>
              </p>
            </motion.form>
          ) : step === 'mfa' ? (
            <motion.div key="mfa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <MFASetup onComplete={handleMfaComplete} onSkip={handleMfaSkip} />
            </motion.div>
          ) : (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  We sent a confirmation link to{' '}
                  <span className="font-semibold text-slate-700">{signupEmail}</span>
                  .<br />Click the link to verify your account, then sign in.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 text-left text-xs text-amber-700 space-y-1.5">
                <p className="font-semibold">📧 Didn't receive the email?</p>
                <p>Check your Spam / Junk folder.</p>
                <p>Make sure you entered the correct email address.</p>
                <p>If using a dev Supabase project,{' '}
                  <span className="font-medium">disable email confirmation</span> in the{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                    className="text-violet-600 underline hover:text-violet-700">
                    Supabase Dashboard → Authentication → Settings
                  </a>.
                </p>
              </div>
              <Link to="/login"
                className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-xl hover:shadow-violet-200/50 transition-all">
                Go to Sign In
              </Link>
              <p className="text-xs text-slate-400">
                Already confirmed?{' '}
                <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">Sign in</Link>
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Secured with Supabase Auth + TOTP Multi-Factor Authentication
        </motion.p>
      </div>
    </div>
  );
}
