import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Route,
  ListChecks,
} from 'lucide-react';
import { Button, IconButton } from '../ui/Button';
import { Badge, MeterBar } from '../ui/Badge';
import { Card, CardBody, CardFooter, CardHeader, SectionLabel } from '../ui/Card';
import { Callout, Table, Td } from '../ui/StatTile';
import { cn } from '../../utils/cn';

const CHAR_CELL = {
  current:
    'border-cyan-400/70 bg-cyan-500/20 text-cyan-200 shadow-glow scale-110 z-10',
  processed: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  pending: 'border-ink-700 bg-ink-800/70 text-slate-500',
};

export function DFAStepper({ model, activeStep, setActiveStep, testInput, setTestInput }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const simulation = model.simulate(testInput);
  const totalSteps = simulation.trace.length;
  const currentTrace = simulation.trace[activeStep] || simulation.trace[0];
  const isLastStep = activeStep >= totalSteps - 1;

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      if (activeStep < totalSteps - 1) {
        timer = setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 800);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, totalSteps, setActiveStep]);

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  const roleOf = (state) => {
    if (model.acceptStates.includes(state)) return { cls: 'text-emerald-300', label: 'accept' };
    const known = model.nodes.find((n) => n.id === state);
    if (known?.isTrap || (state && !known)) return { cls: 'text-rose-300', label: 'dead' };
    return { cls: 'text-slate-300', label: 'transit' };
  };

  return (
    <div className="space-y-4">
      <Card className="animate-fade-up">
        <CardHeader
          icon={Route}
          title="Trace Runner"
          subtitle="Feed a string to this automaton and step through δ."
          actions={
            <Badge tone="slate" mono size="xs">
              {totalSteps} steps
            </Badge>
          }
        />
        <CardBody className="space-y-4">
          {/* Test input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Test input string</SectionLabel>
              <span className="font-mono text-2xs text-slate-600">{testInput.length} chars</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => {
                  setTestInput(e.target.value);
                  setActiveStep(0);
                  setIsPlaying(false);
                }}
                placeholder="e.g. identifier_123"
                spellCheck={false}
                aria-label="Test input string for automaton"
                className="h-9 min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-950/80 px-3 font-mono text-xs text-cyan-200 placeholder-slate-600 transition-colors focus:border-cyan-500/50 focus:bg-ink-950 focus:outline-none"
              />
              <IconButton icon={RotateCcw} label="Reset step to beginning" onClick={handleReset} />
            </div>
          </div>

          {/* Character stream */}
          <div className="rounded-xl border border-ink-700/60 bg-ink-950/50 p-2.5">
            <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
              <span className="mr-1 shrink-0 text-2xs font-bold uppercase tracking-[0.14em] text-slate-600">
                Input
              </span>
              {testInput.split('').map((char, idx) => {
                const isProcessed = idx < activeStep;
                const isCurrent = idx === activeStep - 1;

                return (
                  <span
                    key={idx}
                    className={cn(
                      'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold transition-all duration-200',
                      isCurrent ? CHAR_CELL.current : isProcessed ? CHAR_CELL.processed : CHAR_CELL.pending
                    )}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
            <p className="mt-2 flex items-center gap-3 text-2xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                just consumed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400/70" />
                consumed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink-650" />
                unread
              </span>
            </p>
          </div>

          {/* Scrubber */}
          <div className="space-y-3 rounded-xl border border-ink-700/70 bg-ink-900/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <IconButton
                  icon={ChevronLeft}
                  label="Previous step"
                  onClick={handlePrev}
                  disabled={activeStep === 0}
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={isPlaying ? Pause : Play}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? 'Pause' : 'Animate'}
                </Button>
                <IconButton
                  icon={ChevronRight}
                  label="Next step"
                  onClick={handleNext}
                  disabled={isLastStep}
                />
              </div>
              <p className="font-mono text-2xs uppercase tracking-wider text-slate-500">
                Step <span className="text-sm font-black tabular-nums text-cyan-300">{activeStep + 1}</span>
                <span className="mx-0.5 text-slate-700">/</span>
                <span className="tabular-nums">{totalSteps}</span>
              </p>
            </div>
            <MeterBar
              value={activeStep + 1}
              max={totalSteps}
              tone={isLastStep ? (simulation.isAccepted ? 'emerald' : 'rose') : 'cyan'}
            />
          </div>

          {/* Active state read-out */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Active automaton state</SectionLabel>
              <Badge tone="cyan" mono size="md" dot>
                {currentTrace?.state || 'q0'}
              </Badge>
            </div>
            <p className="rounded-xl border border-ink-700/60 bg-ink-950/60 px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-slate-300">
              {currentTrace?.desc || 'Awaiting transition...'}
            </p>

            {isLastStep && (
              <Callout
                tone={simulation.isAccepted ? 'success' : 'danger'}
                icon={simulation.isAccepted ? CheckCircle2 : XCircle}
                title={simulation.isAccepted ? 'String accepted' : 'String rejected'}
              >
                {simulation.reason}
              </Callout>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Per-character progression */}
      <Card className="animate-fade-up" bevel={false}>
        <CardHeader
          dense
          icon={ListChecks}
          title="State Progression"
          subtitle="One row per consumed character: index, symbol, from to, and why."
        />
        <CardBody className="p-0">
          <div className="max-h-[260px]">
            <Table
              head={[
                { label: 'i', className: 'w-10' },
                { label: 'Char', className: 'w-14' },
                { label: 'Transition', className: 'w-32' },
                { label: 'Why this move' },
              ]}
            >
              {simulation.trace.map((entry, i) => {
                const from = i === 0 ? model.startState : simulation.trace[i - 1].state;
                const isCurrent = i === activeStep;
                const role = roleOf(entry.state);
                return (
                  <tr
                    key={`${entry.state}-${i}`}
                    className={cn('row-hover', isCurrent && 'bg-cyan-500/[0.08]')}
                  >
                    <Td mono className="w-10">
                      <span className={cn('text-2xs', isCurrent ? 'text-cyan-300' : 'text-slate-600')}>
                        {i}
                      </span>
                    </Td>
                    <Td mono className="w-14">
                      <span className={isCurrent ? 'font-bold text-amber-200' : 'text-slate-400'}>
                        {entry.char === null || entry.char === '' ? '—' : entry.char}
                      </span>
                    </Td>
                    <Td mono className="w-32 whitespace-nowrap">
                      <span className="text-slate-500">{from}</span>
                      <span className="mx-1.5 text-slate-600">&rarr;</span>
                      <span className={cn('font-bold', role.cls)}>{entry.state}</span>
                    </Td>
                    <Td className="text-[11px] leading-snug text-slate-400">
                      <span className="inline-flex items-start gap-1.5">
                        <span
                          className={cn(
                            'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                            role.label === 'accept'
                              ? 'bg-emerald-400'
                              : role.label === 'dead'
                                ? 'bg-rose-400'
                                : 'bg-slate-600',
                            isCurrent && 'ring-pulse shadow-glow'
                          )}
                        />
                        <span>{entry.desc}</span>
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          </div>
        </CardBody>
        <CardFooter className="text-2xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ends in F, accepted
          </span>
          <span className="mx-2 text-slate-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> dead state, rejected
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
