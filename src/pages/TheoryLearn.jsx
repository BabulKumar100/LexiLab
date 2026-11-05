import React, { useState } from 'react';
import { BookOpen, GraduationCap, ChevronDown, Workflow, Cpu, Scissors, ListTree } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Table, Td } from '../components/ui/StatTile';
import { cn } from '../utils/cn';

const SECTIONS = [
  { id: 'concepts', label: 'Concept Primer' },
  { id: 'distinction', label: 'Token / Lexeme / Pattern' },
  { id: 'viva', label: 'Top 15 Viva Q&A' },
];

/* Numbered-free section heading with a gradient accent rule; anchors live on the wrapping <section>. */
function SectionTitle({ icon: Icon, title, note }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-white sm:text-lg">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-balance">{title}</span>
      </h2>
      <span aria-hidden className="h-px min-w-6 flex-1 bg-grad-hairline" />
      {note && (
        <span className="font-mono text-2xs uppercase tracking-[0.14em] text-slate-500">{note}</span>
      )}
    </div>
  );
}

export function TheoryLearn() {
  const [openVivaIdx, setOpenVivaIdx] = useState(0);

  const vivaQuestions = [
    {
      q: "1. What is a Compiler and what are its major phases?",
      a: "A compiler is a language translator that converts high-level source code into low-level machine code or intermediate byte code. Its analysis-synthesis pipeline consists of six primary phases: 1) Lexical Analysis (Scanning), 2) Syntax Analysis (Parsing), 3) Semantic Analysis (Type & Scope Checking), 4) Intermediate Code Generation (3-Address Code), 5) Machine-Independent Optimization, and 6) Target Code Generation & Assembly."
    },
    {
      q: "2. What is the fundamental difference between a Token, a Lexeme, and a Pattern?",
      a: "• Pattern: The formal grammar description or regular expression defining what character sequences are acceptable (e.g. [a-zA-Z_][a-zA-Z0-9_]* for identifiers).\n• Lexeme: The actual sequence of characters in the source text that matches the pattern (e.g. 'counter', 'total_sum', '3.14').\n• Token: The abstract syntactic unit emitted to the parser, typically represented as a tuple <token-name, attribute-value> (e.g. <IDENTIFIER, pointer_to_symbol_table>)."
    },
    {
      q: "3. What is the Maximal Munch (or Longest Match) rule?",
      a: "Maximal Munch states that when scanning input characters, if more than one regular pattern can match a prefix of the remaining input, the scanner greedily selects the longest possible valid matching lexeme. For example, given 'a+++b', the scanner matches '++' (the 2-character increment operator) first rather than '+' followed by '+'. Hence, it tokenizes as (a++) + b."
    },
    {
      q: "4. Why is a Deterministic Finite Automaton (DFA) preferred over an NFA in lexical analysis?",
      a: "A DFA has no ambiguous transitions (no epsilon ε moves, and for each state and input symbol there is at most one unique destination state). This guarantees that matching a string of length N executes in deterministic, strictly linear time O(N), without the overhead of backtracking or maintaining sets of simultaneous active states."
    },
    {
      q: "5. How does the scanner distinguish keywords from user identifiers?",
      a: "Since keywords (such as 'int', 'float', 'if') share the exact same lexical grammar as identifiers ([a-zA-Z_][a-zA-Z0-9_]*), building separate DFA branches for dozens of keywords causes state explosion. Instead, the scanner parses any alphanumeric sequence as a potential identifier, then immediately performs an O(1) hash table lookup against the reserved keyword dictionary. If present, it emits a KEYWORD token; otherwise, an IDENTIFIER token."
    },
    {
      q: "6. What is the role of the Symbol Table in Lexical Analysis?",
      a: "The Symbol Table is the central dictionary of the compiler. When the lexical analyzer encounters a new identifier lexeme, it creates an entry recording its name, line number, column, and initial metadata. Subsequent compiler passes enrich this entry with inferred data types, memory offsets, scope levels, and function signatures."
    },
    {
      q: "7. What is the difference between a Lexical Error and a Syntax Error?",
      a: "• Lexical Error: Occurs when an input character does not belong to the language's alphabet (e.g., '@', '$') or when character sequences cannot be resolved by any token DFA (e.g., unterminated strings \"hello, malformed numbers 123abc).\n• Syntax Error: Occurs when the tokens are individually valid, but their ordering violates the context-free grammar rules of the language (e.g., missing semicolons, unmatched curly braces, or writing 'if + else')."
    },
    {
      q: "8. What is Lookahead and why is it needed?",
      a: "Lookahead refers to inspecting characters further ahead in the input stream without advancing the scanner's main position pointer. It is required to resolve ambiguities. For instance, upon reading '<', the scanner must peek at the next character to determine whether it is '<' (relational), '<=' (relational), '<<' (bitwise shift), or '<<=' (shift assignment)."
    },
    {
      q: "9. Why are whitespace and comments stripped during lexical analysis?",
      a: "Whitespace (spaces, tabs, newlines) and comments are written for human comprehension and code documentation. Because they convey no computational logic to machine instructions or syntax parse trees, the lexical analyzer strips them to compress the token stream."
    },
    {
      q: "10. What is Thompson's Construction Algorithm?",
      a: "Thompson's Construction is an algorithm that systematically compiles any Regular Expression into an equivalent Nondeterministic Finite Automaton (NFA) with ε-transitions. It builds base automata for primitive characters and connects them hierarchically for concatenation, union (|), and Kleene star (*)."
    },
    {
      q: "11. What is the Subset Construction (Powerset) Algorithm?",
      a: "Subset Construction converts an NFA with ε-transitions into an equivalent DFA. Each state in the resulting DFA represents a subset of states from the original NFA reachable via character transitions and ε-closures."
    },
    {
      q: "12. How does the lexical analyzer handle string escape sequences?",
      a: "When inside a string literal state, encountering a backslash '\\' causes a transition to an ESCAPE state. The subsequent character (e.g. 'n' for newline, 't' for tab, '\"' for literal quote) is recognized as an escape code and accumulated into the string's value buffer without prematurely terminating the string."
    },
    {
      q: "13. What is an input buffer pair and why is double buffering used?",
      a: "In commercial compilers reading massive source files from disk, a two-buffer scheme (double buffering) of fixed size (e.g. 4096 bytes) is used. One half is scanned while the other half is asynchronously filled from disk using I/O DMA, preventing disk I/O bottlenecks."
    },
    {
      q: "14. Can a language be compiled without a Lexical Analyzer?",
      a: "Theoretically yes (syntax analysis could process raw characters directly), but it is practically impractical. Parsing raw characters would increase grammar complexity by orders of magnitude, multiply grammar productions, and severely degrade compiler execution performance."
    },
    {
      q: "15. What are Lex / Flex in compiler construction?",
      a: "Lex (and Flex - Fast Lexical Analyzer Generator) are automated scanner generator tools. A programmer provides a specification file (.l) containing regular expressions paired with C action code. Flex compiles this specification into an optimized C DFA scanner table (yylex())."
    }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-14">
      <PageHeader
        className="mb-0"
        icon={BookOpen}
        kicker="Compiler Design Theory & Viva Prep"
        title="Lexical Analysis: Theory, Automata & Viva Guide"
        description="Master the foundational concepts of scanners, finite state machines, maximal munch, and review model answers for your college lab exam."
      />

      {/* Section index */}
      <nav
        aria-label="Page sections"
        className="panel-flat bevel-top flex flex-wrap items-center gap-2 px-3.5 py-2.5"
      >
        <span className="mr-1 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <ListTree className="h-3.5 w-3.5" />
          On this page
        </span>
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-lg border border-ink-700 bg-ink-900/60 px-2.5 py-1 text-2xs font-semibold text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
          >
            {section.label}
          </a>
        ))}
      </nav>

      {/* Conceptual Cards */}
      <section id="concepts" className="scroll-mt-24 space-y-3">
        <SectionTitle icon={Cpu} title="Concept Primer" />
        <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card hover className="h-full">
            <CardBody className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <Cpu className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-100">Compiler Pipeline</h3>
              <p className="max-w-prose text-xs leading-relaxed text-slate-400">
                Lexical analysis is the <strong className="font-bold text-cyan-200">Phase 1</strong> gatekeeper of compilation. It translates raw character byte streams into token tuples, removing whitespace and comments before handing over to the parser.
              </p>
            </CardBody>
          </Card>

          <Card hover className="h-full">
            <CardBody className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-300">
                <Workflow className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-100">Finite Automata</h3>
              <p className="max-w-prose text-xs leading-relaxed text-slate-400">
                Regular expressions define token patterns mathematically, which are converted into <strong className="font-bold text-blue-200">DFA</strong> state transition diagrams executing in strict linear <strong className="font-mono font-bold text-blue-200">O(N)</strong> time.
              </p>
            </CardBody>
          </Card>

          <Card hover className="h-full">
            <CardBody className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-300">
                <Scissors className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-slate-100">Maximal Munch</h3>
              <p className="max-w-prose text-xs leading-relaxed text-slate-400">
                The longest match principle ensures ambiguous character combinations like <code className="kbd">++</code> or <code className="kbd">&lt;=</code> are tokenized greedily as unified operators rather than fragments.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Comparison Table: Token vs Lexeme vs Pattern */}
      <section id="distinction" className="scroll-mt-24">
        <Card>
          <CardHeader icon={BookOpen} title="Core Distinction: Token vs. Lexeme vs. Pattern" />
          <CardBody className="p-0">
            <Table
              head={[{ label: 'Concept' }, { label: 'Definition' }, { label: 'Examples' }]}
              stickyHead={false}
            >
              <tr className="row-hover">
                <Td className="font-bold text-cyan-300">Pattern</Td>
                <Td className="leading-relaxed text-slate-300">The formal grammar rule or regular expression defining strings.</Td>
                <Td mono className="text-slate-400">[a-zA-Z_][a-zA-Z0-9_]*</Td>
              </tr>
              <tr className="row-hover">
                <Td className="font-bold text-emerald-300">Lexeme</Td>
                <Td className="leading-relaxed text-slate-300">The concrete sequence of characters in the program code matching a pattern.</Td>
                <Td mono className="text-slate-400">'int', 'counter', '3.14', '&lt;='</Td>
              </tr>
              <tr className="row-hover">
                <Td className="font-bold text-purple-300">Token</Td>
                <Td className="leading-relaxed text-slate-300">The abstract category pair &lt;token-name, attribute-value&gt; passed to parser.</Td>
                <Td mono className="text-slate-400">&lt;KEYWORD&gt;, &lt;IDENTIFIER, sym_ptr&gt;</Td>
              </tr>
            </Table>
          </CardBody>
        </Card>
      </section>

      {/* Top 15 Viva Questions Accordion */}
      <section id="viva" className="scroll-mt-24 space-y-4">
        <SectionTitle
          icon={GraduationCap}
          title="Top 15 College Viva & Exam Questions (with Model Answers)"
          note="Click to expand"
        />

        <div className="stagger space-y-2.5">
          {vivaQuestions.map((vq, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <Card
                key={idx}
                bevel={false}
                className={cn(
                  'overflow-hidden transition-colors duration-200',
                  isOpen ? 'border-cyan-500/30 shadow-lifted' : 'hover:border-ink-650/80'
                )}
              >
                <button
                  onClick={() => setOpenVivaIdx(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-8 w-0.5 shrink-0 rounded-full transition-all duration-200',
                      isOpen ? 'bg-grad-brand' : 'bg-ink-700'
                    )}
                  />
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug tracking-tight text-slate-100">
                    {vq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      isOpen ? 'rotate-180 text-cyan-300' : 'text-slate-500'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-ink-700/60 bg-ink-950/45 px-4 py-3.5">
                    <Badge tone="cyan" size="xs" className="mb-2">
                      Model Answer
                    </Badge>
                    <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-slate-300">
                      {vq.a}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
