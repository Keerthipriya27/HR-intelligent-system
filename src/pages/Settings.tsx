import { useState } from 'react';
import {
  Settings2, Calendar, Shield, DollarSign, Layers,
  CheckCircle2, RefreshCw, Plus, Trash2, Edit2, Eye, EyeOff, Lock,
  ChevronRight, Zap, Database, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SALARY_BANDS } from '../lib/mock-data';
import type { SalaryBand } from '../lib/types';
import { cn } from '../lib/utils';

const INTEGRATION_CARDS = [
  {
    id: 'google',
    name: 'Google Calendar',
    logo: '📅',
    status: 'connected',
    lastSync: '2 minutes ago',
    color: 'emerald',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    logo: '📧',
    status: 'connected',
    lastSync: '5 minutes ago',
    color: 'sky',
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    logo: '💬',
    status: 'disconnected',
    lastSync: null,
    color: 'amber',
  },
];

type Section = 'integrations' | 'salary' | 'privacy' | 'projects' | 'notifications';

export function Settings() {
  const { currentUser, projects, addProject } = useApp();
  const [activeSection, setActiveSection] = useState<Section>('integrations');
  const [salaryBands, setSalaryBands] = useState<SalaryBand[]>([...SALARY_BANDS]);
  const [editingBand, setEditingBand] = useState<string | null>(null);
  const [privacyToggles, setPrivacyToggles] = useState({
    maskIndividualSalaries: true,
    aggregateOnlyExport: true,
    managerVisibility: false,
    auditLog: true,
    salaryBandVisibility: false,
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [syncLoading, setSyncLoading] = useState<string | null>(null);
  const [notifToggles, setNotifToggles] = useState({
    budgetAlerts: true,
    weeklyReport: true,
    attributionReview: true,
    anomalies: true,
  });

  const isAdmin = currentUser.role === 'admin';

  const SECTIONS = [
    { id: 'integrations' as Section, label: 'Calendar Integrations', icon: Calendar },
    { id: 'salary' as Section, label: 'Salary Bands', icon: DollarSign, adminOnly: true },
    { id: 'privacy' as Section, label: 'Privacy & Access', icon: Shield },
    { id: 'projects' as Section, label: 'Project Taxonomy', icon: Layers },
    { id: 'notifications' as Section, label: 'Notifications', icon: Bell },
  ];

  const handleSync = async (id: string) => {
    setSyncLoading(id);
    await new Promise(r => setTimeout(r, 1500));
    setSyncLoading(null);
  };

  const handleSalaryUpdate = (band: string, newRate: number) => {
    setSalaryBands(prev => prev.map(b => b.band === band ? { ...b, hourlyRate: newRate } : b));
    setEditingBand(null);
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    addProject({
      id: `p-${Date.now()}`,
      name: newProjectName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      tags: newProjectName.toLowerCase().split(' '),
      monthlyBudget: 30000,
    });
    setNewProjectName('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Settings2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-400">Configure integrations, salary bands, and access controls</p>
        </div>
        <div className={cn(
          'ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold',
          isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
        )}>
          {isAdmin ? <Zap className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {isAdmin ? 'Admin Access' : 'Limited Access'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <nav className="md:col-span-1 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon, adminOnly }) => {
            const locked = adminOnly && !isAdmin;
            return (
              <button
                key={id}
                onClick={() => !locked && setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeSection === id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : locked
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {locked && <Lock className="w-3 h-3" />}
                {!locked && <ChevronRight className="w-3 h-3 opacity-40" />}
              </button>
            );
          })}
        </nav>

        {/* Content panel */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
          {/* INTEGRATIONS */}
          {activeSection === 'integrations' && (
            <div className="p-6 space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold text-slate-900">Calendar Integrations</h3>
                <p className="text-sm text-slate-400">Sync your calendar data for automatic meeting tracking</p>
              </div>
              {INTEGRATION_CARDS.map(card => (
                <div key={card.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50">{card.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{card.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        card.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'
                      )} />
                      <span className={cn(
                        'text-xs font-medium',
                        card.status === 'connected' ? 'text-emerald-600' : 'text-slate-400'
                      )}>
                        {card.status === 'connected' ? `Connected · Last sync ${card.lastSync}` : 'Not connected'}
                      </span>
                    </div>
                  </div>
                  {card.status === 'connected' ? (
                    <button
                      onClick={() => handleSync(card.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className={cn('w-3.5 h-3.5', syncLoading === card.id && 'animate-spin')} />
                      {syncLoading === card.id ? 'Syncing…' : 'Sync Now'}
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Connect
                    </button>
                  )}
                </div>
              ))}

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Sync Settings</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Configure how often meetings are fetched from your calendars</p>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600">Sync Frequency</label>
                  <select className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white focus:border-violet-400 outline-none">
                    <option>Every 15 minutes</option>
                    <option>Every hour</option>
                    <option>Every 4 hours</option>
                    <option>Manual only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SALARY BANDS */}
          {activeSection === 'salary' && (
            <div className="p-6 space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold text-slate-900">Salary Bands</h3>
                <p className="text-sm text-slate-400">Configure hourly rates used for meeting cost calculations</p>
              </div>

              {!isAdmin && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">Salary band configuration is restricted to Admin role only.</p>
                </div>
              )}

              <div className="space-y-2">
                {salaryBands.map(band => (
                  <div key={band.band} className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all',
                    editingBand === band.band ? 'border-violet-300 bg-violet-50' : 'border-slate-100 hover:border-slate-200'
                  )}>
                    <div className="w-12 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{band.band}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{band.label}</p>
                    </div>
                    {editingBand === band.band && isAdmin ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">$</span>
                        <input
                          type="number"
                          defaultValue={band.hourlyRate}
                          className="w-20 text-sm px-2 py-1 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200"
                          onBlur={e => handleSalaryUpdate(band.band, Number(e.target.value))}
                          onKeyDown={e => e.key === 'Enter' && handleSalaryUpdate(band.band, Number((e.target as HTMLInputElement).value))}
                          autoFocus
                        />
                        <span className="text-sm text-slate-400">/hr</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900">
                          {isAdmin ? `$${band.hourlyRate}/hr` : '●●●/hr'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingBand(band.band)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200/50 flex items-start gap-3">
                <Zap className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-700 mb-1">How rates are used</p>
                  <p className="text-xs text-violet-600/80">
                    These hourly rates are multiplied by meeting duration and attendee count to calculate real-time HR cost per meeting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeSection === 'privacy' && (
            <div className="p-6 space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold text-slate-900">Privacy & Access Controls</h3>
                <p className="text-sm text-slate-400">Control how salary and cost data is shared across roles</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'maskIndividualSalaries', label: 'Mask Individual Salaries', description: 'Viewers see team-level costs, not individual salary figures', adminOnly: true },
                  { key: 'aggregateOnlyExport', label: 'Aggregate-Only Exports', description: 'CSV/PDF exports show project totals only, not per-employee data', adminOnly: true },
                  { key: 'managerVisibility', label: 'Manager Sees Team Data', description: 'Managers can view individual cost data for their direct reports', adminOnly: true },
                  { key: 'auditLog', label: 'Enable Audit Log', description: 'Track all attribution changes, role switches, and data exports', adminOnly: false },
                  { key: 'salaryBandVisibility', label: 'Hide Salary Bands from Viewers', description: 'Salary band rates are visible only to Admin and Manager roles', adminOnly: true },
                ].map(({ key, label, description, adminOnly }) => {
                  const locked = adminOnly && !isAdmin;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors',
                        locked ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-slate-200'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{label}</p>
                          {locked && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                      </div>
                      <button
                        disabled={locked}
                        onClick={() => !locked && setPrivacyToggles(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className={cn(
                          'relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5',
                          privacyToggles[key as keyof typeof privacyToggles] && !locked
                            ? 'bg-violet-600' : locked ? 'bg-slate-200' : 'bg-slate-200'
                        )}
                      >
                        <div className={cn(
                          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                          privacyToggles[key as keyof typeof privacyToggles] ? 'translate-x-5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-start gap-3">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1">RBAC is enforced</p>
                  <p className="text-xs text-emerald-600/80">
                    Role-based access control is enforced at the component level. Salary data is never sent to Viewer sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeSection === 'projects' && (
            <div className="p-6 space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold text-slate-900">Project Taxonomy</h3>
                <p className="text-sm text-slate-400">Manage projects used for AI attribution</p>
              </div>

              {/* Add project */}
              {isAdmin && (
                <div className="flex gap-2">
                  <input
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                    placeholder="New project name…"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
                  />
                  <button
                    onClick={handleAddProject}
                    disabled={!newProjectName.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group">
                    <div
                      className="w-8 h-8 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: project.color + '20', border: `2px solid ${project.color}40` }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{project.name}</p>
                        {project.autoDetected && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">AI Detected</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      {project.monthlyBudget && (
                        <p className="text-sm font-semibold text-slate-700">${(project.monthlyBudget / 1000).toFixed(0)}k</p>
                      )}
                      <p className="text-xs text-slate-400">monthly budget</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="p-6 space-y-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold text-slate-900">Notification Preferences</h3>
                <p className="text-sm text-slate-400">Choose what alerts you receive and how</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'budgetAlerts', label: 'Budget Threshold Alerts', description: 'Notify when a project exceeds 85% of monthly HR budget' },
                  { key: 'weeklyReport', label: 'Weekly Summary Report', description: 'Receive a weekly digest of HR spend across all projects' },
                  { key: 'attributionReview', label: 'Attribution Review Reminders', description: 'Alert when 10+ meetings are pending human review' },
                  { key: 'anomalies', label: 'Anomaly Detections', description: 'In-app alerts for employee overload, budget overruns, and new projects' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                    </div>
                    <button
                      onClick={() => setNotifToggles(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={cn(
                        'relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5',
                        notifToggles[key as keyof typeof notifToggles] ? 'bg-violet-600' : 'bg-slate-200'
                      )}
                    >
                      <div className={cn(
                        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        notifToggles[key as keyof typeof notifToggles] ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">In-App</p>
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enabled</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Email Digest</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Configure SMTP</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
