import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  highlight?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, icon: Icon, iconColor = 'text-violet-600', iconBg = 'bg-violet-50', highlight }: MetricCardProps) {
  const isPositiveTrend = trend && trend.value > 0;

  return (
    <div className={cn(
      'relative rounded-2xl p-5 border transition-all duration-200 card-3d overflow-hidden',
      highlight
        ? 'bg-gradient-to-br from-violet-600 to-violet-700 border-violet-500/30 text-white shadow-xl shadow-violet-200/40'
        : 'bg-white border-slate-200/60 shadow-md shadow-slate-100/50'
    )}>
      {/* Background decoration */}
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', highlight ? 'bg-white/20' : iconBg)}>
          <Icon className={cn('w-5 h-5', highlight ? 'text-white' : iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            highlight
              ? (isPositiveTrend ? 'bg-white/20 text-white' : 'bg-white/20 text-white')
              : (isPositiveTrend ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')
          )}>
            {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p className={cn('text-2xl font-bold tracking-tight mb-0.5', highlight ? 'text-white' : 'text-slate-900')}>{value}</p>
        <p className={cn('text-sm font-medium', highlight ? 'text-violet-200' : 'text-slate-500')}>{title}</p>
        {subtitle && (
          <p className={cn('text-xs mt-1', highlight ? 'text-violet-200/70' : 'text-slate-400')}>{subtitle}</p>
        )}
        {trend && (
          <p className={cn('text-xs mt-1', highlight ? 'text-violet-200/70' : 'text-slate-400')}>{trend.label}</p>
        )}
      </div>
    </div>
  );
}
