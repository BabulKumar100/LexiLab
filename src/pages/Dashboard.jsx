import React from 'react';
import { useApp } from '../context/AppContext';
import { CodeEditor } from '../components/editor/CodeEditor';
import { TokenTable } from '../components/tokens/TokenTable';
import { TokenChart } from '../components/dashboard/TokenChart';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatTile } from '../components/ui/StatTile';
import {
  Binary,
  Database, 
  KeyRound, 
  Cpu, 
  Hash, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { analysis } = useApp();
  const navigate = useNavigate();
  const { stats } = analysis;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Sparkles}
        kicker="Compiler Design Studio"
        title="Interactive Lexical Analyzer & Tokenizer"
        description="Scan C-like source code into meaningful tokens, explore deterministic finite automata transitions, inspect the symbol table, and diagnose lexical errors in real-time."
        actions={
          <>
            <Badge tone="cyan" dot mono className="hidden sm:inline-flex">
              {stats.totalTokens} tokens / {stats.totalLines} lines
            </Badge>
            <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/step-trace')}>
              <span>Step-by-Step Scanner</span>
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dfa')}>
              DFA Visualizer
            </Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Total Tokens"
          value={stats.totalTokens}
          icon={Binary}
          tone="cyan"
          hint={`${stats.totalLines} lines`}
          onClick={() => navigate('/tokens')}
        />
        <StatTile
          label="Identifiers"
          value={stats.totalIdentifiers}
          icon={Database}
          tone="blue"
          hint="Symbol table"
          onClick={() => navigate('/symbols')}
        />
        <StatTile
          label="Keywords"
          value={stats.totalKeywords}
          icon={KeyRound}
          tone="purple"
          hint="Reserved words"
          onClick={() => navigate('/tokens')}
        />
        <StatTile
          label="Literals"
          value={stats.totalLiterals}
          icon={Hash}
          tone="amber"
          hint="Nums, strings, chars"
          onClick={() => navigate('/tokens')}
        />
        <StatTile
          label="Operators"
          value={stats.totalOperators}
          icon={Cpu}
          tone="emerald"
          hint="Maximal munch"
          onClick={() => navigate('/tokens')}
        />
        <StatTile
          label="Lexical Errors"
          value={stats.totalErrors}
          icon={AlertTriangle}
          tone={stats.totalErrors > 0 ? 'rose' : 'emerald'}
          hint={stats.totalErrors > 0 ? 'Requires fix' : 'Clean code'}
          onClick={() => navigate('/errors')}
        />
      </div>

      {/* Two-Column Workbench (Code Editor + Token Table) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <CodeEditor className="h-[580px] xl:col-span-7" />
        <TokenTable isCompact={true} className="h-[580px] xl:col-span-5" />
      </div>

      {/* Token Distribution Chart */}
      <TokenChart />
    </div>
  );
}
