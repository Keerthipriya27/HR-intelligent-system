import { useMemo } from 'react';
import { Sparkles, TrendingUp, Target, Lightbulb, AlertTriangle, CheckCircle2, ArrowUpRight, Clock, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MEETINGS, MEETING_COSTS } from '../lib/mock-data';
import { formatCurrency, cn } from '../lib/utils';

export function Insights() {
  const { projects, attributions } = useApp();

  const insights = useMemo(() => {
    const costMap = new Map<string, number>();
    for (const cost of MEETING_COSTS) {
      const key = cost.projectId ?? 'unattributed';
      costMap.set(key, (costMap.get(key) ?? 0) + cost.totalCost);
    }

    const projectHealth = projects.map(p => {
      const cost = costMap.get(p.id) ?? 0;
      const budget = p.monthlyBudget ?? 0;
      const overBudget = budget > 0 && cost > budget;
      const utilization = budget > 0 ? Math.round((cost / budget) * 100) : 0;
      const pMeetings = MEETING_COSTS.filter(mc => mc.projectId === p.id);
      const attendeeSet = new Set(pMeetings.flatMap(m => {
        const meeting = MEETINGS.find(mt => mt.id === m.meetingId);
        return meeting?.attendeeIds ?? [];
      }));
      return { project: p, cost, budget, overBudget, utilization, meetings: pMeetings.length, contributors: attendeeSet.size };
    });

    const totalSpend = Array.from(costMap.values()).reduce((s, v) => s + v, 0);
    const unattributed = costMap.get('unattributed') ?? 0;

    const aiInsights = [
      {
        type: 'opportunity' as const,
        title: projectHealth.filter(p => p.utilization < 50).length + ' projects under-utilize their budget',
        description: projectHealth.filter(p => p.utilization < 50).map(p => p.project.name).join(', ') + ' have used less than 50% of allocated budget. Consider rebalancing resources.',
      },
      {
        type: 'warning' as const,
        title: projectHealth.filter(p => p.overBudget).length + ' projects exceed monthly budget',
        description: projectHealth.filter(p => p.overBudget).length > 0
          ? projectHealth.filter(p => p.overBudget).map(p => p.project.name).join(', ') + ' have exceeded monthly HR budget targets.'
          : 'All projects are within budget.',
      },
      {
        type: 'insight' as const,
        title: 'Unattributed spend at ' + formatCurrency(unattributed),
        description: ((unattributed / totalSpend) * 100).toFixed(1) + '% of total HR spend is unattributed. Review and assign these meetings.',
      },
      {
        type: 'metric' as const,
        title: 'Avg ' + formatCurrency(Math.round(totalSpend / MEETINGS.length)) + ' per meeting',
        description: 'Across ' + MEETINGS.length + ' meetings with ' + new Set(MEETINGS.flatMap(m => m.attendeeIds)).size + ' unique contributors.',
      },
    ];

    return { projectHealth, totalSpend, unattributed, aiInsights };
  }, [projects, attributions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Exec Insights</h1>
            <p className="text-sm text-white/70">AI-powered intelligence across all projects</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Total Spend</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(insights.totalSpend)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Active Projects</p>
            <p className="text-2xl font-bold mt-0.5">{projects.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Unattributed</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(insights.unattributed)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Meetings</p>
            <p className="text-2xl font-bold mt-0.5">{MEETINGS.length}</p>
          </div>
        </div>
      </div>

      {/* Project Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {insights.projectHealth.map(({ project, cost, budget, overBudget, utilization, meetings, contributors }) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5 card-3d">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
                <p className="text-xs text-slate-400">{meetings} meetings &middot; {contributors} contributors</p>
              </div>
              {overBudget ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 text-rose-600 text-xs font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Over
                </div>
              ) : utilization >= 80 ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-600 text-xs font-semibold">
                  <Target className="w-3 h-3" /> {utilization}%
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> On Track
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Spend</span>
                <span className="font-semibold text-slate-900">{formatCurrency(cost)}</span>
              </div>
              {budget > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Budget</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(budget)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={'h-full rounded-full transition-all ' + (overBudget ? 'bg-rose-500' : 'bg-emerald-500')} style={{ width: Math.min(utilization, 100) + '%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{utilization}% utilized</span>
                    {project.roiScore && <span>ROI Score: {project.roiScore}/100</span>}
                  </div>
                </>
              )}
            </div>
            {project.tags && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                {project.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.aiInsights.map((insight, i) => (
          <div key={i} className={cn(
            'rounded-2xl p-5 border card-3d',
            insight.type === 'opportunity' && 'bg-gradient-to-br from-emerald-50 to-emerald-100/30 border-emerald-200/50',
            insight.type === 'warning' && 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/50',
            insight.type === 'insight' && 'bg-gradient-to-br from-violet-50 to-violet-100/30 border-violet-200/50',
            insight.type === 'metric' && 'bg-gradient-to-br from-sky-50 to-sky-100/30 border-sky-200/50',
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                insight.type === 'opportunity' && 'bg-emerald-600',
                insight.type === 'warning' && 'bg-amber-500',
                insight.type === 'insight' && 'bg-violet-600',
                insight.type === 'metric' && 'bg-sky-600',
              )}>
                {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-white" />}
                {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-white" />}
                {insight.type === 'insight' && <Sparkles className="w-4 h-4 text-white" />}
                {insight.type === 'metric' && <TrendingUp className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest meeting attributions and updates</p>
          </div>
          <Clock className="w-4 h-4 text-slate-300" />
        </div>
        <div className="space-y-3">
          {MEETINGS.slice(0, 5).map(meeting => {
            const attr = attributions.get(meeting.id);
            const project = projects.find(p => p.id === attr?.projectId);
            return (
              <div key={meeting.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{meeting.title}</p>
                  <p className="text-xs text-slate-400">
                    {meeting.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; {meeting.durationMinutes}m &middot; {meeting.attendeeIds.length} attendees
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {project ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-xs font-medium text-slate-600">{project.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Unattributed</span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
