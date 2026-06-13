import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Smartphone, Calendar, CheckCircle2, AlertCircle, KeyRound, Pencil, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useApp } from '../context/AppContext';
import { cn, getInitials } from '../lib/utils';
import { MEETINGS, EMPLOYEES } from '../lib/mock-data';
import { updateProfile } from '../services/authService';

export function Profile() {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { currentUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const displayUser = isAuthenticated && authUser ? authUser : currentUser;
  const initials = getInitials(displayUser.name);
  const userMeetings = MEETINGS.filter(m => m.attendeeIds.some(id => {
    const emp = EMPLOYEES.find(e => e.id === id);
    return emp?.email === displayUser.email;
  }));

  const startEditing = () => {
    setEditName(displayUser.name);
    setEditDepartment(displayUser.department || '');
    setSaveError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError('');
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    setSaveError('');

    try {
      const error = await updateProfile({ name: editName.trim(), department: editDepartment.trim() });
      if (error) {
        setSaveError(error);
      } else {
        // Reload the page to refresh auth user metadata from Supabase
        // This triggers onAuthStateChange which re-syncs the user
        window.location.reload();
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl text-center relative"
      >
        <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4 text-2xl font-bold backdrop-blur-sm border-2 border-white/30 shadow-lg">
          {initials}
        </div>
        <h1 className="text-2xl font-bold">{displayUser.name}</h1>
        <p className="text-sm text-white/70 mt-1">{displayUser.email}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            displayUser.role === 'admin' && 'bg-violet-200 text-violet-900',
            displayUser.role === 'finance' && 'bg-emerald-200 text-emerald-900',
            displayUser.role === 'manager' && 'bg-sky-200 text-sky-900',
            displayUser.role === 'employee' && 'bg-slate-200 text-slate-900',
          )}>
            {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
          </span>
          {displayUser.department && (
            <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-medium backdrop-blur-sm">
              {displayUser.department}
            </span>
          )}
        </div>
      </motion.div>

      {/* Account Details Card (with Edit Mode) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-500" />
            Account Details
          </h2>
          {!editing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-violet-600 text-xs font-semibold hover:bg-violet-50 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          ) : (
            <button
              onClick={cancelEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Department</label>
              <input
                type="text"
                value={editDepartment}
                onChange={e => setEditDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
                placeholder="e.g. Engineering, HR, Finance"
              />
            </div>

            {saveError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-200/50 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {saveError}
              </motion.p>
            )}

            <button
              onClick={saveProfile}
              disabled={!editName.trim() || saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-200/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-900">{displayUser.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-900">{displayUser.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Role</span>
              <span className={cn(
                'font-semibold',
                displayUser.role === 'admin' && 'text-violet-600',
                displayUser.role === 'finance' && 'text-emerald-600',
                displayUser.role === 'manager' && 'text-sky-600',
                displayUser.role === 'employee' && 'text-slate-600',
              )}>
                {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-900">{displayUser.department || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Account ID</span>
              <span className="font-mono text-xs text-slate-400">{displayUser.id}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Security Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-500" />
          Security
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">MFA Status</span>
            <span className={cn(
              'flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold',
              displayUser.mfaEnabled
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            )}>
              {displayUser.mfaEnabled ? (
                <><CheckCircle2 className="w-3 h-3" /> Enabled</>
              ) : (
                <><AlertCircle className="w-3 h-3" /> Not enabled</>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Auth Method</span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <KeyRound className="w-3 h-3" /> Email + Password
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Session</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">2FA Type</span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Smartphone className="w-3 h-3" /> TOTP
            </span>
          </div>
        </div>
      </motion.div>

      {/* Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5"
      >
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-violet-500" />
          Activity Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-violet-50">
            <p className="text-2xl font-bold text-violet-700">{userMeetings.length}</p>
            <p className="text-xs text-violet-500 mt-0.5">Meetings</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-sky-50">
            <p className="text-2xl font-bold text-sky-700">
              {userMeetings.reduce((s, m) => s + m.durationMinutes, 0)}
            </p>
            <p className="text-xs text-sky-500 mt-0.5">Minutes</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-50">
            <p className="text-2xl font-bold text-emerald-700">{displayUser.department || 'N/A'}</p>
            <p className="text-xs text-emerald-500 mt-0.5">Department</p>
          </div>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          onClick={logout}
          className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
