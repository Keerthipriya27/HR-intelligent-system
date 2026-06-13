import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, KeyRound, CheckCircle2, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { enrollTOTP, verifyEnrollment } from '../services/mfaService';
import { useAuth } from './useAuth';

function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div className="relative">
      <div className="w-48 h-48 mx-auto rounded-2xl bg-white p-3 shadow-lg border border-slate-200">
        <img src={value} alt="TOTP QR Code" className="w-full h-full" />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-violet-300"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

interface MFASetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function MFASetup({ onComplete, onSkip }: MFASetupProps) {
  const { completeMfaSetup } = useAuth();
  const [step, setStep] = useState<'intro' | 'scan' | 'verify' | 'success'>('intro');
  const [enrollment, setEnrollment] = useState<{ factorId: string; qrCode: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartEnroll = async () => {
    setIsEnrolling(true);
    setStep('scan');
    const result = await enrollTOTP();
    if (result.error) {
      setVerifyError(result.error);
      setIsEnrolling(false);
      return;
    }
    if (result.enrollment) {
      setEnrollment({ factorId: result.enrollment.factorId, qrCode: result.enrollment.qrCode });
    }
    setIsEnrolling(false);
  };

  const handleVerify = async () => {
    if (!enrollment || verifyCode.length < 6) return;
    setIsVerifying(true);
    setVerifyError('');
    const result = await verifyEnrollment(enrollment.factorId, verifyCode);
    if (result.error) {
      setVerifyError(result.error);
      setIsVerifying(false);
      return;
    }
    if (result.verified) {
      setStep('success');
      await completeMfaSetup();
    } else {
      setVerifyError('Invalid code. Please try again.');
    }
    setIsVerifying(false);
  };

  const handleCopyKey = async () => {
    if (enrollment?.qrCode) {
      try {
        await navigator.clipboard.writeText(enrollment.qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' && (
        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-200">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Set Up Two-Factor Authentication</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Enhance your account security by enabling TOTP-based multi-factor authentication.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-200/50">
              <Smartphone className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">Use an authenticator app</p>
                <p className="text-xs text-slate-500">Google Authenticator, Microsoft Authenticator, Authy, or any TOTP app</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200/50">
              <KeyRound className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">One-time codes</p>
                <p className="text-xs text-slate-500">Each login will require a 6-digit code from your authenticator app</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {onSkip && (
              <button onClick={onSkip} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Skip for now</button>
            )}
            <button onClick={handleStartEnroll} disabled={isEnrolling} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-60">
              {isEnrolling ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</span> : 'Set up now'}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'scan' && (
        <motion.div key="scan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
          {enrollment && (
            <>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Scan QR Code</h3>
                <p className="text-sm text-slate-400">Open your authenticator app and scan this code</p>
              </div>
              <QRCodeDisplay value={enrollment.qrCode} />
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleCopyKey} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy URL</>}
                </button>
              </div>
              <button onClick={() => setStep('verify')} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all">
                I have scanned the code
              </button>
            </>
          )}
        </motion.div>
      )}

      {step === 'verify' && (
        <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Verify Setup</h3>
            <p className="text-sm text-slate-400">Enter the 6-digit code from your authenticator app</p>
          </div>
          <div className="flex justify-center">
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
              value={verifyCode}
              onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="000000"
              className="w-40 text-center text-2xl font-bold tracking-[0.5em] px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
              autoFocus
            />
          </div>
          {verifyError && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-rose-500 text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {verifyError}
            </motion.p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep('scan')} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
            <button onClick={handleVerify} disabled={verifyCode.length < 6 || isVerifying} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-60">
              {isVerifying ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span> : 'Verify & Enable'}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">MFA Enabled</h3>
            <p className="text-sm text-slate-500 mt-1">Two-factor authentication is now active for your account.</p>
          </div>
          <button onClick={onComplete} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all">
            Continue to Dashboard
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
