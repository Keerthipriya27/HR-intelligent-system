import { useState, useMemo } from 'react';
import {
  DollarSign, Calendar, Clock, Layers, Search,
  TrendingUp, Sparkles, Loader2, BarChart3, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MetricCard } from '../components/dashboard/MetricCard';
import { useApp } from '../context/AppContext';
import { MEETINGS, MEETING_COSTS, EMPLOYEES, getProjectCostMap, getWeeklySpend } from '../lib/mock-data';
import { formatCurrency, getAttributionStats, cn } from '../lib/utils';
import { parseDashboardQuery } from '../lib/ai-engine';

const PERIOD_OPTIONS = [
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'last_quarter', label: 'Quarter' },
  { value: 'ytd', label: 'YTD' },
];

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

export function Dashboard() {
  const { filters, setFilters, attributions, projects, currentUser } = useApp();
  const [nlQuery, setNlQuery] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState('');

  const costMap = getProjectCostMap();
  const weeklySpend = getWeeklySpend();
  const stats = getAttributionStats(attributions);

  const totalSpend = Array.from(costMap.values()).reduce((s, v) => s + v, 0);
  const unattributedCost = costMap.get('unattributed') ?? 0;

  // Project cost data for bar chart
  const projectCostData = useMemo(() => {
    return projects
      .map(p => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        fullName: p.name,
        cost: Math.round(costMap.get(p.id) ?? 0),
        budget: p.monthlyBudget ?? 0,
        color: p.color,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [projects, costMap]);

  // Role donut data
  const roleData = useMemo(() => {
    const roleMap = new Map<string, number>();
    for (const cost of MEETING_COSTS) {
      for (const b of cost.breakdown) {
        roleMap.set(b.designation, (roleMap.get(b.designation) ?? 0) + b.cost);
      }
    }
    const colors: Record<string, string> = { IC1: '#94a3b8', IC2: '#60a5fa', IC3: '#818cf8', IC4: '#a78bfa', M1: '#c084fc', M2: '#e879f9' };
    return Array.from(roleMap.entries()).map(([name, value]) => ({ name, value: Math.round(value), color: colors[name] ?? '#94a3b8' }));
  }, []);

  // AI insights
  const topProject = projectCostData[0];
  const overBudget = projectCostData.filter(p => p.budget > 0 && p.cost > p.budget);

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    try {
      const result = await parseDashboardQuery(
        nlQuery,
        projects.map(p => p.name),
        EMPLOYEES.map(e => e.name)
      );
      setNlResult(result.summary);
      if (result.projectId) {
        const proj = projects.find(p => p.name.toLowerCase().includes(result.projectId!.toLowerCase()));
        if (proj) setFilters({ projectId: proj.id });
      }
      if (result.period) setFilters({ period: result.period });
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NL Query bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNLQuery()}
              placeholder='Ask AI: "Show Platform v3 costs by role" or "Which team has highest spend?"'
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={handleNLQuery}
            disabled={nlLoading || !nlQuery.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
              nlLoading || !nlQuery.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg shadow-violet-200'
            )}
          >
            {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
        {nlResult && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-violet-50 border border-violet-200/50 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-violet-700">{nlResult}</p>
          </div>
        )}
      </div>

      {/* Period filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-500">Period:</span>
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilters({ period: opt.value as typeof filters.period })}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              filters.period === opt.value
                ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
            )}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Project:</span>
          <select
            value={filters.projectId ?? ''}
            onChange={e => setFilters({ projectId: e.target.value || null })}
            className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-600 focus:border-violet-400 outline-none"
          >
            <option value="">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total HR Spend"
          value={formatCurrency(totalSpend)}
          subtitle="Meeting-attributed salary cost"
          trend={{ value: 12.4, label: 'vs last month' }}
          icon={DollarSign}
          highlight
        />
        <MetricCard
          title="Meetings Tracked"
          value={MEETINGS.length.toString()}
          subtitle={`Across ${projects.length} active projects`}
          icon={Calendar}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          trend={{ value: 8, label: 'vs last period' }}
        />
        <MetricCard
          title="Attribution Rate"
          value={`${Math.round(stats.autoAttributed / stats.total * 100)}%`}
          subtitle={`${stats.autoAttributed} auto-attributed by AI`}
          icon={Layers}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: -2.1, label: 'needs review: ' + stats.needsReview }}
        />
        <MetricCard
          title="Unattributed Cost"
          value={formatCurrency(unattributedCost)}
          subtitle={`${stats.unattributed} meetings unfiled`}
          icon={Activity}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 5, label: 'up from last period' }}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project cost bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">HR Spend by Project</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly meeting cost attribution</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-300" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectCostData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {projectCostData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role donut */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">Cost by Role</h2>
            <p className="text-xs text-slate-400 mt-0.5">Salary band distribution</p>
          </div>
          {currentUser.role === 'employee' ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center">Role breakdown hidden<br />for privacy</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {roleData.map(r => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-[11px] text-slate-600 font-medium">{r.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Weekly Spend Trend</h2>
            <p className="text-xs text-slate-400 mt-0.5">HR cost over the last 8 weeks</p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklySpend}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spend" stroke="#7c3aed" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ fill: '#7c3aed', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight 1 */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 rounded-2xl p-4 card-3d">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">AI Insight</span>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {topProject ? `"${topProject.fullName}" is your highest cost centre at ${formatCurrency(topProject.cost)} — ${topProject.budget ? Math.round(topProject.cost / topProject.budget * 100) + '% of budget' : 'no budget set'}.` : 'Loading insights...'}
          </p>
        </div>

        {/* Insight 2 */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-2xl p-4 card-3d">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Attribution</span>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {stats.needsReview} meetings need human review. {formatCurrency(unattributedCost)} in spend is currently unattributed.
          </p>
        </div>

        {/* Insight 3 */}
        <div className={cn(
          'rounded-2xl p-4 card-3d border',
          overBudget.length > 0
            ? 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200/50'
            : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', overBudget.length > 0 ? 'bg-rose-500' : 'bg-emerald-500')}>
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={cn('text-xs font-semibold uppercase tracking-wide', overBudget.length > 0 ? 'text-rose-700' : 'text-emerald-700')}>
              {overBudget.length > 0 ? 'Budget Alert' : 'Budget Health'}
            </span>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {overBudget.length > 0
              ? `${overBudget.map(p => p.fullName).join(', ')} ${overBudget.length === 1 ? 'has' : 'have'} exceeded monthly HR budget.`
              : 'All projects are within their monthly HR budget targets. '}
          </p>
        </div>
      </div>
    </div>
  );
}
