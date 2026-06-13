import { useState, useMemo } from 'react';
import { Brain, CheckCircle2, AlertCircle, Clock, Filter, RefreshCw, Loader2, X, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MEETINGS, MEETING_COSTS, EMPLOYEES } from '../lib/mock-data';
import { ConfidenceBar } from '../components/dashboard/ConfidenceBar';
import { formatCurrency, formatCurrencyFull, getAttributionStats, cn, getInitials } from '../lib/utils';
import { attributeAllMeetings } from '../lib/ai-engine';
import type { Attribution } from '../lib/types';

type Filter = 'all' | 'needs_review' | 'high_confidence' | 'unattributed';

export function Attribution() {
  const { attributions, updateAttribution, projects, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [rerunLoading, setRerunLoading] = useState(false);
  const [rerunProgress, setRerunProgress] = useState(0);
  const [editProjectId, setEditProjectId] = useState<string>('');

  const stats = getAttributionStats(attributions);

  const filteredMeetings = useMemo(() => {
    return MEETINGS.filter(m => {
      const attr = attributions.get(m.id);
      if (!attr) return activeFilter === 'unattributed';
      switch (activeFilter) {
        case 'needs_review': return attr.method === 'ai_flagged' || attr.confidence < 0.65;
        case 'high_confidence': return attr.confidence >= 0.85;
        case 'unattributed': return attr.projectId === null;
        default: return true;
      }
    });
  }, [attributions, activeFilter]);

  const selectedMeetingData = selectedMeeting ? MEETINGS.find(m => m.id === selectedMeeting) : null;
  const selectedAttr = selectedMeeting ? attributions.get(selectedMeeting) : null;

  const handleConfirm = () => {
    if (!selectedMeeting) return;
    const existing = attributions.get(selectedMeeting);
    updateAttribution(selectedMeeting, {
      method: editProjectId !== (existing?.projectId ?? '') ? 'human_corrected' : 'human_confirmed',
      projectId: editProjectId || null,
      confidence: editProjectId ? (editProjectId !== existing?.projectId ? 0.95 : existing.confidence) : 0,
      reviewedBy: currentUser.name,
      reviewedAt: new Date(),
    });
    setSelectedMeeting(null);
  };

  const handleBulkConfirm = () => {
    const highConf = Array.from(attributions.entries()).filter(([, a]) => a.confidence >= 0.85 && a.method === 'ai_auto');
    for (const [id, attr] of highConf) {
      updateAttribution(id, { ...attr, method: 'human_confirmed', reviewedBy: currentUser.name, reviewedAt: new Date() });
    }
  };

  const handleRerun = async () => {
    setRerunLoading(true);
    setRerunProgress(0);
    try {
      const results = await attributeAllMeetings(
        MEETINGS.slice(0, 5), // demo: only 5 to save API calls
        projects,
        EMPLOYEES,
        (done, total) => setRerunProgress(Math.round(done / total * 100))
      );
      for (const [id, attr] of results) {
        updateAttribution(id, attr);
      }
    } finally {
      setRerunLoading(false);
    }
  };

  const getMethodBadge = (method: Attribution['method']) => {
    switch (method) {
      case 'ai_auto': return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">AI Auto</span>;
      case 'ai_flagged': return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Needs Review</span>;
      case 'human_confirmed': return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Confirmed</span>;
      case 'human_corrected': return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Corrected</span>;
      case 'unattributed': return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Unattributed</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Auto-attributed', value: stats.autoAttributed, color: 'text-violet-700', bg: 'bg-violet-50', icon: Brain },
          { label: 'Needs Review', value: stats.needsReview, color: 'text-amber-700', bg: 'bg-amber-50', icon: AlertCircle },
          { label: 'Human Confirmed', value: stats.humanConfirmed, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Avg Confidence', value: `${Math.round(stats.avgConfidence * 100)}%`, color: 'text-sky-700', bg: 'bg-sky-50', icon: Sparkles },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-4 flex items-center gap-3 card-3d">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
              <Icon className={cn('w-4.5 h-4.5', color)} size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
          {([
            { key: 'all', label: 'All' },
            { key: 'needs_review', label: 'Needs Review' },
            { key: 'high_confidence', label: 'High Confidence' },
            { key: 'unattributed', label: 'Unattributed' },
          ] as { key: Filter; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeFilter === f.key ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleBulkConfirm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg shadow-emerald-200"
        >
          <CheckCircle2 className="w-4 h-4" />
          Bulk Confirm High-Confidence
        </button>

        <button
          onClick={handleRerun}
          disabled={rerunLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-auto',
            rerunLoading ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
          )}
        >
          {rerunLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {rerunLoading ? `Re-running AI (${rerunProgress}%)…` : 'Re-run AI Attribution'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {filteredMeetings.length} meetings
            <span className="text-slate-400 font-normal ml-1">({activeFilter === 'all' ? 'all' : activeFilter.replace('_', ' ')})</span>
          </p>
          <Filter className="w-4 h-4 text-slate-300" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Meeting', 'Attendees', 'Duration', 'Project', 'Confidence', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMeetings.map(meeting => {
                const attr = attributions.get(meeting.id);
                const project = projects.find(p => p.id === attr?.projectId);
                const cost = MEETING_COSTS.find(c => c.meetingId === meeting.id);
                const attendeeNames = meeting.attendeeIds.slice(0, 3).map(id => {
                  const e = EMPLOYEES.find(emp => emp.id === id);
                  return e ? getInitials(e.name) : '?';
                });

                return (
                  <tr key={meeting.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-4 py-3.5 max-w-48">
                      <p className="font-medium text-slate-800 truncate">{meeting.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {meeting.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {meeting.recurrenceRule && <span className="ml-1.5 text-violet-500">↻</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex -space-x-1.5">
                        {attendeeNames.map((initials, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white border-2 border-white flex-shrink-0">
                            {initials}
                          </div>
                        ))}
                        {meeting.attendeeIds.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-semibold text-slate-500 border-2 border-white">
                            +{meeting.attendeeIds.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-slate-700">{meeting.durationMinutes}m</p>
                      {cost && <p className="text-xs text-slate-400">{formatCurrency(cost.totalCost)}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      {project ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                          <span className="text-slate-700 font-medium text-xs truncate max-w-28">{project.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">— unattributed</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 min-w-28">
                      {attr ? <ConfidenceBar value={attr.confidence} /> : <span className="text-xs text-slate-300">N/A</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {attr && getMethodBadge(attr.method)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting.id);
                          setEditProjectId(attr?.projectId ?? '');
                        }}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-semibold hover:bg-violet-100 transition-all"
                      >
                        Review <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedMeetingData && selectedAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-slate-900">Review Attribution</h3>
              </div>
              <button onClick={() => setSelectedMeeting(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Meeting info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-slate-900">{selectedMeetingData.title}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                  <span><Clock className="w-3.5 h-3.5 inline mr-1" />{selectedMeetingData.durationMinutes} minutes</span>
                  <span>{selectedMeetingData.attendeeIds.length} attendees</span>
                  {selectedMeetingData.recurrenceRule && <span>Recurring ({selectedMeetingData.recurrenceRule})</span>}
                  {selectedMeetingData.description && <span className="col-span-2 text-slate-400 text-xs">{selectedMeetingData.description}</span>}
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-violet-50 border border-violet-200/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-700">AI Reasoning</span>
                  <ConfidenceBar value={selectedAttr.confidence} size="sm" />
                </div>
                <p className="text-sm text-slate-600">{selectedAttr.reasoning}</p>
              </div>

              {/* Project selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Assign to project</label>
                <select
                  value={editProjectId}
                  onChange={e => setEditProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white text-slate-700"
                >
                  <option value="">— Leave unattributed</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Cost summary */}
              {(() => {
                const cost = MEETING_COSTS.find(c => c.meetingId === selectedMeetingData.id);
                return cost ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Meeting cost</span>
                    <span className="font-semibold text-slate-900">{formatCurrencyFull(cost.totalCost)}</span>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all hover:shadow-lg shadow-violet-200"
              >
                Confirm Attribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
