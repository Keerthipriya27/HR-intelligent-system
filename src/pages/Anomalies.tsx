import { useState } from 'react';
import { AlertTriangle, TrendingUp, Users, Layers, CheckCircle2, Plus, X, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSeverityColor, getSeverityBorder, cn } from '../lib/utils';
import type { Anomaly } from '../lib/types';
import { EMPLOYEES } from '../lib/mock-data';
import { format } from 'date-fns';

const TYPE_ICONS: Record<Anomaly['type'], typeof AlertTriangle> = {
  budget_overrun: TrendingUp,
  unattributed_cluster: Layers,
  employee_overload: Users,
  new_project_detected: Plus,
  recurring_no_agenda: Clock,
};

const TYPE_LABELS: Record<Anomaly['type'], string> = {
  budget_overrun: 'Budget Overrun',
  unattributed_cluster: 'Unattributed Cluster',
  employee_overload: 'Employee Overload',
  new_project_detected: 'New Project Detected',
  recurring_no_agenda: 'No-Agenda Meeting',
};

export function Anomalies() {
  const { anomalies, resolveAnomaly, addProject, projects } = useApp();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const active = anomalies.filter(a => !a.resolved);
  const resolved = anomalies.filter(a => a.resolved);
  const critical = active.filter(a => a.severity === 'critical').length;
  const warnings = active.filter(a => a.severity === 'warning').length;
  const info = active.filter(a => a.severity === 'info').length;

  const displayed = (filter === 'all' ? active : active.filter(a => a.severity === filter))
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

  const handleCreateProject = (anomaly: Anomaly) => {
    const titleMatch = anomaly.title.match(/"([^"]+)"/);
    const name = titleMatch?.[1] ?? 'New Project';
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    addProject({
      id: `p-${Date.now()}`,
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      tags: name.toLowerCase().split(' '),
      autoDetected: true,
      monthlyBudget: 20000,
    });
    resolveAnomaly(anomaly.id);
  };

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Critical Issues', value: critical, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200/60', icon: AlertTriangle, iconColor: 'text-rose-600' },
          { label: 'Warnings', value: warnings, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60', icon: AlertTriangle, iconColor: 'text-amber-500' },
          { label: 'Info Alerts', value: info, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200/60', icon: AlertTriangle, iconColor: 'text-sky-500' },
        ].map(({ label, value, color, bg, border, icon: Icon, iconColor }) => (
          <div key={label} className={cn('rounded-2xl border p-5 card-3d shadow-md', bg, border)}>
            <div className="flex items-center justify-between mb-3">
              <Icon className={cn('w-5 h-5', iconColor)} />
              <span className={cn('text-3xl font-bold', color)}>{value}</span>
            </div>
            <p className={cn('text-sm font-medium', color)}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
          {(['all', 'critical', 'warning', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {f === 'all' ? `All (${active.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${active.filter(a => a.severity === f).length})`}
            </button>
          ))}
        </div>
        {resolved.length > 0 && (
          <span className="text-xs text-slate-400 ml-auto">{resolved.length} resolved</span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Anomaly cards */}
        <div className="xl:col-span-2 space-y-3">
          {displayed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-12 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="text-base font-semibold text-slate-700">All clear!</p>
              <p className="text-sm text-slate-400">No active anomalies in this category.</p>
            </div>
          ) : (
            displayed.map(anomaly => {
              const AnomalyIcon = TYPE_ICONS[anomaly.type];
              const severityClasses = getSeverityColor(anomaly.severity);
              const borderClass = getSeverityBorder(anomaly.severity);
              const relatedEmployee = anomaly.relatedEmployeeId ? EMPLOYEES.find(e => e.id === anomaly.relatedEmployeeId) : null;
              const relatedProject = anomaly.relatedProjectId ? projects.find(p => p.id === anomaly.relatedProjectId) : null;

              return (
                <div key={anomaly.id} className={cn(
                  'bg-white rounded-2xl border border-l-4 shadow-md p-5 card-3d transition-all',
                  borderClass,
                  'border-slate-200/60'
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', severityClasses)}>
                      <AnomalyIcon className="w-4.5 h-4.5" size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{anomaly.title}</p>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0', severityClasses)}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3 leading-relaxed">{anomaly.description}</p>

                      {/* Related entity */}
                      {(relatedProject || relatedEmployee) && (
                        <div className="flex items-center gap-2 mb-3">
                          {relatedProject && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: relatedProject.color }} />
                              {relatedProject.name}
                            </div>
                          )}
                          {relatedEmployee && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white">
                                {relatedEmployee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {relatedEmployee.name}
                            </div>
                          )}
                          <span className="text-[11px] text-slate-400">{TYPE_LABELS[anomaly.type]}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {anomaly.type === 'new_project_detected' && (
                          <button
                            onClick={() => handleCreateProject(anomaly)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all hover:shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5" /> Create Project
                          </button>
                        )}
                        <button
                          onClick={() => resolveAnomaly(anomaly.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Alert Timeline</h2>
          <div className="space-y-3">
            {anomalies
              .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
              .slice(0, 12)
              .map(anomaly => {
                const borderClass = getSeverityBorder(anomaly.severity);
                return (
                  <div key={anomaly.id} className={cn(
                    'flex items-start gap-3 pl-3 border-l-2 py-1',
                    borderClass
                  )}>
                    <div>
                      <p className={cn(
                        'text-xs font-semibold leading-tight',
                        anomaly.resolved ? 'text-slate-400 line-through' : 'text-slate-700'
                      )}>
                        {anomaly.title.length > 40 ? anomaly.title.slice(0, 40) + '…' : anomaly.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {format(anomaly.detectedAt, 'MMM d, h:mm a')}
                        {anomaly.resolved && ' · resolved'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
