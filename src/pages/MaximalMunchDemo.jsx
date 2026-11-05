import React, { useState } from 'react';
import { Lexer } from '../engine/lexer';
import { TokenBadge } from '../components/tokens/TokenBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge, MeterBar } from '../components/ui/Badge';
import { Callout, StatTile } from '../components/ui/StatTile';
import { cn } from '../utils/cn';
import {
  ArrowRight,
  Hash,
  Lightbulb,
  Minus,
  MoveRight,
  Ruler,
  ScanLine,
  Scissors,
  Split,
  Trophy,
} from 'lucide-react';

/* Character cells are tinted by the token that actually consumed them. */
const CELL_TONE = {
  KEYWORD: 'border-indigo-500/45 bg-indigo-500/15 text-indigo-100',
  IDENTIFIER: 'border-cyan-500/45 bg-cyan-500/15 text-cyan-100',
  INTEGER_LITERAL: 'border-amber-500/45 bg-amber-500/15 text-amber-100',
  FLOAT_LITERAL: 'border-amber-500/45 bg-amber-500/15 text-amber-100',
  STRING_LITERAL: 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100',
  CHAR_LITERAL: 'border-teal-500/45 bg-teal-500/15 text-teal-100',
  SEPARATOR: 'border-slate-500/40 bg-slate-500/12 text-slate-200',
  PREPROCESSOR: 'border-rose-500/45 bg-rose-500/15 text-rose-100',
  COMMENT: 'border-slate-600/40 bg-slate-600/12 text-slate-400',
  ERROR: 'border-rose-500/60 bg-rose-500/20 text-rose-100',
};
const OPERATOR_CELL = 'border-blue-500/45 bg-blue-500/15 text-blue-100';
const BLANK_CELL = 'border-ink-700/60 bg-ink-900/50 text-slate-600';

const cellTone = (type) => CELL_TONE[type] || OPERATOR_CELL;

/* Every proper prefix of an operator, longest first: the candidates the scanner
   weighed before committing. Formatting helper only - engine output untouched. */
const shorterCandidates = (op) => {
  const list = [];
  for (let k = op.length - 1; k >= 1; k -= 1) list.push(op.slice(0, k));
  return list;
};

/* Preset labels already start with the expression; drop the duplication in the
   grid caption without ever altering the stored wording. */
const presetCaption = (preset) =>
  preset.label.startsWith(preset.expr)
    ? preset.label
        .slice(preset.expr.length)
        .trim()
        .replace(/^[([{ ]+/, '')
        .replace(/[)\]} ]+$/, '')
    : preset.label;

export function MaximalMunchDemo() {
  const [testExpr, setTestExpr] = useState('a+++b');
  const lexer = new Lexer();

  const presets = [
    {
      label: 'a+++b (Increment vs Addition)',
      expr: 'a+++b',
      explanation: 'Maximal Munch scans left-to-right. Encountering "+", it looks ahead at the second "+". The sequence "++" forms a valid 2-character operator, so it consumes both greedily before considering "+". Result: (a++) + b.'
    },
    {
      label: 'x>>=1 (3-Char Shift Assignment)',
      expr: 'x>>=1',
      explanation: 'With 2-character lookahead, the scanner checks if ">" is followed by ">=" to form ">>=". It matches the longest 3-character operator rather than splitting into > and > and =.'
    },
    {
      label: 'ptr->value (Pointer Indirection)',
      expr: 'ptr->value',
      explanation: 'Encountering "-" followed by ">", the scanner selects "->" (Structure Pointer Dereference) rather than subtraction followed by greater-than comparison.'
    },
    {
      label: 'flag <= max_val (Relational)',
      expr: 'flag <= max_val',
      explanation: 'Encountering "<" followed by "=", the scanner binds "<=" (Less Than Or Equal) rather than two isolated tokens.'
    },
    {
      label: 'a---b (Decrement vs Subtraction)',
      expr: 'a---b',
      explanation: 'Scans "--" (Decrement) first, leaving "-" (Subtraction). Evaluated as: (a--) - b.'
    }
  ];

  const result = lexer.tokenize(testExpr);
  const activePreset = presets.find(p => p.expr === testExpr);

  // ---- presentation-only projections of the token stream computed above ----
  const ownerAt = (i) =>
    result.tokens.find(
      (t) =>
        typeof t.startIndex === 'number' &&
        typeof t.endIndex === 'number' &&
        i >= t.startIndex &&
        i < t.endIndex
    );

  const lastToken = result.tokens[result.tokens.length - 1];
  const readHead = lastToken && typeof lastToken.endIndex === 'number' ? lastToken.endIndex : 0;

  const greedyWins = result.tokens.filter(
    (t) => t.type && t.type.includes('OPERATOR') && t.lexeme.length > 1
  );
  const longestMunch = greedyWins.reduce((n, t) => Math.max(n, t.lexeme.length), 0);

  // Adjacent operator tokens form one ambiguous run ("++" then "+" inside "+++").
  const opRuns = [];
  for (const tok of result.tokens) {
    const isOperator = !!(tok.type && tok.type.includes('OPERATOR'));
    const tail = opRuns[opRuns.length - 1];
    if (isOperator && tail && tail[tail.length - 1].endIndex === tok.startIndex) {
      tail.push(tok);
    } else if (isOperator) {
      opRuns.push([tok]);
    }
  }
  const splitRuns = opRuns.filter((run) => run.length > 1);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader
        icon={Scissors}
        kicker="Core Compiler Principle"
        title="Maximal Munch (Longest Match Rule) Interactive Sandbox"
        description="Explore how deterministic scanners resolve ambiguous character sequences by greedily choosing the longest matching valid token."
        actions={
          <Badge tone="cyan" icon={Trophy}>
            Longest match wins
          </Badge>
        }
      />

      {/* Preset Buttons */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={Ruler}
          title="Select Ambiguous Expression Demo"
          subtitle="Each preset re-runs the real lexer and rebuilds the character map below."
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-2.5 stagger sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((p, i) => {
              const isActive = testExpr === p.expr;
              return (
                <button
                  key={i}
                  onClick={() => setTestExpr(p.expr)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-[.98]',
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-glow'
                      : 'border-ink-700 bg-ink-900/60 text-slate-300 hover:border-ink-600 hover:bg-ink-800 hover:text-slate-100'
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold tracking-tight">{p.expr}</span>
                    {isActive && <Badge tone="cyan" size="xs">active</Badge>}
                  </span>
                  <span className="mt-1 block truncate text-2xs uppercase tracking-[0.12em] text-slate-500">
                    {presetCaption(p)}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Interactive Input Box */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={Hash}
          title="Custom Test Expression"
          subtitle="Type any sequence of symbols - the token stream and character map recompute live."
          actions={<Badge tone="slate" mono size="xs">{testExpr.length} chars</Badge>}
        />
        <CardBody className="space-y-4">
          <input
            type="text"
            value={testExpr}
            onChange={(e) => setTestExpr(e.target.value)}
            placeholder="e.g. a+++++b"
            spellCheck={false}
            className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-2.5 font-mono text-sm text-cyan-300 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile label="Input" value={testExpr.length} unit="chars" icon={Hash} tone="slate" />
            <StatTile label="Emitted" value={result.tokens.length} unit="tokens" icon={MoveRight} tone="cyan" />
            <StatTile
              label="Longest munch"
              value={longestMunch}
              unit="chars"
              hint={longestMunch > 1 ? 'greedy operator span' : 'no multi-char operator'}
              icon={Trophy}
              tone={longestMunch > 1 ? 'emerald' : 'slate'}
            />
            <StatTile
              label="Split runs"
              value={splitRuns.length}
              unit="runs"
              hint={splitRuns.length ? 'operator run divided' : 'nothing divided'}
              icon={Split}
              tone={splitRuns.length ? 'amber' : 'slate'}
            />
          </div>

          {/* Character-by-character consumption map */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionLabel>Character cells - who ate what</SectionLabel>
              <span className="flex items-center gap-3 text-2xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500/25 ring-1 ring-cyan-400/70" />
                  last munch
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-amber-400/80 bg-amber-500/10" />
                  read head
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm border border-ink-700 bg-ink-900" />
                  skipped
                </span>
              </span>
            </div>

            <div className="scroll-slim overflow-x-auto rounded-xl border border-ink-700/70 bg-ink-950 p-3">
              {result.tokens.length === 0 ? (
                <span className="text-xs italic text-slate-500">No tokens generated</span>
              ) : (
                <div className="flex min-w-max items-end gap-1">
                  {testExpr.split('').map((ch, i) => {
                    const owner = ownerAt(i);
                    const isSkipped = !owner && /\s/.test(ch);
                    const isLastGroup = !!owner && owner === lastToken;
                    const isHead = i === readHead && !owner;
                    const startsNewGroup = !!owner && owner !== ownerAt(i - 1);
                    return (
                      <span
                        key={i}
                        title={
                          owner
                            ? `${owner.lexeme} - ${owner.type}`
                            : isSkipped
                              ? 'whitespace (skipped)'
                              : 'unconsumed'
                        }
                        className={cn(
                          'relative flex h-9 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-sm transition-all duration-200',
                          owner ? cellTone(owner.type) : isSkipped ? BLANK_CELL : CELL_TONE.ERROR,
                          startsNewGroup && 'ml-1.5',
                          isLastGroup ? 'opacity-100 ring-1 ring-cyan-400/70' : owner && 'opacity-70',
                          isHead && 'border-dashed border-amber-400/80 bg-amber-500/10 text-amber-200'
                        )}
                      >
                        {ch === ' ' ? '·' : ch}
                        {isHead && (
                          <span className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-400" />
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Raw character run vs emitted tokens: the clear before / after */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-ink-700/70 bg-ink-900/50 p-3">
                <SectionLabel className="mb-2">Before - raw character run</SectionLabel>
                <div className="flex flex-wrap items-center gap-1">
                  {result.tokens.length === 0 ? (
                    <span className="text-xs italic text-slate-500">Empty input</span>
                  ) : (
                    testExpr.split('').map((ch, i) => (
                      <span
                        key={i}
                        className={cn(
                          'rounded border px-1.5 py-0.5 font-mono text-xs',
                          /\s/.test(ch)
                            ? 'border-ink-700/50 bg-ink-900/60 text-slate-600'
                            : 'border-ink-600 bg-ink-800 text-slate-300'
                        )}
                      >
                        {ch === ' ' ? '·' : ch}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.05] p-3">
                <SectionLabel className="mb-2">After - emitted token stream</SectionLabel>
                <div className="flex flex-wrap items-center gap-2">
                  {result.tokens.length === 0 ? (
                    <span className="text-xs italic text-slate-500">No tokens generated</span>
                  ) : (
                    result.tokens.map((tok, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-950 px-2.5 py-1.5">
                          <span className="font-mono text-xs font-bold text-cyan-300">{tok.lexeme}</span>
                          <TokenBadge type={tok.type} size="xs" />
                        </div>
                        {idx < result.tokens.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-600" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {activePreset && (
            <Callout tone="info" icon={Lightbulb} title="Why this tokenization?">
              <p className="text-balance leading-relaxed">{activePreset.explanation}</p>
            </Callout>
          )}
        </CardBody>
      </Card>

      {/* Ranked candidate comparison: longest match wins */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={Trophy}
          title="Competing Candidates, Ranked"
          subtitle="At each ambiguous position the scanner tries the longest valid operator first. Rank 1 is what it committed to."
          actions={
            <Badge tone={greedyWins.length ? 'emerald' : 'slate'} size="xs">
              {greedyWins.length} greedy {greedyWins.length === 1 ? 'win' : 'wins'}
            </Badge>
          }
        />
        <CardBody>
          {greedyWins.length === 0 ? (
            <Callout tone="note" icon={ScanLine} title="No multi-character operator in this input">
              Try an expression containing <code>++</code>, <code>&gt;=</code>, <code>-&gt;</code> or{' '}
              <code>&lt;=</code> - the ranking appears as soon as a longer match beats a shorter one.
            </Callout>
          ) : (
            <div className="grid grid-cols-1 gap-3 stagger lg:grid-cols-2">
              {greedyWins.map((tok, i) => {
                const leftover = result.tokens.find(
                  (t) => typeof t.startIndex === 'number' && t.startIndex === tok.endIndex
                );
                return (
                  <div
                    key={`${tok.startIndex}-${i}`}
                    className="rounded-xl border border-ink-700/70 bg-ink-900/50 p-3.5"
                  >
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Badge tone="cyan" mono size="xs">
                          col {tok.column}
                        </Badge>
                        <span className="text-2xs uppercase tracking-[0.14em] text-slate-500">
                          candidates tried
                        </span>
                      </span>
                      <TokenBadge type={tok.type} size="xs" />
                    </div>

                    <ul className="space-y-2">
                      <li className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <Trophy className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                            <span className="font-mono text-sm font-bold text-emerald-200">{tok.lexeme}</span>
                          </span>
                          <Badge tone="emerald" size="xs">{tok.lexeme.length} chars - accepted</Badge>
                        </div>
                        <MeterBar
                          value={tok.lexeme.length}
                          max={tok.lexeme.length}
                          tone="emerald"
                          className="mt-2"
                        />
                        {tok.opName && <p className="mt-1.5 text-2xs text-emerald-200/70">{tok.opName}</p>}
                      </li>

                      {shorterCandidates(tok.lexeme).map((op, k) => (
                        <li
                          key={`${op}-${k}`}
                          className="rounded-lg border border-ink-700/60 bg-ink-950/60 p-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <Minus className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              <span className="font-mono text-sm text-slate-400">{op}</span>
                            </span>
                            <span className="text-2xs uppercase tracking-[0.12em] text-slate-500">
                              {op.length} chars - shorter, skipped
                            </span>
                          </div>
                          <MeterBar value={op.length} max={tok.lexeme.length} tone="rose" className="mt-2" />
                        </li>
                      ))}
                    </ul>

                    {leftover && leftover.type.includes('OPERATOR') && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-ink-700/60 pt-2.5 text-2xs text-slate-500">
                        <span className="uppercase tracking-[0.12em]">leftover after munch</span>
                        <ArrowRight className="h-3 w-3 text-ink-600" />
                        <span className="font-mono text-xs text-amber-200">{leftover.lexeme}</span>
                        <span>emitted as its own token</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {splitRuns.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-ink-700/60 pt-4">
              <SectionLabel>Ambiguous runs divided by greedy munch</SectionLabel>
              {splitRuns.map((run, i) => {
                const text = run.map((t) => t.lexeme).join('');
                return (
                  <div
                    key={`${text}-${i}`}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-sm font-bold text-amber-200">{text}</span>
                    <span className="text-2xs uppercase tracking-[0.12em] text-slate-500">becomes</span>
                    {run.map((t, k) => (
                      <span key={`${t.lexeme}-${k}`} className="flex items-center gap-1.5">
                        <Badge tone="amber" mono size="xs">{t.lexeme}</Badge>
                        {k < run.length - 1 && <ArrowRight className="h-3 w-3 text-ink-600" />}
                      </span>
                    ))}
                    <span className="ml-auto font-mono text-2xs text-slate-500">
                      greedy {run.map((t) => t.lexeme.length).join(' + ')} - not {text.length} x 1
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Comparison: Maximal Munch vs Non-Greedy */}
      <Card className="animate-fade-up">
        <CardHeader dense icon={Split} title="Before vs After: What Happens Without Maximal Munch?" />
        <CardBody>
          <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Trophy className="h-4 w-4" />
                <span>With Maximal Munch (LexiLab / GCC / Clang)</span>
              </div>
              <p className="font-mono leading-relaxed text-slate-400">
                Input: <span className="text-white">a+++b</span>
                <br />
                Matches longest operator: <span className="text-cyan-300">++</span> first.
                <br />
                Parsed as: <span className="text-emerald-300">(a++) + b</span>
              </p>
              <p className="text-2xs text-slate-500">Deterministic, zero backtracking required.</p>
            </div>

            <div className="space-y-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <ScanLine className="h-4 w-4" />
                <span>Without Maximal Munch (Ambiguous)</span>
              </div>
              <p className="font-mono leading-relaxed text-slate-400">
                Input: <span className="text-white">a+++b</span>
                <br />
                Could match: <span className="text-rose-300">a + (++b)</span> or{' '}
                <span className="text-rose-300">a + + + b</span>
                <br />
                Causes ambiguous grammar parsing errors.
              </p>
              <p className="text-2xs text-slate-500">
                Requires costly backtracking and non-deterministic heuristics.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
