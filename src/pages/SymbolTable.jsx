import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Copy, Search, Sparkles, BookOpen, Hash, Info, Boxes, ScanSearch } from 'lucide-react';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, CountPill } from '../components/ui/Badge';
import { StatTile, Table, Td, Callout } from '../components/ui/StatTile';
import { copyText } from '../utils/clipboard';
import { cn } from '../utils/cn';

const HEAD = [
  { label: '#', align: 'center', className: 'w-12' },
  { label: 'Identifier Name' },
  { label: 'Lexical Category' },
  { label: 'Semantic Preview Hint' },
  { label: 'Inferred Type' },
  { label: 'Virtual Address' },
  { label: 'Occurrences', align: 'center', className: 'w-24' },
  { label: 'Referenced Lines' },
  { label: 'First Seen' },
];

export function SymbolTable() {
  const { analysis, notify } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const symbols = analysis.symbolTable || [];

  const filteredSymbols = symbols.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.semanticHint && s.semanticHint.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.dataType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyMarkdown = async () => {
    if (filteredSymbols.length === 0) return;
    const header = '| # | Identifier | Lexical Category | Semantic Hint | Inferred Type | Occurrences | Lines |\n|---|---|---|---|---|---|---|';
    const rows = filteredSymbols.map((s, i) => 
      `| ${i + 1} | \`${s.name}\` | ${s.category} | ${s.semanticHint || 'Variable'} | ${s.dataType} | ${s.occurrences} | ${s.lines.join(', ')} |`
    ).join('\n');
    const ok = await copyText(`${header}\n${rows}`);
    notify(
      ok ? 'Symbol table copied to clipboard as Markdown!' : 'Clipboard blocked by the browser — select the table and copy manually',
      ok ? 'success' : 'warn'
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Database}
        kicker="Compiler Phase 1 Output"
        title="Extended Symbol Table / Semantic Metadata"
        description="Stores all user-defined identifiers discovered by the scanner, with line tracking, occurrence metrics, and preliminary semantic attributes."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Copy}
            onClick={handleCopyMarkdown}
            disabled={symbols.length === 0}
          >
            Copy as Markdown
          </Button>
        }
      />

      <Callout
        tone="note"
        icon={Info}
        title="Important Compiler Design Concept for Viva:"
        className="animate-fade-up"
      >
        <p className="text-balance leading-relaxed">
          In pure <strong>Lexical Analysis</strong>, all variable and function names are formally classified as <strong>IDENTIFIERS</strong>. The lexer does not resolve function calls or enforce type correctness. The inferred data types (<code>int</code>, <code>float</code>) and semantic call hints shown below are an <strong>Extended Symbol Table Educational Preview</strong>, demonstrating how the Symbol Table is enriched during subsequent <em>Syntax &amp; Semantic Analysis</em> phases.
        </p>
      </Callout>

      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Identifier Tokens"
          value={analysis.stats?.totalIdentifiers ?? 0}
          hint="Occurrences scanned"
          icon={Database}
          tone="blue"
        />
        <StatTile
          label="Function Call Hints"
          value={symbols.filter(s => s.semanticHint?.includes('Function')).length}
          hint="Semantic preview only"
          icon={Sparkles}
          tone="purple"
        />
        <StatTile
          label="Variable Identifiers"
          value={symbols.filter(s => !s.semanticHint?.includes('Function')).length}
          hint="No call pattern detected"
          icon={Boxes}
          tone="emerald"
        />
        <StatTile
          label="Unique Identifiers"
          value={symbols.length}
          hint="Distinct table entries"
          icon={Hash}
          tone="cyan"
        />
      </div>

      <Card bevel={false} className="flex max-h-[calc(100dvh-17rem)] flex-col overflow-hidden">
        <div className="flex shrink-0 flex-col gap-2.5 border-b border-ink-700/60 bg-ink-900/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:w-80 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search identifier name, hint, or type..."
              className="w-full rounded-xl border border-ink-700/70 bg-ink-950/70 py-1.5 pl-9 pr-3 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-500">
            <Badge tone="blue" size="xs" mono>IDENTIFIER</Badge>
            <span className="hidden sm:inline">only category the lexer produces</span>
            <CountPill value={filteredSymbols.length} tone="cyan" />
          </div>
        </div>

        {filteredSymbols.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No identifiers detected in source code"
            description="Define variables or functions in the editor, or clear the search text to see the whole table."
          />
        ) : (
          <Table head={HEAD}>
            {filteredSymbols.map(sym => {
              const isFunctionHint = sym.semanticHint?.includes('Function');

              return (
                <tr
                  key={sym.name}
                  className={cn(
                    'row-hover',
                    isFunctionHint ? 'bg-purple-500/[0.05]' : 'bg-emerald-500/[0.035]'
                  )}
                >
                  <Td align="center" mono className="text-2xs text-slate-600">
                    {sym.id}
                  </Td>

                  <Td>
                    <span className="break-all rounded-md border border-ink-700/70 bg-ink-950/70 px-1.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                      {sym.name}
                    </span>
                  </Td>

                  <Td>
                    <Badge tone="blue" size="xs" mono>IDENTIFIER</Badge>
                  </Td>

                  <Td>
                    <Badge tone={isFunctionHint ? 'purple' : 'emerald'} size="xs">
                      {sym.semanticHint || 'Variable'}
                    </Badge>
                  </Td>

                  <Td mono className="text-indigo-300">
                    {sym.dataType}
                  </Td>

                  <Td mono className="whitespace-nowrap text-2xs text-slate-400">
                    {sym.memoryAddress}
                  </Td>

                  <Td align="center">
                    <CountPill value={sym.occurrences} tone={isFunctionHint ? 'purple' : 'cyan'} />
                  </Td>

                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {sym.lines.map(line => (
                        <span key={line} className="kbd">L{line}</span>
                      ))}
                    </div>
                  </Td>

                  <Td mono className="whitespace-nowrap text-2xs text-slate-400">
                    Ln {sym.firstSeen.line}, Col {sym.firstSeen.column}
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}

        <div className="flex shrink-0 items-center justify-between border-t border-ink-700/60 bg-ink-900/50 px-3 py-1.5 text-2xs text-slate-500 select-none">
          <span>
            Showing <span className="font-mono font-bold text-slate-300">{filteredSymbols.length}</span> of{' '}
            <span className="font-mono font-bold text-slate-300">{symbols.length}</span> unique identifiers
          </span>
          <span className="font-mono">virtual addresses are simulated</span>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={BookOpen}
          title="Viva Question: Why is the Symbol Table crucial across compiler phases?"
          dense
        />
        <CardBody className="text-xs leading-relaxed text-slate-400">
          <p className="text-balance">
            The Symbol Table is created and seeded by the Lexical Analyzer upon identifying new lexemes. However, it persists throughout the entire compiler backend. The Syntax Analyzer adds scope blocks, the Semantic Analyzer enforces type compatibility, the Intermediate Code Generator binds three-address temporary variables, and the Code Generator maps these entries to physical CPU registers and stack frames.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge tone="cyan" size="xs">Lexical</Badge>
            <span className="text-slate-700">/</span>
            <Badge tone="blue" size="xs">Syntax</Badge>
            <span className="text-slate-700">/</span>
            <Badge tone="indigo" size="xs">Semantic</Badge>
            <span className="text-slate-700">/</span>
            <Badge tone="purple" size="xs">IR Generation</Badge>
            <span className="text-slate-700">/</span>
            <Badge tone="emerald" size="xs">Code Generation</Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
