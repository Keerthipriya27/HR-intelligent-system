import { cn, getConfidenceColor, getConfidenceBg } from '../../lib/utils';

interface ConfidenceBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ConfidenceBar({ value, showLabel = true, size = 'sm' }: ConfidenceBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 bg-slate-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getConfidenceBg(value))}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium tabular-nums w-8 text-right', getConfidenceColor(value))}>
          {Math.round(value * 100)}%
        </span>
      )}
    </div>
  );
}
