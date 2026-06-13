import { useMemo } from 'react';
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Target, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useApp } from '../context/AppContext';
import { MEETINGS, MEETING_COSTS, getWeeklySpend } from '../lib/mock-data';
import { formatCurrency, cn } from '../lib/utils';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string; color?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export function Forecasting() {
  const { projects } = useApp();

  const projections = useMemo(() => {
    const weeklySpend = getWeeklySpend();
    const totalSpend = weeklySpend.reduce((s, w) => s + w.spend, 0);
    const avgWeekly = totalSpend / weeklySpend.length;
    const projectedMonthly = avgWeekly * 4.33;
    const lastMonth = weeklySpend.slice(-4).reduce((s, w) => s + w.spend, 0);
    const monthBefore = weeklySpend.slice(-8, -4).reduce((s, w) => s + w.spend, 0);
    const momChange = monthBefore > 0 ? ((lastMonth - monthBefore) / monthBefore) * 100 : 0;

    const trendData = weeklySpend.map((w, i) => ({
      ...w,
      projected: i >= weeklySpend.length - 2 ? w.spend * (1 + momChange / 400) : null,
    }));

    for (let i = 0; i < 4; i++) {
      const lastVal = trendData[trendData.length - 1]?.spend ?? avgWeekly;
      trendData.push({
        week: 'W-' + (i + 1),
        spend: 0,
        projected: lastVal * (1 + momChange / 400),
      });
    }

    const monthlyBudget = projects.reduce((s, p) => s + (p.monthlyBudget ?? 0), 0);
    const budgetUtilization = monthlyBudget > 0 ? Math.round((projectedMonthly / monthlyBudget) * 100) : 0;

    return { totalSpend, avgWeekly, projectedMonthly, momChange, trendData, monthlyBudget, budgetUtilization };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Forecasting</h1>
            <p className="text-sm text-white/70">Spend projections and budget planning</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Avg Weekly Spend</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(Math.round(projections.avgWeekly))}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Projected Monthly</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(Math.round(projections.projectedMonthly))}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">MoM Change</p>
            <p className={'text-2xl font-bold mt-0.5 flex items-center gap-1 ' + (projections.momChange >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
              {projections.momChange >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {Math.abs(projections.momChange).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Budget Utilization</p>
            <p className="text-2xl font-bold mt-0.5">{projections.budgetUtilization}%</p>
          </div>
        </div>
      </div>

      {/* Spend Trend + Projection */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Spend Trend & Projection</h2>
            <p className="text-xs text-slate-400 mt-0.5">Actual weekly spend with 4-week forward projection</p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={projections.trendData}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2.5} fill="url(#actualGrad)" dot={{ fill: '#10b981', r: 4 }} name="Actual" />
            <Area type="monotone" dataKey="projected" stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="6 4" fill="url(#projectedGrad)" dot={{ fill: '#7c3aed', r: 4 }} name="Projected" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-violet-500" />
            <span>Projected</span>
          </div>
        </div>
      </div>

      {/* Budget Overview + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Budget Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly budget vs projected spend</p>
            </div>
            <Target className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map(p => {
              const cost = MEETING_COSTS.filter(mc => mc.projectId === p.id).reduce((s, c) => s + c.totalCost, 0);
              const budget = p.monthlyBudget ?? 0;
              const util = budget > 0 ? Math.round((cost / budget) * 100) : 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-medium text-slate-700">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{formatCurrency(Math.round(cost))}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-semibold text-slate-900">{budget > 0 ? formatCurrency(budget) : '--'}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={'h-full rounded-full transition-all ' + (util > 100 ? 'bg-rose-500' : util > 80 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: Math.min(util, 100) + '%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{util}% utilized</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recommendations</h2>
              <p className="text-xs text-slate-400 mt-0.5">AI-driven budget & capacity planning</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-3">
            {[
              { title: 'Increase Data Infrastructure budget', desc: 'Projected to exceed 95% utilization next quarter based on current growth trend.', type: 'warning' },
              { title: 'Mobile App spending is slowing', desc: '30% decrease in meeting costs -- beta launch is complete, consider reallocating resources.', type: 'info' },
              { title: 'AI Pilot at 45% budget utilization', desc: 'Significant room for growth. Consider expanding scope in next sprint planning.', type: 'success' },
              { title: 'Quarterly review: Budget rebalancing', desc: 'Overall ' + projections.budgetUtilization + '% utilization suggests ' + (projections.budgetUtilization > 85 ? 'tight' : 'healthy') + ' margin.', type: 'info' },
            ].map((rec, i) => (
              <div key={i} className={cn(
                'p-3 rounded-xl border',
                rec.type === 'warning' && 'bg-amber-50 border-amber-200/50',
                rec.type === 'info' && 'bg-sky-50 border-sky-200/50',
                rec.type === 'success' && 'bg-emerald-50 border-emerald-200/50',
              )}>
                <p className={cn(
                  'text-sm font-semibold',
                  rec.type === 'warning' && 'text-amber-800',
                  rec.type === 'info' && 'text-sky-800',
                  rec.type === 'success' && 'text-emerald-800',
                )}>{rec.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Cost Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Hourly Cost Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Average cost per meeting hour by project</p>
          </div>
          <DollarSign className="w-4 h-4 text-slate-300" />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={projects.map(p => {
            const projectCosts = MEETING_COSTS.filter(mc => mc.projectId === p.id);
            const totalMinutes = projectCosts.reduce((s, mc) => {
              const m = MEETINGS.find(mt => mt.id === mc.meetingId);
              return s + (m?.durationMinutes ?? 0);
            }, 0);
            const totalCost = projectCosts.reduce((s, mc) => s + mc.totalCost, 0);
            return {
              name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
              costPerHour: totalMinutes > 0 ? Math.round((totalCost / totalMinutes) * 60) : 0,
              color: p.color,
            };
          })} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={v => '$' + v + '/hr'} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="costPerHour" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {projects.map(entry => (
                <rect key={entry.id} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
