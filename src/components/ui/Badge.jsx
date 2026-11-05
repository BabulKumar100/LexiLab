import React from 'react';
import { cn } from '../../utils/cn';

const TONES = {
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  slate: 'border-ink-700 bg-ink-800/80 text-slate-300',
};

const SIZES = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ tone = 'slate', size = 'sm', dot = false, icon: Icon, mono = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-semibold tracking-tight whitespace-nowrap',
        TONES[tone],
        SIZES[size],
        mono && 'font-mono',
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function CountPill({ value, tone = 'cyan', className }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[1.75rem] items-center justify-center rounded-full border px-1.5 py-0.5 font-mono text-2xs font-bold tabular-nums',
        TONES[tone],
        className
      )}
    >
      {value}
    </span>
  );
}

export function MeterBar({ value, max = 100, tone = 'cyan', className }) {
  const tones = {
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
  };
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-950 ring-1 ring-inset ring-ink-700/60', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
