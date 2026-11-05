import React, { useMemo, useState } from 'react';
import { Lexer } from '../engine/lexer';
import { TokenBadge } from '../components/tokens/TokenBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Callout, StatTile } from '../components/ui/StatTile';
import { cn } from '../utils/cn';
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  FlaskConical,
  ListChecks,
  MoveRight,
  Pencil,
} from 'lucide-react';

const CASES = [
  {
    id: 'printf-cols',
    name: 'printf column positions',
    source: '    printf("Hello World\\n");',
    expect: ['printf', '(', '"Hello World\\n"', ')', ';'],
    columns: [5, 11, 12, 27, 28],
    note: 'printf is an IDENTIFIER. The string starts at column 12. ) is 27 and ; is 28.'
  },
  {
    id: 'split-ident',
    name: 'Number beside identifier',
    source: 'int 123invalid = 50;',
    expect: ['int', '123', 'invalid', '=', '50', ';'],
    note: 'Two tokens, then a syntax note. There is no INVALID_IDENTIFIER token.'
  },
  {
    id: 'munch',
    name: 'Maximal munch a+++b',
    source: 'a+++b',
    expect: ['a', '++', '+', 'b'],
    note: 'Longest operator match consumes ++ before the leftover +.'
  },
  {
    id: 'radix',
    name: 'Hex, octal, binary, scientific',
    source: '0x2A 010 0b1010 1e10',
    expect: ['0x2A', '010', '0b1010', '1e10'],
    note: '010 is octal. 1e10 is a float. 08 would be a lexical error.'
  },
  {
    id: 'comments',
    name: 'Comments skipped by default',
    source: 'int x; // hidden\n/* block */ x++;',
    expect: ['int', 'x', ';', 'x', '++', ';'],
    note: 'Turn on Show Comments in Token Analysis when you want COMMENT tokens.'
  },
  {
    id: 'dots',
    name: 'Second decimal point',
    source: '3.14.15',
    expect: ['3.14', '.15'],
    note: 'Maximal munch yields float 3.14 and float .15. They are not one malformed number.'
  },
  {
    id: 'char',
    name: 'Character literal',
    source: "'\\n'",
    expect: ["'\\n'"],
    note: 'Escape sequences stay inside one CHAR_LITERAL.'
  }
];

export function TestPlayground() {
  const [activeId, setActiveId] = useState(CASES[0].id);
  const [draft, setDraft] = useState(CASES[0].source);
  const selected = CASES.find((c) => c.id === activeId) || CASES[0];

  const result = useMemo(() => new Lexer().tokenize(draft), [draft]);
  const lexemes = result.tokens.filter((t) => t.type !== 'ERROR').map((t) => t.lexeme);
  const compared = selected.source === draft;
  const lexemeOk = compared && lexemes.join('\u0001') === selected.expect.join('\u0001');
  const columnOk = !selected.columns || !compared || result.tokens.slice(0, selected.columns.length).every((t, i) => t.column === selected.columns[i]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader
        icon={FlaskConical}
        kicker="Test-case playground"
        title="Before / After Tokenization"
        description="Left side is source text. Right side is the token stream this scanner actually emits, including line and column. Built-in cases check the review corrections."
        actions={
          !compared ? (
            <Badge tone="slate" icon={Pencil}>source edited - oracle paused</Badge>
          ) : lexemeOk && columnOk ? (
            <Badge tone="emerald" icon={CircleCheck}>all checks pass</Badge>
          ) : (
            <Badge tone="rose" icon={CircleX}>mismatch</Badge>
          )
        }
      />

      {/* Verdict summary */}
      <div className="grid grid-cols-2 gap-2.5 stagger sm:grid-cols-4">
        <StatTile
          label="Lexeme check"
          value={!compared ? 'paused' : lexemeOk ? 'pass' : 'fail'}
          icon={!compared ? Pencil : lexemeOk ? CircleCheck : CircleX}
          tone={!compared ? 'slate' : lexemeOk ? 'emerald' : 'rose'}
          hint={!compared ? 'edit detected' : `${lexemes.length} lexemes`}
        />
        <StatTile
          label="Column check"
          value={
            !selected.columns ? 'n/a' : !compared ? 'paused' : columnOk ? 'pass' : 'fail'
          }
          icon={!selected.columns ? ListChecks : !compared ? Pencil : columnOk ? CircleCheck : CircleX}
          tone={
            !selected.columns
              ? 'slate'
              : !compared
                ? 'slate'
                : columnOk
                  ? 'emerald'
                  : 'rose'
          }
          hint={selected.columns ? `${selected.columns.length} columns pinned` : 'no column oracle'}
        />
        <StatTile
          label="Tokens emitted"
          value={result.tokens.length}
          unit="live"
          icon={MoveRight}
          tone="cyan"
          hint="from the real lexer"
        />
        <StatTile
          label="Errors / notes"
          value={`${result.errors.length}/${result.syntaxNotes?.length || 0}`}
          icon={AlertTriangle}
          tone={result.errors.length ? 'rose' : 'emerald'}
          hint={result.errors.length ? 'lexical errors present' : 'clean scan'}
        />
      </div>

      {/* Case selector */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={ListChecks}
          title="Built-in cases"
          subtitle="Selecting a case loads its source into the editable buffer below."
          actions={<Badge tone="slate" size="xs">{CASES.length} cases</Badge>}
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap gap-2 stagger">
            {CASES.map((c) => {
              const isActive = activeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setDraft(c.source);
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-xs transition-all duration-200 active:scale-[.97]',
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-glow'
                      : 'border-ink-700 bg-ink-900/60 text-slate-300 hover:border-ink-600 hover:bg-ink-800 hover:text-slate-100'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isActive &&
                      (!compared ? (
                        <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      ) : lexemeOk && columnOk ? (
                        <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      ) : (
                        <CircleX className="h-3.5 w-3.5 shrink-0 text-rose-300" />
                      ))}
                    <span className="font-semibold">{c.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-relaxed text-slate-500">{selected.note}</p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Before */}
        <Card className="animate-fade-up">
          <CardHeader
            dense
            icon={Pencil}
            title="Before - source"
            subtitle="Editable. Typing keeps the live scan but pauses the expected list."
            actions={<Badge tone="slate" mono size="xs">{draft.length} chars</Badge>}
          />
          <CardBody>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full resize-y rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </CardBody>
        </Card>

        {/* After */}
        <Card className="animate-fade-up">
          <CardHeader
            dense
            icon={MoveRight}
            title="After - tokens"
            subtitle="Emitted by the real Lexer, with line and column positions."
            actions={<Badge tone="cyan" mono size="xs">{result.tokens.length}</Badge>}
          />
          <CardBody scroll className="max-h-[22rem] space-y-1.5">
            {result.tokens.length === 0 ? (
              <span className="text-xs text-slate-500">No tokens</span>
            ) : (
              result.tokens.map((t) => (
                <div
                  key={t.id}
                  className="row-hover flex items-center justify-between gap-2 rounded-lg border border-ink-700/50 bg-ink-950/60 px-2.5 py-1.5 text-xs"
                >
                  <span className="font-mono text-cyan-200">{t.lexeme}</span>
                  <span className="flex items-center gap-2">
                    <TokenBadge type={t.type} size="xs" />
                    <span className="font-mono text-2xs text-slate-500">
                      L{t.line}:C{t.column}
                      {t.base ? ` · ${t.base}` : ''}
                    </span>
                  </span>
                </div>
              ))
            )}
            {result.syntaxNotes?.length > 0 && (
              <Callout tone="warn" className="mt-2" title="Advisories">
                Syntax notes: {result.syntaxNotes.length}. Lexical errors: {result.errors.length}.
              </Callout>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Oracle: expected vs actual */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={ListChecks}
          title="Expected vs actual lexemes"
          subtitle="The built-in oracle compares the stored expectation with live engine output."
          actions={
            <Badge tone={!compared ? 'slate' : lexemeOk ? 'emerald' : 'rose'} size="xs">
              {!compared
                ? 'paused'
                : `${lexemes.filter((lx, i) => selected.expect[i] === lx).length}/${selected.expect.length} aligned`}
            </Badge>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/50 p-3">
              <SectionLabel className="mb-2">Expected · {selected.name}</SectionLabel>
              <ol className="space-y-1.5">
                {selected.expect.map((exp, i) => {
                  const actual = lexemes[i];
                  const state = !compared ? 'idle' : actual === exp ? 'ok' : 'bad';
                  return (
                    <li
                      key={`${exp}-${i}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs',
                        state === 'ok' && 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200',
                        state === 'bad' && 'border-rose-500/40 bg-rose-500/[0.09] text-rose-200',
                        state === 'idle' && 'border-ink-700/60 bg-ink-950/60 text-slate-300'
                      )}
                    >
                      <span className="w-5 shrink-0 text-right font-mono text-2xs text-slate-600">
                        {i + 1}
                      </span>
                      {state === 'ok' ? (
                        <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      ) : state === 'bad' ? (
                        <CircleX className="h-3.5 w-3.5 shrink-0 text-rose-300" />
                      ) : (
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-dashed border-ink-600" />
                      )}
                      <span className="break-all">{exp}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.05] p-3">
              <SectionLabel className="mb-2">Actual · live lexer output</SectionLabel>
              <ol className="space-y-1.5">
                {lexemes.length === 0 ? (
                  <li className="rounded-lg border border-ink-700/60 bg-ink-950/60 px-2.5 py-1.5 font-mono text-xs text-slate-500">
                    no lexemes emitted
                  </li>
                ) : (
                  lexemes.map((lx, i) => {
                    const exp = selected.expect[i];
                    const state = !compared ? 'idle' : exp === lx ? 'ok' : 'bad';
                    return (
                      <li
                        key={`${lx}-${i}`}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs',
                          state === 'ok' && 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200',
                          state === 'bad' && 'border-rose-500/40 bg-rose-500/[0.09] text-rose-200',
                          state === 'idle' && 'border-ink-700/60 bg-ink-950/60 text-slate-300'
                        )}
                      >
                        <span className="w-5 shrink-0 text-right font-mono text-2xs text-slate-600">
                          {i + 1}
                        </span>
                        <span className="break-all">{lx}</span>
                        {compared && exp === undefined && (
                          <span className="ml-auto text-2xs uppercase tracking-[0.12em] text-rose-300">
                            extra
                          </span>
                        )}
                      </li>
                    );
                  })
                )}
              </ol>
            </div>
          </div>

          {selected.columns && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-700/60 pt-3">
              <SectionLabel>Column oracle</SectionLabel>
              {selected.columns.map((col, i) => {
                const got = result.tokens[i] && result.tokens[i].column;
                const state = !compared ? 'idle' : got === col ? 'ok' : 'bad';
                return (
                  <span
                    key={`${col}-${i}`}
                    className={cn(
                      'rounded-lg border px-2 py-1 font-mono text-2xs',
                      state === 'ok' && 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200',
                      state === 'bad' && 'border-rose-500/40 bg-rose-500/[0.09] text-rose-200',
                      state === 'idle' && 'border-ink-700/60 bg-ink-950/60 text-slate-400'
                    )}
                  >
                    {selected.expect[i]} - expected C{col}, got C{got ?? '-'}
                  </span>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Verdict - conditionals preserved exactly */}
      {!compared ? (
        <Callout tone="note" icon={Pencil} title="Oracle paused">
          Source was edited, so the built-in expected list is paused. The token list above is still
          live.
        </Callout>
      ) : lexemeOk && columnOk ? (
        <Callout tone="success" icon={CircleCheck} title="Case passed">
          Expected lexemes{selected.columns ? ' and columns' : ''} match.
        </Callout>
      ) : (
        <Callout tone="danger" icon={CircleX} title="Case failed">
          Expected <span className="font-mono">{selected.expect.join(' · ')}</span>
        </Callout>
      )}
    </div>
  );
}
