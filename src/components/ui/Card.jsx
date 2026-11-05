import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ as: Tag = 'section', className, hover = false, bevel = true, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'panel relative',
        bevel && 'bevel-top',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-glow',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ icon: Icon, title, subtitle, actions, className, dense = false }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-ink-700/60',
        dense ? 'px-4 py-2.5' : 'px-5 py-3.5',
        className
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-slate-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children, scroll = false }) {
  return (
    <div className={cn('px-5 py-4', scroll && 'scroll-slim overflow-auto', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('border-t border-ink-700/60 px-5 py-3 text-xs text-slate-400', className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ className, children }) {
  return (
    <h3 className={cn('text-2xs font-bold uppercase tracking-[0.16em] text-slate-500', className)}>
      {children}
    </h3>
  );
}
