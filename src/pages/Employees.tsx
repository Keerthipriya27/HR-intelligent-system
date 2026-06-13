import { useState } from 'react';
import { Users, BarChart3, X, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EMPLOYEES, MEETINGS } from '../lib/mock-data';
import { useApp } from '../context/AppContext';
import { formatCurrency, getInitials, computeEmployeeUtilization, getEmployeeMonthlyCost, cn } from '../lib/utils';
import type { Employee } from '../lib/types';

function UtilizationBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500';
  const textColor = pct > 90 ? 'text-rose-600' : pct > 75 ? 'text-amber-600' : 'text-emerald-600';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-8 text-right', textColor)}>{pct}%</span>
    </div>
  );
}

function HeatmapCalendar({ employeeId }: { employeeId: string }) {
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const count = MEETINGS.filter(m =>
      m.attendeeIds.includes(employeeId) &&
      m.startTime.toDateString() === d.toDateString()
    ).length;
    return { date: d, count };
  });

  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wide">Meeting Activity (28 days)</p>
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-400 pb-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const intensity = day.count / maxCount;
          const bg = day.count === 0 ? 'bg-slate-100' :
            intensity < 0.33 ? 'bg-violet-200' :
            intensity < 0.67 ? 'bg-violet-400' : 'bg-violet-600';
          return (
            <div
              key={i}
              title={`${day.date.toLocaleDateString()}: ${day.count} meetings`}
              className={cn('aspect-square rounded-sm cursor-default transition-all hover:scale-110', bg)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function Employees() {
  const { currentUser, projects, attributions } = useApp();
  const [selected, setSelected] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');

  const filteredEmployees = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const getEmployeeProjectBreakdown = (empId: string) => {
    return projects.map(p => {
      const projectMeetings = MEETINGS.filter(m =>
        m.attendeeIds.includes(empId) &&
        attributions.get(m.id)?.projectId === p.id
      );
      const hours = projectMeetings.reduce((s, m) => s + m.durationMinutes / 60, 0);
      return { name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name, hours: Math.round(hours * 10) / 10, color: p.color };
    }).filter(p => p.hours > 0);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-48 bg-white rounded-xl border border-slate-200 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employees or departments…"
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">● Healthy ≤75%</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700">● At Risk 76–90%</span>
          <span className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700">● Overloaded &gt;90%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Team Members</h2>
            <p className="text-xs text-slate-400">{filteredEmployees.length} employees</p>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredEmployees.map(emp => {
              const utilization = computeEmployeeUtilization(emp.id, MEETINGS);
              const monthlyCost = getEmployeeMonthlyCost(emp.id);
              const empProjects = projects.filter(p =>
                MEETINGS.some(m => m.attendeeIds.includes(emp.id) && attributions.get(m.id)?.projectId === p.id)
              );
              const isSelected = selected?.id === emp.id;

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelected(isSelected ? null : emp)}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-violet-50/40',
                    isSelected && 'bg-violet-50/60'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                    {getInitials(emp.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{emp.designation}</span>
                    </div>
                    <p className="text-xs text-slate-400">{emp.department}</p>
                  </div>

                  {/* Projects */}
                  <div className="hidden sm:flex gap-1 flex-wrap max-w-40">
                    {empProjects.slice(0, 3).map(p => (
                      <span key={p.id} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: p.color + '20', color: p.color }}>
                        {p.name.split(' ')[0]}
                      </span>
                    ))}
                    {empProjects.length > 3 && <span className="text-[10px] text-slate-400">+{empProjects.length - 3}</span>}
                  </div>

                  {/* Cost */}
                  <div className="text-right flex-shrink-0 hidden md:block">
                    {currentUser.role !== 'employee' ? (
                      <>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(monthlyCost)}</p>
                        <p className="text-xs text-slate-400">monthly</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">–</p>
                    )}
                  </div>

                  {/* Utilization */}
                  <div className="w-28 flex-shrink-0">
                    <UtilizationBar value={utilization} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drill-down panel */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(selected.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{selected.name}</p>
                    <p className="text-xs text-slate-400">{selected.department} · {selected.designation}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Meeting Hours', value: `${Math.round(MEETINGS.filter(m => m.attendeeIds.includes(selected.id)).reduce((s, m) => s + m.durationMinutes / 60, 0))}h` },
                    { label: 'Utilization', value: `${Math.round(computeEmployeeUtilization(selected.id, MEETINGS) * 100)}%` },
                    { label: 'Meetings', value: `${MEETINGS.filter(m => m.attendeeIds.includes(selected.id)).length}` },
                    { label: 'Monthly Cost', value: currentUser.role !== 'employee' ? formatCurrency(getEmployeeMonthlyCost(selected.id)) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-lg font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Project breakdown chart */}
                {(() => {
                  const breakdown = getEmployeeProjectBreakdown(selected.id);
                  return breakdown.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5" /> Time by Project
                      </p>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={breakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                          <Tooltip formatter={(v) => [`${v as number}h`, 'Hours']} />
                          <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={16}>
                            {breakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null;
                })()}

                {/* Heatmap */}
                <div className="pt-2 border-t border-slate-100">
                  <HeatmapCalendar employeeId={selected.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3 min-h-64">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Select an employee to view their meeting activity, project breakdown, and cost data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
