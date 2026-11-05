import React from 'react';
import { TOKEN_METADATA } from '../../engine/tokenTypes';
import { cn } from '../../utils/cn';

const SIZES = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs font-semibold'
};

export function TokenBadge({ type, size = 'sm', showDot = true, className }) {
  const meta = TOKEN_METADATA[type] || {
    label: type || 'UNKNOWN',
    badgeClass: 'border-ink-700 bg-ink-800/80 text-slate-300'
  };

  return (
    <span
      title={meta.description}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border font-mono font-medium tracking-tight shadow-inset',
        meta.badgeClass,
        SIZES[size] || SIZES.sm,
        className
      )}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {meta.label}
    </span>
  );
}
