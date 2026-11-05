# ⚡ LexiLab — Interactive Lexical Analyzer & Tokenization Simulator

> An educational Compiler Design workbench and interactive scanner simulator for college labs, viva
> demonstrations and CS students. Type C-like source, watch it become tokens.

**Scope boundary:** LexiLab is a *lexical analyzer (scanner) simulator for a C99 subset*. It does not
parse, type-check or generate code, and it should not be presented as a complete C compiler.

Live demo: deploy to GitHub Pages (see [Deploy](#-deploy-to-github-pages)) — the app is fully static.

---

## 📦 At a glance

| | |
| --- | --- |
| React app, client-side only | 15 routes, no backend |
| Hand-written character scanner | `src/engine/lexer.js`, single O(n) pass |
| Token taxonomy | 17 token types with badge + description metadata |
| Reserved words | 41 keywords across 6 categories |
| Operator table | 37 operators, sorted longest-first for maximal munch |
| Separators | 8 punctuation classes |
| Formal patterns published | 8 regex + BNF definitions |
| DFA models visualized | 5 (identifier, number, string, character literal, relational) |
| Sample programs | 6 fixtures (starter, maximal-munch, errors-demo, factorial-function, struct-pointers, hex-binary-numbers) |
| Learning content | 15 viva Q&As + 15 quiz MCQs |
| Automated tests | 77 Vitest assertions on the engine |
| Stack | React 18.3 · Vite 6 · Tailwind CSS 3.4 · react-router-dom 6.28 · lucide-react · Vitest 2 |

---

## 🌟 Key Features

### 1. 🖥️ Core Lexical Workbench
- **Real scanner engine, not a regex pass**: the character scanner drives keyword lookup, identifiers,
  numeric literals (decimal, hex `0xFF`, octal `0777`, binary `0b1010`, floats, scientific `1e-4`,
  suffixes `f`/`l`), string literals, character constants with escapes, operators, separators,
  preprocessor directives and comments.
- **Maximal Munch (longest-match principle)**: ambiguous input resolves correctly — `a+++b` → `(a++) + b`,
  `<<=` stays one 3-character operator, `<==` → `<` then `==`.
- **Source code editor**: line-number gutter with active-line marker, live cursor `Ln / Col` readout,
  token count in the status bar, copy/download `.c`, and instant re-scan on every keystroke.
- **Dual visual modes**: raw editing or an interactive **Tokens Overlay** where each lexeme is color-coded
  by grammatical category and clickable.

### 2. 📊 Token & Symbol Table Analysis
- **Token stream table**: Token ID, raw lexeme, type badge, line, column, semantics; free-text search,
  category filters, CSV export.
- **Deep token inspector**: click any row to see source position, input offset range `[start, end)`,
  numeric base, role in compilation, and the **regular expression + formal (BNF) grammar** with a live
  verdict on whether that pattern accepts or rejects the exact lexeme. Operator and separator patterns
  are generated from the scanner's own tables, so the inspector can never drift from the engine.
- **Symbol table**: unique identifiers with first-occurrence line/column, occurrence counts and a
  function-vs-variable lookahead hint (next non-space character is `(`). The inferred data type and the
  virtual memory address are explicitly labelled **educational extras owned by later compiler phases** —
  a scanner cannot know either.
- **Comment handling**: comments are *skipped* by default, exactly like a standard compiler front-end.
  A toggle in the token table re-scans with `includeComments` so `COMMENT` tokens become visible.

### 3. 🚨 Lexical Errors vs. Syntax Notes
- **True lexical errors** (the DFA has no accepting path): illegal characters (`@`, `$`), unterminated
  strings, unterminated block comments, empty char literals, and malformed numeric literals such as `0x`,
  `0b12`, `099` → `ERR_MALFORMED_NUMBER`.
- **Syntax-phase notes**: maximal munch means `int 123invalid` is *two* tokens (`INTEGER_LITERAL` `123`
  and `IDENTIFIER` `invalid`), not one bad identifier. LexiLab emits both tokens and attaches a
  `SYN_NUMBER_IDENTIFIER_ADJACENCY` note that spells out both positions and explains that rejecting the
  declaration is the parser's job. Same reasoning for `3.14.15` → `3.14` then `.15`.
- Errors and notes are rendered in separate, differently-coloured sections so the two phases never read
  alike; each error carries a code, a source snippet with carets and an actionable fix.

### 4. 🔄 Automata & Step-by-Step Simulator
- **Interactive DFA visualizer** (`/dfa`): SVG state machines for **identifier, number, string,
  character literal and relational operators**. Type any test string and watch the active state animate,
  with start arrows, self-loops and accept/trap markers, alongside the formal 5-tuple
  $M = (Q, \Sigma, \delta, q_0, F)$.
- **Maximal-munch demo** (`/maximal-munch`) and **lookahead explorer** (`/lookahead`): side-by-side
  tokenizations that show *why* the scanner chose a boundary and what LA(1)/LA(2) changes.
- **Step-by-step scanner trace** (`/step-trace`): character-by-character playback with current char, both
  lookaheads, buffer accumulator, active DFA state and a live emission stream. Play / pause / speed,
  next char, next token. The trace shares `numberScanner.js` with the lexer, so its output is identical
  to the token table by construction.
- **Test playground** (`/playground`): ready-made cases carry the expected lexeme sequence — and, where
  relevant, the exact column numbers — compared against live scanner output with a per-case pass/fail
  verdict. Edit the source and the comparison pauses so you can explore freely.

### 5. 🎯 Learning & Viva Module
- **Theory guide** (`/learn`): compilation phases, *Token vs. Lexeme vs. Pattern*, DFA vs. NFA, subset
  construction, Thompson's construction, an on-page contents index, and the Top-15 viva Q&A accordion.
- **Quiz** (`/quiz`): 15 MCQs with instant feedback, explanations, progress and score celebration.
- **Regex explorer** (`/regex`): live tester against the formal definitions with match/reject examples.
- **Documentation** (`/documentation`): scanner rules, pipeline, pseudocode and grammar subset.
- **Exports**: token table → CSV, full analysis report → JSON, source → `.c`.

---

## 🗺️ Routes

The app uses hash routing, so every route is directly linkable from a static host:

`#/` · `#/tokens` · `#/symbols` · `#/dfa` · `#/step-trace` · `#/maximal-munch` · `#/lookahead` ·
`#/playground` · `#/regex` · `#/errors` · `#/statistics` · `#/examples` · `#/learn` · `#/quiz` ·
`#/documentation`

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18 (declared in `package.json` → `engines`)
- npm

```bash
npm install        # dependencies
npm run dev        # dev server on http://localhost:3000
npm test           # Vitest single run: 77 engine assertions (CI-safe, no watch)
npm run test:watch # Vitest in watch mode
npm run build      # production bundle into dist/
npm run preview    # serve dist/ locally to verify before deploying
```

---

## 🌐 Deploy to GitHub Pages

Deployment is automated with GitHub Actions (`.github/workflows/deploy-pages.yaml`):
`npm ci` → `npm test` → `npm run build` → upload `dist/` → `actions/deploy-pages`. The workflow's
`concurrency.cancel-in-progress` is `false` on purpose — a half-finished Pages release is harder to reason
about than a queued one.

1. Push this repository to GitHub.
2. Repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Actions → “Build and deploy to GitHub Pages” → Run workflow** (also runs automatically on `main` pushes).
4. The site is live at `https://<user>.github.io/<repo>/`.

Two settings make the build host-path agnostic — do not remove them:
- `base: './'` in `vite.config.js` → relative asset URLs, so a `/<repo-name>/` sub-path works without
  editing config per repository.
- `HashRouter` in `src/App.jsx` → routes become `#/tokens`, `#/dfa`. A static host such as Pages cannot
  rewrite an unknown deep link back to `index.html`, so path-based routing would 404 on refresh.

Prefer another host? Run `npm run build` and publish `dist/` anywhere static — Netlify, Vercel, S3, or
`gh-pages`. The bundle is path-agnostic.

---

## 🛠️ Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Panels render unstyled, or PostCSS errors with *“The `border-ink-700/70` class does not exist”* | The running Vite process is holding a stale `tailwind.config.js`. Stop it (Ctrl+C) and re-run `npm run dev`. The shared `.panel`, `.kbd`, `.stagger` etc. utilities in `src/index.css` are deliberately plain CSS so a stale config can never blank the whole stylesheet again. |
| Deep link 404s after deploying | Pages cannot rewrite paths. Keep `HashRouter` and `base: './'`; links must look like `https://<user>.github.io/<repo>/#/dfa`. |
| Port 3000 already busy | Vite falls back to the next free port; the terminal prints the actual URL. |
| “Copy” does nothing on a `http://` LAN host or `file://` | Browsers expose `navigator.clipboard` only in secure contexts. `src/utils/clipboard.js` detects this and the app tells you to select-and-copy manually instead of failing silently. |

---

## 🎨 Design System

A tokenized dark “compiler console” theme, defined once and consumed through components instead of
per-file hex values:

- `tailwind.config.js` — the `ink` depth scale (`#070B14` → `#2A436D`), `brand` accents, `grad-brand` /
  `grad-text` / `grad-hairline` gradients, `panel` / `lifted` / `glow` shadows, a `2xs` size step and the
  entrance keyframes (`fade-up`, `pop-in`, `slide-left`, `shimmer`, `soft-float`, `ring-pulse`).
- `src/index.css` — CSS custom properties plus the `.ambient` layered backdrop (engineering grid + three
  accent glows), `.panel`, `.bevel-top` gradient hairline, `.kbd`, `.scroll-slim`, `.row-hover` and the
  `.stagger` entrance delays; a `prefers-reduced-motion` override disables all of it.
- `src/components/ui/` — `Card`, `Button` / `IconButton`, `Badge` / `CountPill` / `MeterBar`,
  `PageHeader` / `Tabs` / `EmptyState`, `StatTile` / `Table` / `Td` / `InfoRow` / `Callout`, merged with
  `cn()` (`clsx` + `tailwind-merge`).

| Token | Value |
| --- | --- |
| Page background | `#070B14` (`ink-950`) |
| Panel / surface | `#0A101D` → `#111D30` (`ink-900` → `ink-800`) |
| Borders | `#1E2F4D` (`ink-700`) |
| Brand gradient | `#3B82F6 → #22D3EE → #6366F1` |
| Success / error | `#10B981` / `#F43F5E` |

---

## 📂 Project Structure

```
LexiLab/
├── .github/workflows/deploy-pages.yaml    # CI: test + build + publish to Pages
├── index.html                             # shell, meta/OG tags, pre-hydration splash
├── src/
│   ├── components/
│   │   ├── layout/          # Layout shell (ambient bg, mobile drawer, toasts), Sidebar, Navbar
│   │   ├── editor/          # CodeEditor (gutter + token overlay), EditorToolbar
│   │   ├── tokens/          # TokenTable, TokenBadge, TokenInspectorModal
│   │   ├── dfa/             # DFAGraph (SVG), DFAStepper
│   │   ├── dashboard/       # TokenChart (StatCard is legacy/unused)
│   │   └── ui/              # design system: Card, Button, Badge, PageHeader, StatTile, Table, Callout
│   ├── engine/
│   │   ├── lexer.js         # core O(n) character scanner
│   │   ├── scanner.js       # step-by-step trace generator (mirrors lexer rules)
│   │   ├── numberScanner.js # shared numeric DFA: dec/hex/oct/bin, floats, suffixes
│   │   ├── tokenTypes.js    # 17 token types + badge/description metadata
│   │   ├── keywords.js      # 41 C reserved words in 6 categories
│   │   ├── operators.js     # 37 operators sorted for maximal munch + 8 separators
│   │   ├── symbolTable.js   # symbol table manager
│   │   ├── errorHandler.js  # error objects, codes, source snippets
│   │   └── positionTracker.js  # legacy helper, currently unused by the lexer
│   ├── data/
│   │   ├── samplePrograms.js # 6 ready-made C programs
│   │   ├── regexRules.js     # 8 regex + formal grammar definitions
│   │   ├── dfaDefinitions.js # 5 DFA models & simulation logic
│   │   └── quizQuestions.js  # 15 MCQs
│   ├── pages/                # 15 route components (one per hash route above)
│   ├── context/AppContext.jsx # global state: source, analysis, selection, toasts
│   ├── utils/                 # cn.js, clipboard.js, exportCSV.js, exportJSON.js
│   ├── App.jsx                # HashRouter route table
│   ├── main.jsx               # mount + splash removal
│   └── index.css              # CSS custom properties, ambient/panel/stagger utilities
├── tests/lexer.test.js        # Vitest suite (77 tests)
├── tailwind.config.js         # design tokens
├── postcss.config.js          # tailwindcss + autoprefixer
├── vite.config.js             # base './', port 3000, dist output
└── package.json
```

---

## 🎓 College Viva Quick Reference

1. **What is Maximal Munch?**
   The scanner consumes the longest prefix that still matches a valid token pattern before emitting a
   token: `a+++b` → `(a++) + b`, not `(a) + (++b)`.
2. **Token vs. Lexeme vs. Pattern**
   - *Pattern*: the rule (regex / grammar) — e.g. `[A-Za-z_][A-Za-z0-9_]*`
   - *Lexeme*: the actual characters in the source — e.g. `total_sum`
   - `Token`: the category handed to the parser — e.g. `<IDENTIFIER, total_sum>`
3. **Why DFA instead of NFA?**
   A DFA has no ambiguity or ε-moves, so recognition is $\mathcal{O}(n)$ in a single pass with no
   backtracking — which is why real scanners are table-driven DFAs.
4. **Is `printf` a function token?**
   No. At the lexical level `printf` is an `IDENTIFIER`; only the parser (after seeing `(`) knows it is a
   call. LexiLab keeps that distinction and reports the lookahead as a *hint*, never as a token type.
5. **Can a symbol table store types?**
   The scanner records names and positions. Type and scope are *semantic* — LexiLab displays them, but
   labels them as later-phase extras so the lexical boundary stays honest.
6. **Why are comments not in the token stream?**
   A compiler front-end discards them. LexiLab skips them by default and offers an explicit toggle so you
   can show the `COMMENT` tokens when the lab asks about them.
