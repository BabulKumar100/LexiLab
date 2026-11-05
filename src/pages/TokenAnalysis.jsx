import React from 'react';
import { TokenTable } from '../components/tokens/TokenTable';
import { useApp } from '../context/AppContext';
import { Binary, Download, Info } from 'lucide-react';
import { exportTokensToCSV } from '../utils/exportCSV';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { CountPill } from '../components/ui/Badge';
import { Callout } from '../components/ui/StatTile';

export function TokenAnalysis() {
  const { analysis, notify } = useApp();
  const { stats } = analysis;

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Binary}
        kicker="Scanner Output"
        title="Token Stream Analysis"
        description="Comprehensive stream of lexical tokens identified by the scanner with line/column coordinates and semantic details."
        actions={
          <Button
            variant="primary"
            icon={Download}
            onClick={() => {
              exportTokensToCSV(analysis.tokens);
              notify('Exported tokens to CSV file', 'success');
            }}
          >
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Compact Stat Strip */}
      <div className="panel-flat stagger flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Total</span>
          <CountPill value={stats.totalTokens} tone="cyan" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Keywords</span>
          <CountPill value={stats.totalKeywords} tone="indigo" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Identifiers</span>
          <CountPill value={stats.totalIdentifiers} tone="blue" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Literals</span>
          <CountPill value={stats.totalLiterals} tone="amber" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Operators</span>
          <CountPill value={stats.totalOperators} tone="emerald" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Separators</span>
          <CountPill value={stats.totalSeparators} tone="slate" />
        </span>
        <span className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">Errors</span>
          <CountPill value={stats.totalErrors} tone={stats.totalErrors > 0 ? 'rose' : 'emerald'} />
        </span>
      </div>

      {/* Main Full-Width Token Table */}
      <TokenTable isCompact={false} className="h-[650px] xl:h-[calc(100vh_-_20rem)] xl:min-h-[480px]" />

      {/* Info card */}
      <Callout tone="info" icon={Info} title="Tip for Viva">
        In compiler construction, a <em className="text-cyan-200 not-italic">Token</em> represents an abstract syntactic category (e.g. KEYWORD, IDENTIFIER), whereas a{' '}
        <em className="text-cyan-200 not-italic">Lexeme</em> is the exact character sequence from the source code matching that pattern (e.g. <code>int</code>, <code>count</code>).
      </Callout>
    </div>
  );
}
