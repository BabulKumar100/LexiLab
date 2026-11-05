import React from 'react';

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, onClick }) {
  const colorStyles = {
    blue: {
      border: 'border-blue-500/20 group-hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400',
      text: 'text-blue-400'
    },
    cyan: {
      border: 'border-cyan-500/20 group-hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      text: 'text-cyan-400'
    },
    emerald: {
      border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400'
    },
    rose: {
      border: 'border-rose-500/20 group-hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      text: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/20 group-hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      text: 'text-amber-400'
    },
    purple: {
      border: 'border-purple-500/20 group-hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      text: 'text-purple-400'
    }
  }[color] || {
    border: 'border-[#1E2F4D]',
    iconBg: 'bg-slate-800 text-slate-300',
    text: 'text-white'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-2xl bg-[#0C1424] border ${colorStyles.border} shadow-lg transition-all duration-300 group
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${colorStyles.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white tracking-tight">{value}</span>
        {subtitle && (
          <span className="text-[11px] text-slate-500">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
