import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, CheckCircle2, Sparkles, FileCode2, Braces, Lightbulb } from 'lucide-react';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatTile, Callout } from '../components/ui/StatTile';

export function ErrorDiagnostics() {
  const { analysis, loadSample } = useApp();
  const errors = analysis.errors || [];
  const syntaxNotes = analysis.syntaxNotes || [];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={AlertOctagon}
        kicker="Compiler Phase 1 · Scanner Pass"
        title="Lexical Error Diagnostics"
        description="Lexical failures stay in this scanner pass. A number glued to a name is reported separately as a syntax-phase note."
        actions={
          <Button
            variant="danger"
            size="sm"
            icon={FileCode2}
            onClick={() => loadSample('errors-demo')}
          >
            Load Errors Demo Code
          </Button>
        }
      />

      {/* Summary strip: the two phases are counted and coloured separately. */}
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          label="Lexical Errors"
          value={errors.length}
          hint="Rejected by the scanner itself"
          icon={AlertOctagon}
          tone="rose"
        />
        <StatTile
          label="Syntax Notes"
          value={syntaxNotes.length}
          hint="Legal tokens, illegal arrangement"
          icon={Braces}
          tone="amber"
        />
      </div>

      {/* Lexical errors — phase LEXICAL, hard scanner failures */}
      <section className="space-y-3">
        <div className="flex flex-col gap-1.5 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold text-rose-300">
            <Badge tone="rose" size="xs" dot>Phase LEXICAL</Badge>
            <span>Found {errors.length} Lexical Diagnostic(s)</span>
          </p>
          <p className="text-2xs uppercase tracking-[0.14em] text-slate-500">
            Compiler Phase: Scanner Pass 1
          </p>
        </div>

        {errors.length === 0 ? (
          <Card bevel={false}>
            <EmptyState
              icon={CheckCircle2}
              title="Zero Lexical Errors Detected"
              description={
                syntaxNotes.length > 0
                  ? 'The scanner accepted every character pattern. Amber notes below belong to a later syntax phase, such as a number sitting directly against an identifier.'
                  : 'Every character matches the C-like lexical grammar. Strings, comments, and numeric literals are properly formed.'
              }
              action={
                <Button variant="secondary" size="sm" icon={FileCode2} onClick={() => loadSample('errors-demo')}>
                  Want to test error handling? Load Errors Sample Program
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="stagger space-y-3">
            {errors.map((err, idx) => (
              <Callout
                key={idx}
                tone="danger"
                icon={AlertOctagon}
                title={`${err.phase} · ${err.code}`}
              >
                <p className="text-sm font-semibold text-white">{err.message}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="rose" size="xs" mono>
                    Line {err.line}, Column {err.column}
                  </Badge>
                  <span className="text-2xs uppercase tracking-[0.12em] text-rose-200/60">
                    Scanner rejects this character sequence
                  </span>
                </div>

                {/* Source excerpt with caret markers: whitespace must never wrap. */}
                <pre
                  className="scroll-slim mt-2.5 max-w-full overflow-x-auto whitespace-pre rounded-lg border border-rose-500/20 bg-ink-950/80 px-3 py-2 font-mono text-2xs leading-5 text-rose-200"
                  aria-label={`Source excerpt for ${err.code}`}
                >
                  {err.snippet}
                </pre>

                <p className="mt-2 flex items-start gap-1.5">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300/70" />
                  <span>
                    <span className="font-bold uppercase tracking-[0.1em] text-rose-200/80">
                      Fix Recommendation:
                    </span>{' '}
                    <span>{err.suggestion}</span>
                  </span>
                </p>
              </Callout>
            ))}
          </div>
        )}
      </section>

      {/* Syntax-phase notes — advisory, never counted as lexical errors */}
      {syntaxNotes.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-col gap-1.5 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Badge tone="amber" size="xs" dot>Phase SYNTAX</Badge>
              <span>{syntaxNotes.length} Syntax-phase note(s) — not lexical errors</span>
            </p>
            <p className="text-2xs uppercase tracking-[0.14em] text-slate-500">
              Future parser phase
            </p>
          </div>

          <div className="stagger space-y-3">
            {syntaxNotes.map((note, idx) => (
              <Callout
                key={idx}
                tone="warn"
                icon={Braces}
                title={`${note.phase} · ${note.code}`}
              >
                <p className="text-sm font-semibold text-white">{note.message}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="amber" size="xs" mono>
                    Line {note.line}, Column {note.column}
                  </Badge>
                  <span className="text-2xs uppercase tracking-[0.12em] text-amber-200/60">
                    Scanner accepted every token here
                  </span>
                </div>

                <p className="mt-2 flex items-start gap-1.5">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/70" />
                  <span>
                    <span className="font-bold uppercase tracking-[0.1em] text-amber-200/80">
                      Why it is not a lexical error:
                    </span>{' '}
                    <span>{note.suggestion}</span>
                  </span>
                </p>
              </Callout>
            ))}
          </div>
        </section>
      )}

      {/* College viva difference box */}
      <Card>
        <CardHeader
          icon={Sparkles}
          title="Viva Question: Difference between Lexical Error and Syntax Error?"
          dense
        />
        <CardBody>
          <div className="grid gap-3 text-xs text-slate-400 md:grid-cols-2">
            <div className="rounded-xl border border-rose-500/20 bg-ink-950/50 p-3.5">
              <p className="mb-1.5 flex items-center gap-2">
                <Badge tone="rose" size="xs" dot>Lexical Error</Badge>
                <span className="text-2xs uppercase tracking-[0.12em] text-slate-500">Phase 1</span>
              </p>
              <p className="leading-relaxed text-balance">
                The character sequence itself is illegal: unknown alphabet symbol, unclosed string or comment, empty character literal, or a bad digit in hex, binary, or octal. Examples: <code className="font-mono text-cyan-200">@</code>, <code className="font-mono text-cyan-200">&quot;unclosed</code>, <code className="font-mono text-cyan-200">08</code>, <code className="font-mono text-cyan-200">0x</code>.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-ink-950/50 p-3.5">
              <p className="mb-1.5 flex items-center gap-2">
                <Badge tone="amber" size="xs" dot>Syntax Error</Badge>
                <span className="text-2xs uppercase tracking-[0.12em] text-slate-500">Phase 2</span>
              </p>
              <p className="leading-relaxed text-balance">
                Every token is legal, but the sequence is not a valid program. <code className="font-mono text-cyan-200">int 123invalid = 50;</code> scans as keyword, integer <code className="font-mono text-cyan-200">123</code>, identifier <code className="font-mono text-cyan-200">invalid</code>. The parser rejects that declaration. <code className="font-mono text-cyan-200">printf</code> stays an identifier here; a later phase may treat <code className="font-mono text-cyan-200">printf(</code> as a call.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
