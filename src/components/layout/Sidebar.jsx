import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Binary,
  Database,
  Workflow,
  Footprints,
  Regex,
  AlertOctagon,
  BarChart3,
  BookOpen,
  GraduationCap,
  FileCode2,
  FileText,
  Split,
  Eye,
  FlaskConical,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const NAV_SECTIONS = [
  {
    title: 'Analyzer',
    items: [
      { path: '/', label: 'Overview Workbench', icon: LayoutDashboard, end: true },
      { path: '/tokens', label: 'Token Analysis', icon: Binary, countKey: 'tokens' },
      { path: '/symbols', label: 'Symbol Table', icon: Database, countKey: 'symbolTable' },
      { path: '/errors', label: 'Error Diagnostics', icon: AlertOctagon, errorCountKey: 'errors' },
      { path: '/statistics', label: 'Metrics & Charts', icon: BarChart3 }
    ]
  },
  {
    title: 'Compiler Automata',
    items: [
      { path: '/dfa', label: 'DFA Visualizer', icon: Workflow },
      { path: '/step-trace', label: 'Step-by-Step Trace', icon: Footprints },
      { path: '/maximal-munch', label: 'Maximal Munch Sandbox', icon: Split },
      { path: '/lookahead', label: 'Lookahead Buffer', icon: Eye },
      { path: '/playground', label: 'Test Playground', icon: FlaskConical },
      { path: '/regex', label: 'Regex Explorer', icon: Regex }
    ]
  },
  {
    title: 'Education & Viva',
    items: [
      { path: '/examples', label: 'Sample Programs', icon: FileCode2 },
      { path: '/learn', label: 'Theory & Viva Prep', icon: BookOpen },
      { path: '/quiz', label: 'Tokenization Quiz', icon: GraduationCap },
      { path: '/documentation', label: 'Documentation', icon: FileText }
    ]
  }
];

export function Sidebar({ onNavigate, onClose }) {
  const { analysis } = useApp();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/80 backdrop-blur-md select-none',
        onClose ? 'h-full' : 'hidden lg:flex'
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3 lg:hidden">
        <span className="text-2xs font-bold uppercase tracking-[0.2em] text-slate-500">Navigation</span>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-lg border border-ink-700 p-1 text-slate-400 hover:text-cyan-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="scroll-slim flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            <h3 className="mb-1.5 px-3 text-2xs font-bold uppercase tracking-[0.16em] text-slate-600">
              {sec.title}
            </h3>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const count = item.countKey ? analysis[item.countKey]?.length : undefined;
              const errorCount = item.errorCountKey ? analysis[item.errorCountKey]?.length : undefined;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-200'
                        : 'text-slate-400 hover:bg-ink-800/70 hover:text-slate-100'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-grad-brand" />
                      )}
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                            isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-cyan-200'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {errorCount > 0 && (
                        <span className="ml-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-1.5 font-mono text-2xs font-bold tabular-nums text-rose-300">
                          {errorCount}
                        </span>
                      )}
                      {errorCount === 0 && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400/70" title="No lexical errors" />
                      )}
                      {typeof count === 'number' && count > 0 && (
                        <span className="ml-1 font-mono text-2xs tabular-nums text-slate-600">{count}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-700/60 p-3">
        <div className="rounded-2xl border border-ink-700/60 bg-gradient-to-br from-ink-800 to-ink-900 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-2xs font-bold text-cyan-300">
            <GraduationCap className="h-3.5 w-3.5" />
            Compiler Design
          </p>
          <p className="text-2xs leading-relaxed text-slate-400">
            C-subset scanner, DFA traces and automata visualizer for lab files and viva.
          </p>
        </div>
      </div>
    </aside>
  );
}
