import { useState } from 'react';
import { Calculator, X, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { estimateMeetingCost } from '../../lib/ai-engine';
import { SALARY_BANDS } from '../../lib/mock-data';
import { cn } from '../../lib/utils';

export function CostEstimatorWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ breakdown: string; totalCost: number; insight: string } | null>(null);

  const salaryInfo = SALARY_BANDS.map(b => `${b.band} (${b.label}): $${b.hourlyRate}/hr`).join(', ');

  const handleEstimate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await estimateMeetingCost(query, salaryInfo);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/30 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span className="text-sm font-semibold text-white">Meeting Cost Estimator</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-violet-200 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-2">Describe a hypothetical meeting:</p>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='e.g. "12-person all-hands, 2 hours, senior engineers"'
                className="w-full h-20 px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-slate-700 placeholder-slate-300 transition-all"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleEstimate())}
              />
            </div>

            <button
              onClick={handleEstimate}
              disabled={loading || !query.trim()}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                loading || !query.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Estimating...
                </span>
              ) : 'Calculate Cost'}
            </button>

            {result && (
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-600">Total Cost</span>
                  <span className="text-xl font-bold text-violet-700">
                    ${result.totalCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-mono bg-white/60 rounded-lg p-2">{result.breakdown}</p>
                {result.insight && (
                  <div className="flex gap-2 text-xs text-violet-700">
                    <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>{result.insight}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg transition-all duration-200',
          'bg-gradient-to-r from-violet-600 to-violet-700 text-white',
          'hover:shadow-xl hover:shadow-violet-300/40 hover:-translate-y-0.5',
          'ai-glow'
        )}
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
        <span className="text-sm font-semibold">{open ? 'Close' : 'Cost Estimator'}</span>
      </button>
    </div>
  );
}
