import React from 'react';
import { cn } from '../../utils/cn';

const BORDER = {
  cyan: 'border-cyan-500/25',
  blue: 'border-blue-500/25',
  indigo: 'border-indigo-500/25',
  emerald: 'border-emerald-500/25',
  amber: 'border-amber-500/25',
  rose: 'border-rose-500/25',
  purple: 'border-purple-500/25',
  slate: 'border-ink-700/70',
};

const GLOW = {
  cyan: 'bg-cyan-500/25',
  blue: 'bg-blue-500/25',
  indigo: 'bg-indigo-500/25',
  emerald: 'bg-emerald-500/25',
  amber: 'bg-amber-500/25',
  rose: 'bg-rose-500/25',
  purple: 'bg-purple-500/25',
  slate: 'bg-slate-500/20',
};

const ICON_TONE = {
  cyan: 'border-cyan-500/25 text-cyan-300',
  blue: 'border-blue-500/25 text-blue-300',
  indigo: 'border-indigo-500/25 text-indigo-300',
  emerald: 'border-emerald-500/25 text-emerald-300',
  amber: 'border-amber-500/25 text-amber-300',
  rose: 'border-rose-500/25 text-rose-300',
  purple: 'border-purple-500/25 text-purple-300',
  slate: 'border-ink-700 text-slate-300',
};

export function StatTile({ label, value, unit, hint, icon: Icon, tone = 'cyan', onClick, className }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'panel bevel-top group relative overflow-hidden px-4 py-3.5 text-left transition-all duration-300',
        BORDER[tone],
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lifted',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full blur-xl transition-opacity duration-500 group-hover:opacity-100',
          GLOW[tone]
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {Icon && (
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg border bg-ink-900/70 transition-transform duration-300 group-hover:scale-110',
              ICON_TONE[tone]
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="relative mt-1.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tabular-nums tracking-tight text-white">{value}</span>
        {unit && <span className="text-2xs font-semibold uppercase text-slate-500">{unit}</span>}
      </div>
      {hint && <p className="relative mt-1 truncate text-2xs text-slate-500">{hint}</p>}
    </Tag>
  );
}

export function Table({ head, children, className, stickyHead = true }) {
  return (
    <div className="scroll-slim overflow-auto">
      <table className={cn('w-full border-collapse text-left text-xs', className)}>
        <thead className={cn(stickyHead && 'sticky top-0 z-10', 'bg-ink-900/95 backdrop-blur')}>
          <tr className="border-b border-ink-700/70">
            {head.map((h, i) => (
              <th
                key={i}
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-2xs font-bold uppercase tracking-[0.1em] text-slate-500',
                  h.align === 'right' && 'text-right',
                  h.align === 'center' && 'text-center',
                  h.className
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/40">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, align = 'left', className, mono = false, ...rest }) {
  return (
    <td
      className={cn(
        'px-4 py-2.5 align-middle',
        mono && 'font-mono tabular-nums',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

export function InfoRow({ label, children, tone = 'slate' }) {
  const tones = {
    cyan: 'text-cyan-300',
    rose: 'text-rose-300',
    emerald: 'text-emerald-300',
    slate: 'text-slate-200',
  };
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-700/40 py-2 last:border-0">
      <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className={cn('text-right text-xs font-medium', tones[tone])}>{children}</span>
    </div>
  );
}

export function Callout({ tone = 'info', icon: Icon, title, children, className }) {
  const tones = {
    info: 'border-cyan-500/25 bg-cyan-500/[0.07] text-cyan-100',
    warn: 'border-amber-500/25 bg-amber-500/[0.07] text-amber-100',
    danger: 'border-rose-500/25 bg-rose-500/[0.07] text-rose-100',
    success: 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-100',
    note: 'border-ink-700 bg-ink-900/60 text-slate-300',
  };
  const iconTones = {
    info: 'text-cyan-300',
    warn: 'text-amber-300',
    danger: 'text-rose-300',
    success: 'text-emerald-300',
    note: 'text-slate-400',
  };
  return (
    <div className={cn('rounded-xl border px-3.5 py-3 text-xs leading-relaxed', tones[tone], className)}>
      {title && (
        <p className="mb-1 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.12em] opacity-90">
          {Icon && <Icon className={cn('h-3.5 w-3.5', iconTones[tone])} />}
          {title}
        </p>
      )}
      <div className="text-[11.5px] opacity-90 [&_code]:rounded [&_code]:bg-ink-950/70 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-cyan-300">
        {children}
      </div>
    </div>
  );
}
