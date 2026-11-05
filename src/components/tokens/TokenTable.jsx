import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TokenBadge } from './TokenBadge';
import { TOKEN_TYPES } from '../../engine/tokenTypes';
import { Search, Download, Eye, MessageSquare, ScanSearch } from 'lucide-react';
import { exportTokensToCSV } from '../../utils/exportCSV';
import { Card } from '../ui/Card';
import { Table, Td } from '../ui/StatTile';
import { Button, IconButton } from '../ui/Button';
import { EmptyState } from '../ui/PageHeader';
import { cn } from '../../utils/cn';

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'KEYWORD', label: 'Keywords' },
  { id: 'IDENTIFIER', label: 'Identifiers' },
  { id: 'LITERAL', label: 'Literals' },
  { id: 'OPERATOR', label: 'Operators' },
  { id: 'SEPARATOR', label: 'Separators' },
  { id: 'COMMENT', label: 'Comments' },
  { id: 'ERROR', label: 'Errors' },
];

const LITERAL_TYPES = [
  TOKEN_TYPES.INTEGER_LITERAL,
  TOKEN_TYPES.FLOAT_LITERAL,
  TOKEN_TYPES.STRING_LITERAL,
  TOKEN_TYPES.CHAR_LITERAL,
];

function matchesCategory(token, category) {
  switch (category) {
    case 'KEYWORD':
      return token.type === TOKEN_TYPES.KEYWORD;
    case 'IDENTIFIER':
      return token.type === TOKEN_TYPES.IDENTIFIER;
    case 'SEPARATOR':
      return token.type === TOKEN_TYPES.SEPARATOR;
    case 'ERROR':
      return token.type === TOKEN_TYPES.ERROR;
    case 'COMMENT':
      return token.type === TOKEN_TYPES.COMMENT;
    case 'OPERATOR':
      return token.type.includes('OPERATOR');
    case 'LITERAL':
      return LITERAL_TYPES.includes(token.type);
    default:
      return true;
  }
}

export function TokenTable({ isCompact = false, className }) {
  const {
    analysis,
    setActiveToken,
    hoveredTokenId,
    setHoveredTokenId,
    includeComments,
    setIncludeComments,
    notify,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const hasComments = analysis.tokens.some((t) => t.type === TOKEN_TYPES.COMMENT);
  const categories = CATEGORIES.filter((c) => c.id !== 'COMMENT' || hasComments);

  const filteredTokens = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return analysis.tokens.filter((token) => {
      if (!matchesCategory(token, selectedCategory)) return false;
      if (!query) return true;
      return (
        token.lexeme.toLowerCase().includes(query) ||
        token.type.toLowerCase().includes(query) ||
        (token.opName && token.opName.toLowerCase().includes(query))
      );
    });
  }, [analysis.tokens, selectedCategory, searchTerm]);

  const head = [
    { label: '#', align: 'center', className: 'w-12' },
    { label: 'Lexeme' },
    { label: 'Token Type' },
    { label: 'Ln', align: 'center', className: 'w-14' },
    { label: 'Col', align: 'center', className: 'w-14' },
    ...(isCompact ? [] : [{ label: 'Details' }]),
    { label: '', align: 'center', className: 'w-12' },
  ];

  return (
    <Card bevel={false} className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex flex-col gap-2.5 border-b border-ink-700/60 bg-ink-900/40 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:w-56 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lexeme, type or operator..."
              className="w-full rounded-xl border border-ink-700/70 bg-ink-950/70 py-1.5 pr-3 pl-9 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          <IconButton
            icon={Download}
            label="Download token table as CSV"
            onClick={() => {
              exportTokensToCSV(analysis.tokens);
              notify('Token table exported as CSV', 'success');
            }}
          />

          <Button
            size="sm"
            variant={includeComments ? 'outline' : 'secondary'}
            icon={MessageSquare}
            title={
              includeComments
                ? 'Discard comments (standard compiler behaviour)'
                : 'Retain comments as COMMENT tokens'
            }
            onClick={() => {
              setIncludeComments(!includeComments);
              notify(
                !includeComments
                  ? 'Comments now shown as tokens'
                  : 'Comments skipped (standard compiler default)',
                'info'
              );
            }}
          >
            <span className="hidden sm:inline">
              {includeComments ? 'Comments: visible' : 'Comments: skipped'}
            </span>
          </Button>
        </div>

        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-lg px-2.5 py-1 text-2xs font-semibold whitespace-nowrap transition-all duration-200',
                selectedCategory === cat.id
                  ? 'bg-grad-brand text-white shadow-sm'
                  : 'text-slate-400 hover:bg-ink-800 hover:text-slate-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {filteredTokens.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No tokens match this filter"
            description={
              analysis.tokens.length === 0
                ? 'The scanner produced no tokens. Write some C code in the editor.'
                : 'Try a different category, or clear the search text.'
            }
          />
        ) : (
          <Table head={head} className="font-mono">
            {filteredTokens.map((token) => {
              const isHovered = hoveredTokenId === token.id;
              const details =
                token.opName || token.sepName || (token.isError ? token.errorDetails?.message : '');

              return (
                <tr
                  key={token.id}
                  onMouseEnter={() => setHoveredTokenId(token.id)}
                  onMouseLeave={() => setHoveredTokenId(null)}
                  onClick={() => setActiveToken(token)}
                  className={cn(
                    'row-hover cursor-pointer group',
                    isHovered && 'bg-blue-500/[0.12]',
                    token.isError && 'bg-rose-500/[0.07]'
                  )}
                >
                  <Td align="center" className="text-2xs text-slate-600">
                    {token.id}
                  </Td>

                  <Td>
                    <span className="rounded-md border border-ink-700/70 bg-ink-950/70 px-1.5 py-0.5 text-xs font-bold text-cyan-300 break-all transition-colors group-hover:border-cyan-500/40">
                      {token.lexeme}
                    </span>
                  </Td>

                  <Td>
                    <TokenBadge type={token.type} size="xs" />
                  </Td>

                  <Td align="center" className="text-slate-400 tabular-nums">
                    {token.line}
                  </Td>

                  <Td align="center" className="text-slate-400 tabular-nums">
                    {token.column}
                  </Td>

                  {!isCompact && (
                    <Td className="max-w-xs truncate font-sans text-xs text-slate-400">
                      {details || <span className="text-slate-700">—</span>}
                    </Td>
                  )}

                  <Td align="center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveToken(token);
                      }}
                      title="Inspect token"
                      aria-label={`Inspect token ${token.id}`}
                      className="rounded-md p-1 text-slate-500 transition-colors hover:bg-ink-800 hover:text-cyan-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-ink-700/60 bg-ink-900/50 px-3 py-1.5 text-2xs text-slate-500 select-none">
        <span>
          Showing <span className="font-mono font-bold text-slate-300">{filteredTokens.length}</span> of{' '}
          <span className="font-mono font-bold text-slate-300">{analysis.tokens.length}</span> tokens
        </span>
        <span className={cn('font-mono', includeComments ? 'text-cyan-400' : 'text-slate-500')}>
          {includeComments ? 'comments retained' : 'comments skipped'}
        </span>
      </div>
    </Card>
  );
}
