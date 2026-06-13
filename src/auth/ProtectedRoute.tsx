import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from './useAuth';
import { BusinessBackground } from '../components/3d/BusinessBackground';
import type { UserRole } from '../lib/types';
import { ROUTE_PERMISSIONS } from '../lib/types';

// ─── Loading Screen ───

function AuthLoadingScreen() {
  return (
    <div className="page-3d flex items-center justify-center relative overflow-hidden">
      <BusinessBackground variant="auth" density="low" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-xl shadow-violet-200 ai-glow">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-800">Restoring your session</p>
          <p className="text-sm text-slate-400 mt-1">Secure authentication handshake</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Unauthorized Screen ───

function UnauthorizedScreen() {
  return (
    <div className="page-3d flex items-center justify-center relative overflow-hidden">
      <BusinessBackground variant="auth" density="low" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 glass-strong rounded-3xl p-10 max-w-md mx-4 text-center auth-card-3d"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-500 mb-6">
          You don't have the required permissions to access this area. Please contact your administrator.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
        >
          Back to Dashboard
        </a>
      </motion.div>
    </div>
  );
}

// ─── Protected Route ───

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isUnauthenticated, isLoading, user, status } = useAuth();
  const location = useLocation();

  // Determine required roles from route config if not explicitly provided
  const roles = requiredRoles ?? ROUTE_PERMISSIONS[location.pathname];

  // Loading state
  if (isLoading || status === 'loading') {
    return <AuthLoadingScreen />;
  }

  // MFA required - redirect to verify
  if (status === 'mfa_required') {
    return <Navigate to="/verify-totp" state={{ from: location }} replace />;
  }

  // Not authenticated - redirect to login
  if (isUnauthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <UnauthorizedScreen />;
  }

  return <>{children}</>;
}
