import { Menu, Bell, ChevronDown, Shield, Eye, UserCog } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../lib/types';
import { cn, getInitials } from '../../lib/utils';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700', icon: Shield },
  finance: { label: 'Finance', color: 'bg-emerald-100 text-emerald-700', icon: Shield },
  manager: { label: 'Manager', color: 'bg-sky-100 text-sky-700', icon: UserCog },
  employee: { label: 'Employee', color: 'bg-slate-100 text-slate-600', icon: Eye },
};

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'HR cost intelligence overview' },
  '/attribution': { title: 'AI Attribution', subtitle: 'Meeting-to-project attribution engine' },
  '/employees': { title: 'Employees', subtitle: 'Team utilization & cost analysis' },
  '/anomalies': { title: 'Anomalies', subtitle: 'Detected risks & cost alerts' },
  '/settings': { title: 'Settings', subtitle: 'Configuration & integrations' },
};

export function Topbar() {
  const { currentUser, setRole, setSidebarOpen, sidebarOpen, anomalies } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'CostIQ', subtitle: '' };
  const roleConfig = ROLE_CONFIG[currentUser.role];
  const RoleIcon = roleConfig.icon;
  const unresolved = anomalies.filter(a => !a.resolved).length;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3.5 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm shadow-slate-100/50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 leading-tight">{pageInfo.title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Role switcher */}
      <div className="relative">
        <button
          onClick={() => setRoleOpen(v => !v)}
          className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', roleConfig.color, 'border-current/20 hover:shadow-sm')}
        >
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{roleConfig.label}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {roleOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden z-50">
            <div className="p-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-2 py-1">Switch Role (Demo)</p>
              {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={role}
                    onClick={() => { setRole(role); setRoleOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                      currentUser.role === role ? cfg.color : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" aria-label="Notifications">
        <Bell className="w-4.5 h-4.5" size={18} />
        {unresolved > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* User avatar - clickable to profile */}
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-200 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-violet-200 transition-all">
          {getInitials(currentUser.name)}
        </div>
        <div className="hidden md:block min-w-0 text-left">
          <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-28 group-hover:text-violet-700 transition-colors">{currentUser.name}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-28">{currentUser.email}</p>
        </div>
      </button>
    </header>
  );
}
