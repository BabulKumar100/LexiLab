import React from 'react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary:
    'bg-grad-brand text-white shadow-glow-blue hover:brightness-110 hover:shadow-lifted border border-transparent',
  secondary:
    'bg-ink-800 text-slate-200 border border-ink-700 hover:border-cyan-500/40 hover:bg-ink-750 hover:text-cyan-200',
  ghost:
    'bg-transparent text-slate-400 border border-transparent hover:bg-ink-800/70 hover:text-cyan-200',
  danger:
    'bg-rose-500/15 text-rose-200 border border-rose-500/30 hover:bg-rose-500/25 hover:text-white',
  success:
    'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/25 hover:text-white',
  outline:
    'bg-transparent text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10',
};

const SIZES = {
  xs: 'h-7 gap-1.5 px-2.5 text-2xs',
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-4 text-sm',
  icon: 'h-8 w-8 justify-center text-xs',
};

export function Button({
  variant = 'secondary',
  size = 'sm',
  icon: Icon,
  active = false,
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center rounded-xl font-semibold tracking-tight transition-all duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        active && 'ring-1 ring-cyan-400/50 !text-cyan-200',
        className
      )}
      {...rest}
    >
      {Icon && <Icon className={cn(size === 'icon' ? 'h-4 w-4' : 'h-3.5 w-3.5', !children && 'shrink-0')} />}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, className, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-slate-400 transition-all duration-200 hover:border-cyan-500/40 hover:bg-ink-750 hover:text-cyan-200 active:scale-95 disabled:opacity-40',
        className
      )}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
