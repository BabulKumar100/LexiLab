import React from 'react';
import {
  FileText,
  Cpu,
  Workflow,
  Code2,
  AlertTriangle,
  Info,
  KeyRound,
  Binary,
  Hash,
  MessageSquareCode,
  ListTree,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';

const DOC_SECTIONS = [
  { id: 'rules', label: 'Boundary & Classification Rules' },
  { id: 'pipeline', label: '1. Scanner Pipeline' },
  { id: 'pseudocode', label: '2. Algorithm Pseudocode' },
  { id: 'grammar', label: '3. Grammar Subset' },
];

export function Documentation() {
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-14">
      <PageHeader
        className="mb-0"
        icon={FileText}
        kicker="Technical Architecture & Specs"
        title="LexiLab System Documentation"
        description="LexiLab is a simulator for the lexical analysis of a C-like subset. It is not a complete C compiler. Parsing and semantic analysis are described only as later phases."
      />

      {/* Section index */}
      <nav
        aria-label="Documentation sections"
        className="panel-flat bevel-top flex flex-wrap items-center gap-2 px-3.5 py-2.5"
      >
        <span className="mr-1 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <ListTree className="h-3.5 w-3.5" />
          Contents
        </span>
        {DOC_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-lg border border-ink-700 bg-ink-900/60 px-2.5 py-1 text-2xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <section id="rules" className="scroll-mt-24">
        <Card className="border-amber-500/25">
          <CardHeader
            icon={AlertTriangle}
            title="Boundary and classification rules"
            className="border-amber-500/20"
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-ink-700/40">
              <li className="flex items-start gap-2.5 bg-cyan-500/[0.06] px-5 py-3 text-xs leading-relaxed text-slate-300">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                <span className="max-w-prose">
                  <code className="kbd">printf</code> is always an <Badge tone="purple" size="xs" mono>IDENTIFIER</Badge>. A following <code className="kbd">(</code> is only a semantic hint that a later phase might see a call.
                </span>
              </li>
              <li className="flex items-start gap-2.5 px-5 py-3 text-xs leading-relaxed text-slate-300">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                <span className="max-w-prose">
                  Inferred <code className="kbd">int</code> / <code className="kbd">float</code> types live in the Extended Symbol Table. They are educational metadata, not lexer token classes.
                </span>
              </li>
              <li className="flex items-start gap-2.5 px-5 py-3 text-xs leading-relaxed text-slate-300">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                <span className="max-w-prose">
                  Comments are skipped by default. Token Analysis has a <span className="font-semibold text-slate-100">Show Comments</span> toggle that emits <Badge tone="slate" size="xs" mono>COMMENT</Badge> tokens.
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-cyan-500/[0.06] px-5 py-3 text-xs leading-relaxed text-slate-300">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                <span className="max-w-prose">
                  For <code className="kbd">printf(&quot;Hello World\n&quot;);</code> with four leading spaces, <span className="font-mono text-2xs font-medium text-slate-200">columns are printf <span className="font-bold text-cyan-300">5</span>, ( <span className="font-bold text-cyan-300">11</span>, string <span className="font-bold text-cyan-300">12</span>, ) <span className="font-bold text-cyan-300">27</span>, ; <span className="font-bold text-cyan-300">28</span>.</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5 px-5 py-3 text-xs leading-relaxed text-slate-300">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                <span className="max-w-prose">
                  <code className="kbd">123invalid</code> is <Badge tone="amber" size="xs" mono>INTEGER</Badge> <code className="kbd">123</code> plus <Badge tone="purple" size="xs" mono>IDENTIFIER</Badge> <code className="kbd">invalid</code>. The declaration is a syntax problem. <code className="kbd">@</code>, <code className="kbd">08</code>, and unclosed strings are lexical errors.
                </span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* Architecture Overview */}
      <section id="pipeline" className="scroll-mt-24">
        <Card>
          <CardHeader icon={Cpu} title="1. Lexical Scanner Pipeline Architecture" />
          <CardBody className="space-y-4">
            <p className="max-w-prose text-xs leading-relaxed text-slate-300">
              LexiLab implements a high-performance single-pass scanner for ANSI/ISO C code executing directly in the client browser with deterministic linear complexity <code className="kbd">O(N)</code>.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4 transition-colors duration-200 hover:border-cyan-500/30">
                <Badge tone="cyan" size="xs" mono>Stage 1: Source &amp; Buffer</Badge>
                <p className="max-w-prose text-2xs leading-relaxed text-slate-400">
                  Source string is indexed with a coordinate tracker maintaining 1-based line and column numbers across newlines (\n) and tabs (\t).
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4 transition-colors duration-200 hover:border-blue-500/30">
                <Badge tone="blue" size="xs" mono>Stage 2: Maximal Munch</Badge>
                <p className="max-w-prose text-2xs leading-relaxed text-slate-400">
                  Multi-character operators (e.g. &lt;&lt;=, ++, !=) take precedence over single-character operators via descending sorted lookup tables.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4 transition-colors duration-200 hover:border-emerald-500/30">
                <Badge tone="emerald" size="xs" mono>Stage 3: Token &amp; Symbol</Badge>
                <p className="max-w-prose text-2xs leading-relaxed text-slate-400">
                  Tokens are packaged with coordinates and semantic metadata. Identifiers populate the Symbol Table with inferred types and line arrays.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Algorithm Pseudocode */}
      <section id="pseudocode" className="scroll-mt-24">
        <Card>
          <CardHeader icon={Code2} title="2. Core Scanner Algorithm Pseudocode" />
          <CardBody className="p-0">
            <pre className="scroll-slim select-all overflow-x-auto border-t border-ink-700/60 bg-ink-950/60 px-5 py-4 font-mono text-xs leading-relaxed text-indigo-200">
{`function tokenize(sourceCode):
    tokens = []
    errors = []
    symbolTable = new SymbolTable()
    index = 0, line = 1, col = 1

    while index < sourceCode.length:
        ch = peek()

        if isWhitespace(ch):
            advance()
            continue

        if isComment(ch):
            consumeComment()
            continue

        if isAlpha(ch):
            lexeme = scanIdentifier()
            if isKeyword(lexeme):
                tokens.add(KEYWORD, lexeme)
            else:
                tokens.add(IDENTIFIER, lexeme)
                symbolTable.insert(lexeme, line, col)
            continue

        if isDigit(ch):
            num = scanNumber()
            tokens.add(INTEGER or FLOAT, num)
            continue

        if ch == '"' or ch == "'":
            lit = scanLiteral()
            tokens.add(STRING or CHAR, lit)
            continue

        if matchLongestOperator():
            tokens.add(OPERATOR, matchedOp)
            continue

        if isSeparator(ch):
            tokens.add(SEPARATOR, ch)
            continue

        // Error fallback
        errors.add(ERR_INVALID_CHARACTER, ch, line, col)
        advance()

    return { tokens, errors, symbolTable }`}
            </pre>
          </CardBody>
        </Card>
      </section>

      {/* Supported Grammar Subset */}
      <section id="grammar" className="scroll-mt-24">
        <Card>
          <CardHeader icon={Workflow} title="3. Supported C Language Lexical Grammar" />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-200">Keywords (37 reserved words)</span>
                </div>
                <p className="max-w-prose font-mono text-2xs leading-relaxed text-slate-400">
                  auto, break, case, char, const, continue, default, do, double, else, enum, extern, float, for, goto, if, inline, int, long, register, return, short, signed, sizeof, static, struct, switch, typedef, union, unsigned, void, volatile, while, bool, true, false, NULL
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4">
                <div className="flex items-center gap-2">
                  <Binary className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-200">Operators (Maximal Munch)</span>
                </div>
                <p className="max-w-prose font-mono text-2xs leading-relaxed text-slate-400">
                  &lt;&lt;=, &gt;&gt;=, ==, !=, &lt;=, &gt;=, &amp;&amp;, ||, ++, --, +=, -=, *=, /=, %=, &amp;=, |=, ^=, &lt;&lt;, &gt;&gt;, -&gt;, +, -, *, /, %, &lt;, &gt;, =, !, &amp;, |, ^, ~, ?, :, .
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                  <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-200">Literals & Constants</span>
                </div>
                <p className="max-w-prose leading-relaxed text-slate-400">
                  Decimal (<code className="kbd">42</code>), octal (<code className="kbd">010</code>), hex (<code className="kbd">0xFF</code>), binary (<code className="kbd">0b101</code>), scientific (<code className="kbd">1e-4</code>), strings, and character literals including escapes.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ink-700/70 bg-ink-950/50 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCode className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                  <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-200">Comments & Directives</span>
                </div>
                <p className="max-w-prose leading-relaxed text-slate-400">
                  Single-line comments (<code className="kbd">// ...</code>), Multi-line block comments (<code className="kbd">/* ... */</code>), Preprocessor lines (<code className="kbd text-rose-300">#include, #define</code>).
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
