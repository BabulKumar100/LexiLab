import React, { useState } from 'react';
import { REGEX_PATTERNS } from '../data/regexRules';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge, CountPill } from '../components/ui/Badge';
import { Callout, InfoRow } from '../components/ui/StatTile';
import { cn } from '../utils/cn';
import {
  BookOpen,
  Braces,
  CircleCheck,
  CircleX,
  Gauge,
  Pencil,
  Regex,
  Terminal,
} from 'lucide-react';

export function RegexExplorer() {
  const [selectedPatternId, setSelectedPatternId] = useState('identifier');
  const [testString, setTestString] = useState('total_sum_2026');
  const [customRegexStr, setCustomRegexStr] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const activePreset = REGEX_PATTERNS.find(p => p.id === selectedPatternId) || REGEX_PATTERNS[0];

  const currentRegex = isCustom ? (() => {
    try {
      return new RegExp(customRegexStr);
    } catch {
      return null;
    }
  })() : activePreset.regex;

  let isMatch = false;
  let matchError = null;

  if (currentRegex) {
    try {
      isMatch = currentRegex.test(testString);
    } catch (e) {
      matchError = e.message;
    }
  }

  const handleSelectPreset = (preset) => {
    setIsCustom(false);
    setSelectedPatternId(preset.id);
    setTestString(preset.exampleMatch);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader
        icon={Regex}
        kicker="Lexical grammar"
        title="Regular Expression Explorer"
        description="Study formal token patterns, regular definitions, and test string matching against compiler lexical rules."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Pencil}
            onClick={() => {
              setIsCustom(true);
              setCustomRegexStr('^[a-zA-Z_][a-zA-Z0-9_]*$');
            }}
          >
            Custom Regex Mode
          </Button>
        }
      />

      {/* Preset Patterns Grid */}
      <Card className="animate-fade-up">
        <CardHeader
          dense
          icon={BookOpen}
          title="Token patterns"
          subtitle="Select a definition to load its regex, its grammar and a sample that matches it."
          actions={<Badge tone="slate" size="xs">{REGEX_PATTERNS.length} patterns</Badge>}
        />
        <CardBody>
          <div className="grid grid-cols-2 gap-2.5 stagger sm:grid-cols-4">
            {REGEX_PATTERNS.map(p => {
              const isActive = !isCustom && selectedPatternId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={cn(
                    'group rounded-xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-[.98]',
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-glow'
                      : 'border-ink-700 bg-ink-900/60 text-slate-300 hover:border-ink-600 hover:bg-ink-800 hover:text-slate-100'
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">{p.name}</span>
                    {isActive && <CountPill value={p.dfaStatesCount} tone="cyan" />}
                  </span>
                  <span className="mt-1 block truncate font-mono text-2xs uppercase tracking-[0.1em] text-slate-500 group-hover:text-cyan-300">
                    {p.tokenType}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Main Interactive Testing Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Regex Pattern & Test Field (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="animate-fade-up">
            <CardHeader
              dense
              icon={isCustom ? Pencil : Regex}
              title={isCustom ? 'Custom Regular Expression' : `${activePreset.name} Pattern`}
              subtitle={
                isCustom
                  ? 'Live RegExp construction - typed straight into the JavaScript engine.'
                  : undefined
              }
              actions={
                isCustom ? (
                  <Badge tone="purple" size="xs">custom</Badge>
                ) : (
                  <Badge tone="slate" mono size="xs">{activePreset.tokenType}</Badge>
                )
              }
            />
            <CardBody className="space-y-4">
              {/* Pattern display or Custom Input */}
              <div className="space-y-1.5">
                <SectionLabel>{isCustom ? 'Expression source' : 'Regular definition'}</SectionLabel>
                <div className="relative">
                  <Braces
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500/60"
                  />
                  {isCustom ? (
                    <input
                      type="text"
                      value={customRegexStr}
                      onChange={(e) => setCustomRegexStr(e.target.value)}
                      placeholder="^pattern$"
                      spellCheck={false}
                      className="w-full rounded-xl border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 font-mono text-sm text-cyan-300 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  ) : (
                    <pre className="select-all overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-cyan-500/25 bg-ink-950 px-3 py-3 pl-10 font-mono text-sm leading-relaxed text-cyan-300 scroll-slim">
                      {activePreset.regexString}
                    </pre>
                  )}
                </div>
              </div>

              {/* Test String Input */}
              <div className="space-y-1.5">
                <SectionLabel>Input string to test against the pattern</SectionLabel>
                <div className="relative">
                  <Terminal
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter string to test..."
                    spellCheck={false}
                    className="w-full rounded-xl border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 font-mono text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              {/* Quick Match / Fail Samples */}
              {!isCustom && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-2xs uppercase tracking-[0.14em] text-slate-500">
                    Quick tests
                  </span>
                  <button
                    onClick={() => setTestString(activePreset.exampleMatch)}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-2xs text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                  >
                    match: {activePreset.exampleMatch}
                  </button>
                  <button
                    onClick={() => setTestString(activePreset.exampleFail)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-2xs text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
                  >
                    fail: {activePreset.exampleFail}
                  </button>
                </div>
              )}

              {/* Evaluation Result Banner */}
              <div
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-colors',
                  isMatch
                    ? 'border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-300'
                    : 'border-rose-500/35 bg-rose-500/[0.08] text-rose-300'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {isMatch ? (
                    <CircleCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleX className="h-5 w-5 shrink-0 text-rose-400" />
                  )}
                  <div>
                    <div className="text-sm font-bold">
                      {isMatch ? 'Pattern Matched Successfully!' : 'Pattern Rejected (No Match)'}
                    </div>
                    <p className="mt-0.5 text-2xs font-normal opacity-80">
                      {isMatch
                        ? `Input conforms to the ${activePreset.tokenType} grammar.`
                        : 'Input character sequence violates this lexical pattern.'}
                    </p>
                  </div>
                </div>
                <span className="rounded bg-ink-950/70 px-2 py-0.5 font-mono text-2xs">
                  {isMatch ? 'STATUS: ACCEPT' : 'STATUS: REJECT'}
                </span>
              </div>

              {matchError && (
                <Callout tone="warn" icon={CircleX} title="RegExp construction failed">
                  <span className="font-mono">{matchError}</span> - the banner above reflects the last
                  usable pattern, not this invalid one.
                </Callout>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Formal Grammar Definition & Description (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="animate-fade-up">
            <CardHeader
              dense
              icon={BookOpen}
              title="Formal Grammar Production Rules"
              actions={
                !isCustom && (
                  <Badge tone="indigo" size="xs" icon={Gauge}>
                    {activePreset.dfaStatesCount} DFA states
                  </Badge>
                )
              }
            />
            <CardBody className="space-y-3">
              <pre className="scroll-slim overflow-x-auto rounded-xl border border-ink-700/70 bg-ink-950 px-3.5 py-3 font-mono text-xs leading-relaxed text-indigo-300">
                {activePreset.formalGrammar}
              </pre>

              <div className="space-y-1.5">
                <InfoRow label="Token type" tone="cyan">
                  <span className="font-mono">{activePreset.tokenType}</span>
                </InfoRow>
                <InfoRow label="Example match" tone="emerald">
                  <span className="font-mono">{activePreset.exampleMatch}</span>
                </InfoRow>
                <InfoRow label="Example reject" tone="rose">
                  <span className="font-mono">{activePreset.exampleFail}</span>
                </InfoRow>
              </div>

              <Callout tone="note" icon={Regex} title="Description">
                <p className="text-balance leading-relaxed">{activePreset.description}</p>
              </Callout>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
