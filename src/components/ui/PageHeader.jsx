import React from 'react';
import { cn } from '../../utils/cn';

export function PageHeader({ icon: Icon, kicker, title, description, actions, className }) {
  return (
    <header className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 shadow-glow">
            <span aria-hidden className="absolute inset-0 rounded-2xl bg-grad-brand opacity-[0.16]" />
            <Icon className="relative h-5 w-5 text-cyan-200" />
          </span>
        )}
        <div className="min-w-0">
          {kicker && (
            <p className="text-2xs font-bold uppercase tracking-[0.2em] text-cyan-400/80">{kicker}</p>
          )}
          <h1 className="mt-0.5 text-balance text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Tabs({ tabs, active, onChange, variant = 'pill', className }) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex gap-1 overflow-x-auto border-b border-ink-700/70 no-scrollbar', className)}>
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                'relative shrink-0 px-3.5 py-2 text-xs font-semibold transition-colors',
                isActive ? 'text-cyan-200' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span className="flex items-center gap-1.5">
                {t.icon && <t.icon className="h-3.5 w-3.5" />}
                {t.label}
                {typeof t.count === 'number' && (
                  <span className="font-mono text-2xs text-slate-500">{t.count}</span>
                )}
              </span>
              {isActive && (
                <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-grad-brand" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-[.97]',
              isActive
                ? 'border-cyan-500/40 bg-cyan-500/12 text-cyan-200 shadow-glow'
                : 'border-ink-700 bg-ink-800/60 text-slate-400 hover:border-ink-600 hover:text-slate-200'
            )}
          >
            {t.icon && <t.icon className="h-3.5 w-3.5" />}
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 font-mono text-2xs tabular-nums',
                  isActive ? 'bg-cyan-500/20 text-cyan-100' : 'bg-ink-900 text-slate-500'
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-700 bg-ink-900 text-slate-500">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
