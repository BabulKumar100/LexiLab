import React from 'react';
import { useApp } from '../context/AppContext';
import { TokenChart } from '../components/dashboard/TokenChart';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, MeterBar } from '../components/ui/Badge';
import { StatTile, Table, Td } from '../components/ui/StatTile';
import { BarChart3, Sparkles } from 'lucide-react';

export function Statistics() {
  const { analysis } = useApp();
  const { stats, tokens } = analysis;

  // Compute top identifier frequencies
  const identCounts = {};
  tokens.filter(t => t.type === 'IDENTIFIER').forEach(t => {
    identCounts[t.lexeme] = (identCounts[t.lexeme] || 0) + 1;
  });

  const sortedIdents = Object.entries(identCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        kicker="Analytics"
        title="Scanner Metrics & Lexical Statistics"
        description="Quantitative analysis of token frequencies, lexical density, scanning latency, and character distributions."
        actions={
          <Badge tone="cyan" dot mono>
            {stats.totalTokens} tokens in stream
          </Badge>
        }
      />

      {/* Numerical Stats Grid */}
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Scan Duration"
          value={stats.scanDurationMs}
          unit="ms"
          hint="O(N) linear time pass"
          tone="cyan"
        />
        <StatTile
          label="Source Characters"
          value={stats.totalChars}
          unit="chars"
          hint={`Across ${stats.totalLines} lines`}
          tone="blue"
        />
        <StatTile
          label="Total Tokens"
          value={stats.totalTokens}
          unit="tokens"
          hint={`Avg ${stats.totalLines > 0 ? (stats.totalTokens / stats.totalLines).toFixed(1) : 0} tokens/line`}
          tone="emerald"
        />
        <StatTile
          label="Lexical Compression"
          value={stats.totalTokens > 0 ? (stats.totalChars / stats.totalTokens).toFixed(1) : 0}
          unit="chars/token"
          hint="Mean lexeme width"
          tone="purple"
        />
      </div>

      {/* Distribution Chart */}
      <TokenChart />

      {/* Most Frequent Identifiers Table */}
      <Card>
        <CardHeader
          icon={Sparkles}
          title="Identifier Frequency Distribution"
          subtitle="User-defined names ranked by occurrences in the current scan"
          actions={
            <Badge tone="slate" mono size="xs">
              {sortedIdents.length} unique
            </Badge>
          }
        />
        {sortedIdents.length === 0 ? (
          <EmptyState
            title="No identifiers found"
            description="No user-defined identifiers present in current code."
          />
        ) : (
          <Table
            head={[
              { label: 'Identifier' },
              { label: 'Frequency', align: 'right' },
              { label: 'Share', className: 'w-40' }
            ]}
          >
            {sortedIdents.map(([ident, count]) => (
              <tr key={ident} className="row-hover">
                <Td mono className="font-semibold text-cyan-300">
                  {ident}
                </Td>
                <Td align="right" mono className="text-slate-200">
                  {count} {count === 1 ? 'occurrence' : 'occurrences'}
                </Td>
                <Td>
                  <MeterBar value={count} max={sortedIdents[0][1]} tone="cyan" />
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
