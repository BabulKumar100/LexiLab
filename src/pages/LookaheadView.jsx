import React, { useMemo, useState } from 'react';
import { generateScannerTrace } from '../engine/scanner';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge, MeterBar } from '../components/ui/Badge';
import { IconButton } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { Binary, ChevronLeft, ChevronRight, Crosshair, Eye } from 'lucide-react';

const PRESETS = [
  { label: 'Shift assign >>=', code: 'x>>=1' },
  { label: 'Increment a+++b', code: 'a+++b' },
  { label: 'Pointer ptr->x', code: 'ptr->x' },
  { label: 'Number then name', code: '123invalid' },
  { label: 'Scientific 2.5e-3', code: '2.5e-3' },
  { label: 'Comment vs divide', code: 'a / b // note' }
];

/* Cell states for the read head. Consumed characters fade back, the character
   under the head gets a solid cyan ring, LA(1)/LA(2) get dotted amber rings. */
const HEAD_CELL = {
  consumed: 'border-ink-700/50 bg-ink-900/40 text-slate-600',
  current: 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-glow ring-1 ring-cyan-400/60',
  la1: 'border-dashed border-amber-400/70 bg-amber-500/10 text-amber-100',
  la2: 'border-dashed border-amber-400/40 bg-amber-500/[0.06] text-amber-200/80',
  upcoming: 'border-ink-600 bg-ink-800 text-slate-200',
};

export function LookaheadView() {
  const [source, setSource] = useState('x>>=1');
  const [cursor, setCursor] = useState(0);

  const steps = useMemo(() => generateScannerTrace(source), [source]);
  const safeIndex = Math.min(cursor, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];

  const load = (code) => {
    setSource(code);
    setCursor(0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader
        icon={Eye}
        kicker="Lookahead buffer"
        title="Lookahead Visualization"
        description={(
          <span>
            The scanner reads one character and inspects the next two before it commits. That is how{' '}
            <span className="font-mono text-cyan-300">&gt;&gt;=</span> stays one operator, and how{' '}
            <span className="font-mono text-cyan-300">//</span> becomes a comment instead of two
            divisions.
          </span>
        )}
        actions={<Badge tone="cyan" mono>LA(2) window</Badge>}
      />

      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={Eye}
          title="Source under the read head"
          subtitle="Pick a preset or type your own - the trace regenerates and the cursor returns to step 1."
          actions={<Badge tone="slate" mono size="xs">{steps.length} steps</Badge>}
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2 stagger">
            {PRESETS.map((p) => {
              const isActive = source === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => load(p.code)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 font-mono text-xs transition-all duration-200 active:scale-[.97]',
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-glow'
                      : 'border-ink-700 bg-ink-900/60 text-slate-300 hover:border-ink-600 hover:bg-ink-800 hover:text-slate-100'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <input
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setCursor(0);
            }}
            spellCheck={false}
            className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-2.5 font-mono text-sm text-cyan-300 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />
        </CardBody>
      </Card>

      {step && (
        <>
          {/* Lookahead buffer window - the three cells the scanner is weighing */}
          <div className="grid grid-cols-1 gap-3 stagger sm:grid-cols-3">
            <BufferCard
              tag="CUR"
              tone="cyan"
              title="Current character"
              value={step.char || 'EOF'}
              hint="Character under the read head"
            />
            <BufferCard
              tag="LA(1)"
              tone="amber"
              title="Lookahead 1"
              value={step.lookahead1 || 'EOF'}
              hint="Next character, not yet consumed"
            />
            <BufferCard
              tag="LA(2)"
              tone="amber"
              title="Lookahead 2"
              value={step.lookahead2 || 'EOF'}
              hint="Character after that"
            />
          </div>

          {/* Tape: one monospace cell per character, head + lookahead marked */}
          <Card className="animate-fade-up">
            <CardHeader
              dense
              icon={Crosshair}
              title="Scanner tape"
              subtitle="Already-consumed characters fade back; the head and its two lookahead cells stay lit."
              actions={<Badge tone="slate" mono size="xs">index {step.index}</Badge>}
            />
            <CardBody className="space-y-2.5">
              <div className="scroll-slim overflow-x-auto rounded-xl border border-ink-700/70 bg-ink-950 px-3 py-4">
                <div className="flex min-w-max flex-col gap-1.5">
                  <div className="flex min-w-max gap-1">
                    {source.split('').map((ch, i) => (
                      <span key={`tag-${i}`} className="flex w-8 shrink-0 justify-center font-mono text-2xs">
                        {i === step.index ? (
                          <span className="text-cyan-300">head</span>
                        ) : i === step.index + 1 ? (
                          <span className="text-amber-300">LA(1)</span>
                        ) : i === step.index + 2 ? (
                          <span className="text-amber-400/70">LA(2)</span>
                        ) : null}
                      </span>
                    ))}
                    <span className="ml-1 flex w-10 shrink-0 justify-center font-mono text-2xs text-slate-600">
                      EOF
                    </span>
                  </div>

                  <div className="flex min-w-max items-center gap-1">
                    {source.split('').map((ch, i) => {
                      const state =
                        i === step.index
                          ? 'current'
                          : i === step.index + 1
                            ? 'la1'
                            : i === step.index + 2
                              ? 'la2'
                              : i < step.index
                                ? 'consumed'
                                : 'upcoming';
                      return (
                        <span
                          key={i}
                          title={`index ${i}`}
                          className={cn(
                            'flex h-10 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm transition-all duration-200',
                            HEAD_CELL[state]
                          )}
                        >
                          {ch === ' ' ? '·' : ch}
                        </span>
                      );
                    })}
                    <span
                      className={cn(
                        'ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-mono text-2xs',
                        step.index >= source.length ? HEAD_CELL.current : HEAD_CELL.consumed
                      )}
                    >
                      EOF
                    </span>
                  </div>

                  <div className="flex min-w-max gap-1">
                    {source.split('').map((ch, i) => (
                      <span
                        key={`idx-${i}`}
                        className="w-8 shrink-0 text-center font-mono text-2xs text-slate-600"
                      >
                        {i}
                      </span>
                    ))}
                    <span className="ml-1 w-10 shrink-0 text-center font-mono text-2xs text-slate-600">
                      {source.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-slate-500">
                <span>
                  Solid cyan ring is the current character. Dotted amber rings are lookahead 1 and 2.
                  Faded cells are already consumed.
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500/25 ring-1 ring-cyan-400/60" />
                    head
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-amber-400/70 bg-amber-500/10" />
                    LA
                  </span>
                </span>
              </div>

              <MeterBar value={safeIndex + 1} max={steps.length} tone="cyan" />
            </CardBody>
          </Card>

          {/* Stepper */}
          <Card className="animate-fade-up">
            <CardHeader
              dense
              icon={Eye}
              title={`Step ${safeIndex + 1} of ${steps.length}`}
              subtitle={step.action}
              actions={
                <span className="flex items-center gap-2">
                  <IconButton
                    icon={ChevronLeft}
                    label="Previous step"
                    onClick={() => setCursor((c) => Math.max(0, c - 1))}
                  />
                  <IconButton
                    icon={ChevronRight}
                    label="Next step"
                    onClick={() => setCursor((c) => Math.min(steps.length - 1, c + 1))}
                  />
                </span>
              }
            />
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="cyan" mono>
                  DFA {step.dfaState}
                </Badge>
                <Badge tone="slate" mono size="xs">
                  line {step.line}
                </Badge>
                <Badge tone="slate" mono size="xs">
                  col {step.column}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed text-slate-200">{step.action}</p>

              {step.buffer ? (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2">
                  <p className="text-2xs font-bold uppercase tracking-[0.14em] text-amber-200/70">
                    Lexeme buffer
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-amber-200">{step.buffer}</p>
                </div>
              ) : null}

              {step.emittedToken ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2 font-mono text-xs text-emerald-300">
                  <Binary className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>
                    Emitted {step.emittedToken.type} “{step.emittedToken.lexeme}”
                  </span>
                </div>
              ) : null}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

function BufferCard({ tag, tone = 'cyan', title, value, hint }) {
  const isHead = tone === 'cyan';
  return (
    <div
      className={cn(
        'panel bevel-top relative overflow-hidden px-4 py-3.5',
        isHead ? 'border-cyan-500/35' : 'border-amber-500/25'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full blur-xl',
          isHead ? 'bg-cyan-500/25' : 'bg-amber-500/20'
        )}
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <Badge tone={tone} size="xs" mono>
          {tag}
        </Badge>
      </div>
      <div
        className={cn(
          'relative mt-2.5 break-all rounded-xl border px-3 py-3 text-center font-mono text-xl font-black leading-tight',
          isHead
            ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-glow ring-1 ring-cyan-400/50'
            : 'border-dashed border-amber-400/70 bg-amber-500/10 text-amber-100'
        )}
      >
        {value || '∅'}
      </div>
      <p className="relative mt-2 text-center text-2xs leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}
