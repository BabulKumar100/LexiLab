import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const CATEGORIES = [
  { key: 'totalKeywords', label: 'Keywords', bar: 'bg-indigo-400', text: 'text-indigo-300', tone: 'indigo' },
  { key: 'totalIdentifiers', label: 'Identifiers', bar: 'bg-cyan-400', text: 'text-cyan-300', tone: 'cyan' },
  { key: 'totalLiterals', label: 'Literals', bar: 'bg-amber-400', text: 'text-amber-300', tone: 'amber' },
  { key: 'totalOperators', label: 'Operators', bar: 'bg-blue-400', text: 'text-blue-300', tone: 'blue' },
  { key: 'totalSeparators', label: 'Separators', bar: 'bg-slate-400', text: 'text-slate-300', tone: 'slate' },
  { key: 'totalComments', label: 'Comments', bar: 'bg-purple-400', text: 'text-purple-300', tone: 'purple' }
];

export function TokenChart() {
  const { analysis } = useApp();
  const { stats } = analysis;
  const total = stats.totalTokens || 1;
  const rows = CATEGORIES.map(c => ({ ...c, count: stats[c.key] || 0 }));

  return (
    <Card>
      <CardHeader
        dense
        icon={BarChart2}
        title="Token distribution"
        actions={
          <>
            <Badge tone="cyan" size="xs" mono>{stats.totalTokens} tokens</Badge>
            {stats.totalErrors > 0 && (
              <Badge tone="rose" size="xs" mono dot>{stats.totalErrors} errors</Badge>
            )}
          </>
        }
      />
      <CardBody className="space-y-4">
        {/* Stacked composition bar */}
        <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-ink-950 ring-1 ring-inset ring-ink-700/60">
          {rows.map(cat =>
            cat.count > 0 && (
              <div
                key={cat.key}
                title={`${cat.label}: ${cat.count} (${((cat.count / total) * 100).toFixed(1)}%)`}
                style={{ width: `${(cat.count / total) * 100}%` }}
                className={cn('h-full transition-[width] duration-700 ease-out', cat.bar)}
              />
            )
          )}
          {rows.every(r => r.count === 0) && <div className="h-full w-full bg-ink-800" />}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {rows.map(cat => {
            const pct = (cat.count / total) * 100;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <span className={cn('h-1.5 w-1.5 rounded-full', cat.bar)} />
                    {cat.label}
                  </span>
                  <span className={cn('font-mono text-xs font-bold tabular-nums', cat.text)}>{cat.count}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-ink-950">
                  <div
                    className={cn('h-full rounded-full transition-[width] duration-700 ease-out', cat.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-right font-mono text-[10px] text-slate-600">{pct.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
