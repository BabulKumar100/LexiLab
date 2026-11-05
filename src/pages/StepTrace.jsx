import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateScannerTrace } from '../engine/scanner';
import { TokenBadge } from '../components/tokens/TokenBadge';
import { Button, IconButton } from '../components/ui/Button';
import { Badge, CountPill, MeterBar } from '../components/ui/Badge';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { EmptyState, PageHeader } from '../components/ui/PageHeader';
import { StatTile } from '../components/ui/StatTile';
import { cn } from '../utils/cn';
import {
  Footprints,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  FastForward,
  Terminal,
  Layers,
  Scan,
  Gauge,
  Crosshair,
  Braces,
  Boxes,
  Inbox,
} from 'lucide-react';

const WINDOW_TONES = {
  cursor: 'border-cyan-500/35 bg-cyan-500/[0.08] text-cyan-100',
  next: 'border-blue-500/30 bg-blue-500/[0.07] text-blue-200',
  ahead: 'border-indigo-500/30 bg-indigo-500/[0.07] text-indigo-200',
};

function WindowCell({ slot, caption, value, fallback, tone, big = false }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border px-3 py-3 text-center',
        WINDOW_TONES[tone],
        big && 'animate-ring-pulse shadow-glow'
      )}
    >
      <p className="text-2xs font-bold uppercase tracking-[0.16em] opacity-70">{slot}</p>
      <p
        className={cn(
          'mt-2 break-all font-mono font-black leading-none',
          big ? 'text-3xl' : 'text-2xl'
        )}
      >
        {value || fallback}
      </p>
      <p className="mt-2 truncate text-2xs uppercase tracking-wider opacity-60">{caption}</p>
    </div>
  );
}

export function StepTrace() {
  const { sourceCode, setActiveToken } = useApp();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(700); // ms per step

  // Generate trace on source code change
  const trace = useMemo(() => {
    return generateScannerTrace(sourceCode || 'int a = 10;');
  }, [sourceCode]);

  const currentStep = trace[currentStepIdx] || trace[0];
  const totalSteps = trace.length;
  const isAtEnd = currentStepIdx >= totalSteps - 1;

  // Auto-play loop
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      if (currentStepIdx < totalSteps - 1) {
        timer = setTimeout(() => {
          setCurrentStepIdx(prev => prev + 1);
        }, playbackSpeed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, totalSteps, playbackSpeed]);

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  // Jump to Next Token emission step
  const handleNextToken = () => {
    for (let i = currentStepIdx + 1; i < totalSteps; i++) {
      if (trace[i].emittedToken) {
        setCurrentStepIdx(i);
        return;
      }
    }
    setCurrentStepIdx(totalSteps - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const progress = `${((currentStepIdx + 1) / totalSteps) * 100}%`;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Footprints}
        kicker="Scanner Trace"
        title="Step-by-Step Scanner Animation & Lookahead Window"
        description="Walk the character stream with a k = 2 lookahead buffer, watch the accumulator grow through each DFA state, and see exactly when a token is emitted."
        actions={
          <>
            <Badge tone="slate" mono size="sm" icon={Crosshair}>
              Ln {currentStep.line} · Col {currentStep.column}
            </Badge>
            <Badge tone="cyan" mono size="sm">
              {totalSteps} steps
            </Badge>
          </>
        }
      />

      {/* Media-scrubber control bar */}
      <Card className="animate-fade-up">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <IconButton icon={RotateCcw} label="Reset to beginning" onClick={handleReset} />
              <IconButton
                icon={ChevronLeft}
                label="Previous character"
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
              />
              <Button
                variant="primary"
                size="md"
                icon={isPlaying ? Pause : Play}
                onClick={() => setIsPlaying(!isPlaying)}
                className="min-w-[9.5rem] justify-center"
              >
                {isPlaying ? 'Pause' : 'Play Simulation'}
              </Button>
              <IconButton
                icon={ChevronRight}
                label="Next character"
                onClick={handleNext}
                disabled={isAtEnd}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={FastForward}
                onClick={handleNextToken}
                disabled={isAtEnd}
              >
                Next Token
              </Button>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/70 px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <Gauge className="h-3.5 w-3.5 text-cyan-300" />
              <span>Speed</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                aria-label="Playback speed"
                className="cursor-pointer rounded-lg border border-ink-700 bg-ink-950 px-2 py-1 font-mono text-xs font-medium normal-case tracking-normal text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value={1200}>Slow · 1.2s</option>
                <option value={700}>Normal · 0.7s</option>
                <option value={300}>Fast · 0.3s</option>
              </select>
            </label>
          </div>

          {/* scrub track: amber ticks mark token-emission steps */}
          <div className="space-y-2.5">
            <div className="relative">
              <div className="h-2 w-full rounded-full bg-ink-950 ring-1 ring-inset ring-ink-700/70">
                {trace.map((step, i) =>
                  step.emittedToken ? (
                    <span
                      key={`tick-${step.stepNumber}`}
                      title={`Token #${step.emittedToken.id} emitted at step ${step.stepNumber}`}
                      className="absolute -top-1 h-4 w-[2px] rounded-full bg-amber-400/50"
                      style={{ left: `${((i + 1) / totalSteps) * 100}%` }}
                    />
                  ) : null
                )}
                <div
                  className="h-full rounded-full bg-grad-brand transition-all duration-300 ease-out"
                  style={{ width: progress }}
                />
              </div>
              <span
                aria-hidden
                className="pointer-events-none absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border border-cyan-300/70 bg-ink-950 shadow-glow"
                style={{ left: progress }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-2xs text-slate-500">
              <span>
                Step <strong className="text-sm font-black tabular-nums text-cyan-300">{currentStepIdx + 1}</strong>
                <span className="mx-1 text-slate-700">/</span>
                {totalSteps}
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <span className="h-[10px] w-[2px] rounded-full bg-amber-400/60" /> token emitted
                </span>
                <span>{Math.round(((currentStepIdx + 1) / totalSteps) * 100)}% · index {currentStep.index}</span>
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: live scanner state */}
        <div className="space-y-5 lg:col-span-7">
          <Card className="animate-fade-up">
            <CardHeader
              icon={Scan}
              title="Live Character Window"
              subtitle="C₀ is the character under inspection; L₁ and L₂ decide the match by maximal munch."
              actions={
                <Badge tone="slate" mono size="xs">
                  k = 2
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <WindowCell
                  slot="C₀ active"
                  caption="character under cursor"
                  value={currentStep.char}
                  fallback="None"
                  tone="cursor"
                  big
                />
                <WindowCell
                  slot="L₁ lookahead"
                  caption="one char ahead"
                  value={currentStep.lookahead1}
                  fallback="EOF"
                  tone="next"
                />
                <WindowCell
                  slot="L₂ lookahead"
                  caption="two chars ahead"
                  value={currentStep.lookahead2}
                  fallback="EOF"
                  tone="ahead"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-amber-300/80">
                    <Braces className="h-3.5 w-3.5" />
                    Accumulator buffer
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-bold text-amber-200">
                    <span className="text-amber-500/60">&ldquo;</span>
                    {currentStep.buffer || ''}
                    <span className="text-amber-500/60">&rdquo;</span>
                  </p>
                  <p className="mt-1.5 font-mono text-2xs text-amber-400/60">
                    {currentStep.buffer.length} char{currentStep.buffer.length === 1 ? '' : 's'} held
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-purple-500/25 bg-purple-500/[0.07] px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-purple-300/80">
                    <Boxes className="h-3.5 w-3.5" />
                    Current DFA state
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-purple-300 shadow-glow" />
                    <span className="truncate font-mono text-lg font-black leading-none text-purple-100">
                      {currentStep.dfaState}
                    </span>
                  </p>
                  <p className="mt-2 font-mono text-2xs text-purple-300/60">δ-state after this step</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="animate-fade-up" bevel={false}>
            <CardHeader
              dense
              icon={Terminal}
              title="Scanner Action Details"
              actions={
                <Badge tone="slate" mono size="xs">
                  #{currentStep.stepNumber}
                </Badge>
              }
            />
            <CardBody className="space-y-3">
              <p className="rounded-xl border border-ink-700/60 bg-ink-950/70 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-slate-200">
                {currentStep.action}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Line" value={currentStep.line} tone="cyan" />
                <StatTile label="Column" value={currentStep.column} tone="blue" />
                <StatTile label="Index" value={currentStep.index} tone="indigo" />
                <StatTile label="Emitted" value={currentStep.tokensSnapshot.length} unit="tokens" tone="emerald" />
              </div>
            </CardBody>
          </Card>

          <Card className="animate-fade-up" bevel={false}>
            <CardHeader
              dense
              icon={Crosshair}
              title="Character Pointer in Source Code"
              subtitle="Cyan = C₀, blue = L₁. Already-consumed input is dimmed."
              actions={
                <Badge tone="slate" mono size="xs">
                  {sourceCode.length} chars
                </Badge>
              }
            />
            <CardBody>
              <div className="scroll-slim whitespace-pre overflow-x-auto rounded-xl border border-ink-700/60 bg-ink-950/70 p-4 font-mono text-[13px] leading-7">
                {sourceCode.split('').map((c, i) => {
                  const isCurrent = i === currentStep.index;
                  const isLookahead = i === currentStep.index + 1;
                  const isConsumed = i < currentStep.index;
                  return (
                    <span
                      key={i}
                      className={cn(
                        'rounded transition-colors duration-200',
                        isCurrent
                          ? 'bg-cyan-500/25 font-extrabold text-cyan-50 ring-1 ring-cyan-400/60'
                          : isLookahead
                            ? 'bg-blue-500/20 font-bold text-blue-200 ring-1 ring-blue-400/40'
                            : isConsumed
                              ? 'text-slate-600'
                              : 'text-slate-300'
                      )}
                    >
                      {c === '\n' ? '␊\n' : c === '\t' ? '⇥' : c}
                    </span>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: emitted token stream */}
        <div className="lg:col-span-5">
          <Card className="animate-fade-up flex max-h-[720px] flex-col">
            <CardHeader
              icon={Layers}
              title="Tokens Emitted So Far"
              subtitle="Click a token to open it in the inspector."
              actions={<CountPill value={currentStep.tokensSnapshot.length} tone="cyan" />}
            />
            <CardBody scroll className="min-h-[280px] flex-1 space-y-2 p-3">
              {currentStep.tokensSnapshot.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No tokens emitted yet"
                  description="Step forward through the scanner — tokens land here the moment the DFA reaches an accepting state."
                  className="h-full"
                />
              ) : (
                <ul className="stagger space-y-2">
                  {currentStep.tokensSnapshot.map((tok) => (
                    <li key={tok.id}>
                      <button
                        type="button"
                        onClick={() => setActiveToken(tok)}
                        className="row-hover group flex w-full items-center justify-between gap-3 rounded-xl border border-ink-700/70 bg-ink-950/60 px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lifted"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="shrink-0 font-mono text-2xs text-slate-600">#{tok.id}</span>
                          <span className="truncate font-mono text-xs font-bold text-cyan-200 group-hover:text-cyan-100">
                            {tok.lexeme}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <TokenBadge type={tok.type} size="xs" />
                          <span className="font-mono text-2xs text-slate-600">
                            Ln {tok.line}·Col {tok.column}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
            <CardFooter className="space-y-2">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-bold uppercase tracking-[0.14em] text-slate-500">Trace position</span>
                <span className="font-mono text-slate-400">
                  step {currentStepIdx + 1}/{totalSteps}
                </span>
              </div>
              <MeterBar value={currentStepIdx + 1} max={totalSteps} tone="cyan" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
