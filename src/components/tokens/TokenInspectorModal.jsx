import React, { useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TOKEN_METADATA, TOKEN_TYPES } from '../../engine/tokenTypes';
import { SORTED_OPERATORS, SEPARATORS } from '../../engine/operators';
import { REGEX_PATTERNS } from '../../data/regexRules';
import { TokenBadge } from './TokenBadge';
import { Badge } from '../ui/Badge';
import { Callout, InfoRow } from '../ui/StatTile';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { X, Regex, Binary, Compass, ShieldAlert, Check, TriangleAlert, Braces } from 'lucide-react';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const byTokenType = (t) => REGEX_PATTERNS.find(p => p.tokenType === t);

// Operators and separators are a finite alternation, not a written regex, so the
// pattern is derived from the scanner's own tables to stay in sync with the engine.
function setPattern(ops, label) {
  if (ops.length === 0) return null;
  const sorted = [...ops].sort((a, b) => b.length - a.length);
  return {
    name: label,
    regexString: `^(${sorted.map(escapeRe).join('|')})$`,
    regex: new RegExp(`^(${sorted.map(escapeRe).join('|')})$`),
    formalGrammar: `${label.split(' ')[0].toLowerCase()} -> ${sorted.join(' | ')}`,
    description:
      'A fixed set of terminal symbols. The scanner applies maximal munch, so the longest entry in this alternation that prefixes the input is emitted as one token.',
    dfaStatesCount: null
  };
}

function patternForToken(token) {
  if (!token) return null;
  const { type, lexeme = '' } = token;

  if (type === TOKEN_TYPES.INTEGER_LITERAL && /^0[xX]/.test(lexeme)) return byTokenType('INTEGER_LITERAL (Hex)');
  if (type === TOKEN_TYPES.KEYWORD || type === TOKEN_TYPES.IDENTIFIER) return byTokenType('IDENTIFIER');
  const direct = byTokenType(type);
  if (direct) return direct;

  if (type && type.includes('OPERATOR')) {
    return setPattern(SORTED_OPERATORS.filter(o => o.type === type).map(o => o.op), `${TOKEN_METADATA[type]?.label || type} set`);
  }
  if (type === TOKEN_TYPES.SEPARATOR) {
    return setPattern(Object.keys(SEPARATORS), 'Separator set');
  }
  return null;
}

export function TokenInspectorModal() {
  const { activeToken, setActiveToken } = useApp();

  const close = useMemo(() => () => setActiveToken(null), [setActiveToken]);

  useEffect(() => {
    if (!activeToken) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveToken(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeToken, setActiveToken]);

  if (!activeToken) return null;

  const meta = TOKEN_METADATA[activeToken.type] || {};
  const pattern = patternForToken(activeToken);
  const lexeme = activeToken.lexeme ?? '';
  const accepts = pattern?.regex ? pattern.regex.test(lexeme) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Token ${activeToken.id} inspector`}>
      <div className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm animate-fade-in" onClick={close} />

      <div className="panel bevel-top relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-glow animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-ink-700/70 bg-ink-850/70 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
              <Binary className="h-4 w-4" />
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="font-mono">Token #{activeToken.id}</span>
                <TokenBadge type={activeToken.type} size="xs" />
              </h3>
              <p className="text-2xs text-slate-500">Lexical grammar, DFA state and source position</p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close inspector"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-ink-700/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="scroll-slim space-y-4 overflow-y-auto p-5">
          {/* Lexeme */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <span>Raw lexeme</span>
              <span className="font-mono normal-case tracking-normal">{lexeme.length} chars</span>
            </div>
            <div className="select-all break-all rounded-xl border border-ink-700/70 bg-ink-950/80 p-3 font-mono text-base font-bold text-cyan-300 shadow-inset">
              {lexeme}
            </div>
          </div>

          {/* Facts */}
          <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 px-4 py-1">
            <InfoRow label="Source position">
              <span className="font-mono">
                line {activeToken.line}, col {activeToken.column}
                {activeToken.endLine ? ` → line ${activeToken.endLine}, col ${activeToken.endColumn}` : ''}
              </span>
            </InfoRow>
            {activeToken.startIndex != null && (
              <InfoRow label="Input offset">
                <span className="font-mono">[{activeToken.startIndex}, {activeToken.endIndex})</span>
              </InfoRow>
            )}
            <InfoRow label="Category" tone="cyan">
              {meta.label || activeToken.type}
            </InfoRow>
            {activeToken.base && (
              <InfoRow label="Numeric base">
                <span className="font-mono text-amber-300">{activeToken.base}</span>
              </InfoRow>
            )}
            {activeToken.opName && (
              <InfoRow label="Operator semantics" tone="emerald">
                {activeToken.opName}
              </InfoRow>
            )}
            {activeToken.sepName && (
              <InfoRow label="Separator function">{activeToken.sepName}</InfoRow>
            )}
          </div>

          {/* Formal pattern */}
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <Regex className="h-3.5 w-3.5 text-blue-400" />
              <span>Pattern &amp; formal grammar</span>
              {accepts !== null && (
                <Badge tone={accepts ? 'emerald' : 'rose'} size="xs" icon={accepts ? Check : TriangleAlert} className="ml-auto">
                  {accepts ? 'lexeme accepted' : 'lexeme rejected'}
                </Badge>
              )}
            </p>

            {pattern ? (
              <div className="space-y-2.5 rounded-xl border border-ink-700/70 bg-ink-900/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-300">{pattern.name}</span>
                  {pattern.dfaStatesCount != null && (
                    <Badge tone="indigo" size="xs" mono>
                      {pattern.dfaStatesCount} DFA states
                    </Badge>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-ink-700/60 bg-ink-950/80 px-3 py-2">
                  <code className="whitespace-pre font-mono text-xs text-cyan-300">{pattern.regexString}</code>
                </div>

                {pattern.formalGrammar && (
                  <div className="rounded-lg border border-ink-700/60 bg-ink-950/50 px-3 py-2">
                    <p className="mb-1 flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-slate-500">
                      <Braces className="h-3 w-3" />
                      <span>Grammar (BNF)</span>
                    </p>
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-300">{pattern.formalGrammar}</pre>
                  </div>
                )}

                <p className="text-[11.5px] leading-relaxed text-slate-400">{pattern.description}</p>

                <div className="flex flex-wrap gap-2 pt-0.5">
                  <Badge tone="emerald" size="xs" mono>
                    matches: {pattern.exampleMatch || '-'}
                  </Badge>
                  {pattern.exampleFail && (
                    <Badge tone="rose" size="xs" mono>
                      rejects: {pattern.exampleFail}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <Callout tone="note" icon={Compass}>
                No accepting pattern is published for <code>{activeToken.type}</code>. Keywords are resolved by table
                lookup after the identifier DFA accepts, and preprocessor directives are consumed to end-of-line.
              </Callout>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <Compass className="h-3.5 w-3.5 text-blue-400" />
              <span>Role in the compiler</span>
            </p>
            <p className="rounded-xl border border-ink-700/70 bg-ink-900/40 p-3 text-xs leading-relaxed text-slate-400">
              {meta.description || 'Recognized during the deterministic finite automata scanning pass.'}
            </p>
            {activeToken.type === TOKEN_TYPES.KEYWORD && (
              <p className="px-1 text-2xs italic text-slate-500">
                Lexically this lexeme also satisfies the identifier pattern; the reserved-word table is what demotes it to KEYWORD.
              </p>
            )}
          </div>

          {/* Diagnostics */}
          {activeToken.isError && (
            <Callout tone="danger" icon={ShieldAlert} title="Lexical diagnostics">
              <p className="mb-1.5 text-[12px]">{activeToken.errorDetails?.message}</p>
              <p className="font-mono text-2xs text-rose-300/90">
                Fix: {activeToken.errorDetails?.suggestion}
              </p>
            </Callout>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-ink-700/70 bg-ink-850/60 px-5 py-3">
          <p className={cn('text-2xs', accepts === false ? 'text-rose-300/80' : 'text-slate-500')}>
            {accepts === null
              ? 'Position and category only — this token class has no published pattern.'
              : accepts
                ? 'The displayed pattern accepts this exact lexeme.'
                : 'This lexeme fails the pattern — that is why the scanner flagged it.'}
          </p>
          <Button variant="primary" size="sm" onClick={close}>
            Close inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
