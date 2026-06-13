import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── MFA Verification Component ───

interface MFAVerificationProps {
  onVerify: (code: string) => Promise<{ error: string | null }>;
  onCancel?: () => void;
  mode?: 'login' | 'change';
  factorId?: string;
}

export function MFAVerification({ onVerify, onCancel, mode = 'login' }: MFAVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6 || isVerifying) return;

    setIsVerifying(true);
    setError('');

    const result = await onVerify(code);

    if (result.error) {
      setError(result.error);
      setIsVerifying(false);
      return;
    }

    setSuccess(true);
    setIsVerifying(false);
  };

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4 py-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </motion.div>
        <p className="text-base font-semibold text-slate-800">Verified successfully</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-200">
          <Smartphone className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          {mode === 'login' ? 'Two-Factor Authentication' : 'Verify Your Identity'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={e => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="000000"
            className="w-44 text-center text-3xl font-bold tracking-[0.4em] px-4 py-3.5 rounded-2xl border-2 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            autoFocus
          />
          {/* Animated glow */}
          <motion.div
            className="absolute -inset-1 rounded-2xl border-2 border-violet-300/30 pointer-events-none"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-rose-500 text-center flex items-center justify-center gap-1.5"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleVerify}
          disabled={code.length < 6 || isVerifying}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
            code.length >= 6 && !isVerifying
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-200'
              : 'bg-slate-100 text-slate-400'
          )}
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            'Verify'
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
        <KeyRound className="w-3.5 h-3.5" />
        <span>Using TOTP — Google Authenticator, Microsoft Authenticator, or Authy</span>
      </div>
    </motion.div>
  );
}
