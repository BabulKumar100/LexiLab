import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TokenInspectorModal } from '../tokens/TokenInspectorModal';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const TOAST = {
  success: { Icon: CheckCircle2, tone: 'text-emerald-400', ring: 'border-emerald-500/30' },
  error: { Icon: AlertTriangle, tone: 'text-rose-400', ring: 'border-rose-500/30' },
  warn: { Icon: AlertTriangle, tone: 'text-amber-400', ring: 'border-amber-500/30' },
  info: { Icon: Info, tone: 'text-cyan-400', ring: 'border-cyan-500/30' },
};

export function Layout() {
  const { notification } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const toast = TOAST[notification?.type] || TOAST.info;

  return (
    <div className="ambient flex h-dvh flex-col overflow-hidden text-slate-100 selection:bg-blue-500/30 selection:text-cyan-300">
      <Navbar onMenu={() => setMenuOpen(true)} />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-fade-in"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64 animate-slide-left pt-0 lg:hidden">
              <Sidebar onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <main
          key={location.pathname}
          className="scroll-slim relative flex-1 animate-fade-up overflow-y-auto px-4 py-5 md:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>

      <TokenInspectorModal />

      {notification && (
        <div
          role="status"
          className={cn(
            'fixed bottom-5 right-5 z-50 flex max-w-[min(92vw,22rem)] items-center gap-2.5 rounded-2xl border bg-ink-900/95 px-4 py-3 text-xs font-semibold shadow-lifted backdrop-blur animate-slide-left',
            toast.ring
          )}
        >
          <toast.Icon className={cn('h-4 w-4 shrink-0', toast.tone)} />
          <span className="text-slate-200">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
