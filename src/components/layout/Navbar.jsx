import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  Download,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  Menu,
  ChevronDown,
  Timer
} from 'lucide-react';
import { exportTokensToCSV } from '../../utils/exportCSV';
import { exportAnalysisToJSON } from '../../utils/exportJSON';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

function Popover({ width = 'w-72', label, icon: Icon, variant = 'secondary', children }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant={variant}
        icon={Icon}
        active={open}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 z-50 mt-2 origin-top-right animate-pop-in overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/[.97] shadow-lifted backdrop-blur',
            width
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

function MenuHeading({ children }) {
  return (
    <p className="border-b border-ink-700/60 px-3 py-2 text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  );
}

export function Navbar({ onMenu }) {
  const { analysis, sourceCode, loadSample, samplePrograms, notify } = useApp();
  const { stats, errors } = analysis;
  const hasErrors = errors && errors.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-ink-700/60 bg-ink-900/80 px-3 backdrop-blur-xl select-none md:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          onClick={onMenu}
          aria-label="Open navigation"
          className="rounded-xl border border-ink-700 bg-ink-800 p-2 text-slate-300 transition-colors hover:text-cyan-300 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-grad-brand shadow-glow-blue transition-transform duration-300 group-hover:scale-105">
            <span aria-hidden className="shimmer absolute inset-0 opacity-40" />
            <Code2 className="relative h-5 w-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="grad-text text-base font-extrabold tracking-tight">LexiLab</span>
              <span className="rounded border border-cyan-500/25 bg-cyan-500/10 px-1 py-px text-[9px] font-bold text-cyan-300">
                v2.1
              </span>
            </span>
            <span className="hidden text-2xs text-slate-500 sm:block">
              Interactive Compiler Design Simulator
            </span>
          </span>
        </Link>
      </div>

      {/* Live scanner read-out */}
      <div className="hidden flex-1 items-center justify-center gap-2 xl:flex">
        <span className="flex items-center gap-2 rounded-xl border border-ink-700/70 bg-ink-850/70 px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ring-pulse" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-slate-500">Tokens</span>
          <span className="font-mono font-bold tabular-nums text-cyan-300">{stats.totalTokens}</span>
        </span>

        <span className="flex items-center gap-2 rounded-xl border border-ink-700/70 bg-ink-850/70 px-3 py-1.5 text-xs">
          <span className="text-slate-500">Symbols</span>
          <span className="font-mono font-bold tabular-nums text-blue-300">{stats.totalIdentifiers}</span>
        </span>

        <span
          className={cn(
            'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold',
            hasErrors
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          )}
        >
          {hasErrors ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {hasErrors ? `${stats.totalErrors} lexical error${stats.totalErrors > 1 ? 's' : ''}` : 'clean scan'}
        </span>

        <span className="flex items-center gap-1.5 font-mono text-2xs text-slate-500">
          <Timer className="h-3 w-3" />
          {stats.scanDurationMs}ms
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Popover label="Samples" icon={FolderOpen}>
          {({ close }) => (
            <>
              <MenuHeading>Load a C sample program</MenuHeading>
              <div className="scroll-slim max-h-80 overflow-y-auto p-1.5">
                {samplePrograms.map((sp) => (
                  <button
                    key={sp.id}
                    role="menuitem"
                    onClick={() => {
                      loadSample(sp.id);
                      close();
                    }}
                    className="group block w-full rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-ink-800"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {sp.name}
                      </span>
                      <span className="shrink-0 rounded bg-ink-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                        {sp.category}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-2xs text-slate-500">{sp.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Popover>

        <Popover label="Export" icon={Download} variant="primary" width="w-56">
          {({ close }) => (
            <>
              <MenuHeading>Download</MenuHeading>
              <div className="p-1.5">
                <button
                  role="menuitem"
                  onClick={() => {
                    exportTokensToCSV(analysis.tokens);
                    notify('Token table exported as CSV', 'success');
                    close();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-ink-800 hover:text-cyan-300"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  Token table (CSV)
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    exportAnalysisToJSON({ ...analysis, sourceCode });
                    notify('Full analysis exported as JSON', 'success');
                    close();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-ink-800 hover:text-cyan-300"
                >
                  <FileJson className="h-4 w-4 text-amber-400" />
                  Full report (JSON)
                </button>
              </div>
            </>
          )}
        </Popover>

        <Link
          to="/learn"
          title="Theory & Viva Guide"
          aria-label="Theory and viva guide"
          className="hidden h-8 w-8 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300 sm:flex"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
