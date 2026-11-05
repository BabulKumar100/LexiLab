// LexiLab - Interactive Tokenization & Compiler Design Quiz Questions

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary role of the Lexical Analyzer (Scanner) in a compiler?",
    options: [
      "Translating source characters into an abstract syntax tree (AST)",
      "Scanning the source code character stream and grouping them into meaningful tokens",
      "Allocating memory registers for identifiers and variables",
      "Performing semantic type checking and scope analysis"
    ],
    correctIndex: 1,
    explanation: "The Lexical Analyzer reads characters from the source program, strips comments and whitespace, and groups characters into tokens (lexemes) for the parser."
  },
  {
    id: 2,
    question: "Which of the following describes the difference between a Lexeme, a Pattern, and a Token?",
    options: [
      "A token is the raw code string, a lexeme is the grammar rule, and pattern is the token number",
      "A pattern is the rule describing a set of strings, a lexeme is the actual character sequence in the code, and a token is the abstract category pair <token-name, attribute-value>",
      "They are identical terms used interchangeably in compiler construction",
      "A lexeme is stored in the symbol table while tokens are discarded immediately"
    ],
    correctIndex: 1,
    explanation: "Pattern is the formal rule (e.g. [a-zA-Z_][a-zA-Z0-9_]*), Lexeme is the concrete instance string (e.g. 'counter'), and Token is the grammatical category (<IDENTIFIER, pointer>)."
  },
  {
    id: 3,
    question: "What is the 'Maximal Munch' (or Longest Match) principle?",
    options: [
      "The scanner consumes as much RAM as possible during lexical passes",
      "When multiple prefix patterns match, the scanner chooses the longest matching valid lexeme",
      "The scanner combines all tokens into one large parse tree",
      "Tokens with higher character count are placed first in the symbol table"
    ],
    correctIndex: 1,
    explanation: "Maximal Munch ensures that ambiguous token sequences (such as 'a+++b' or '<=') are parsed as the longest valid token (e.g., '++' rather than two separate '+' operators, or '<=' rather than '<' followed by '=')."
  },
  {
    id: 4,
    question: "How does the lexical analyzer distinguish between a user identifier and a reserved keyword?",
    options: [
      "Keywords are written in uppercase while identifiers are lowercase",
      "The scanner first matches the identifier pattern, then consults a keyword lookup table/hash table",
      "Identifiers are parsed in syntax analysis, not lexical analysis",
      "By using two completely separate source code files"
    ],
    correctIndex: 1,
    explanation: "Because keywords follow the identical lexical pattern as identifiers, the scanner scans the identifier lexeme and immediately checks if it exists in the reserved keyword table."
  },
  {
    id: 5,
    question: "Which formal computational model is directly used to implement the Lexical Analyzer?",
    options: [
      "Pushdown Automaton (PDA)",
      "Turing Machine (TM)",
      "Deterministic Finite Automaton (DFA)",
      "Linear Bounded Automaton (LBA)"
    ],
    correctIndex: 2,
    explanation: "Regular expressions define token patterns, and DFAs (Deterministic Finite Automata) are used to recognize them with linear time complexity O(N)."
  },
  {
    id: 6,
    question: "In the expression 'int count = 10 @ 5;', what type of error will the compiler produce?",
    options: [
      "Syntax Error",
      "Lexical Error",
      "Semantic Error",
      "Linker Error"
    ],
    correctIndex: 1,
    explanation: "The character '@' is not part of the C lexical alphabet; therefore, the scanner flags an illegal character error during lexical analysis."
  },
  {
    id: 7,
    question: "What is the time complexity of scanning an input of length N using a Deterministic Finite Automaton (DFA)?",
    options: [
      "O(1)",
      "O(N)",
      "O(N log N)",
      "O(N^2)"
    ],
    correctIndex: 1,
    explanation: "Because each character in the input triggers exactly one state transition in a DFA, the recognition time is strictly linear O(N)."
  },
  {
    id: 8,
    question: "Which data structure is primarily populated by the Lexical Analyzer to store identifier attributes?",
    options: [
      "Symbol Table",
      "Call Stack",
      "Abstract Syntax Tree",
      "Control Flow Graph"
    ],
    correctIndex: 0,
    explanation: "The Symbol Table is created and populated with identifier names, locations, and attributes for subsequent compiler phases."
  },
  {
    id: 9,
    question: "In C, if you write 'int 123abc = 10;', at what stage and why does it fail?",
    options: [
      "Syntax stage because semicolon is misplaced",
      "Lexical stage because an identifier cannot start with numerical digits",
      "Semantic stage because variable types do not match",
      "Linker stage because main() is missing"
    ],
    correctIndex: 1,
    explanation: "In C, the regular expression for identifiers requires a leading letter or underscore ([a-zA-Z_]). Starting with digits is a lexical violation."
  },
  {
    id: 10,
    question: "What happens if a multi-line comment '/* ...' is never closed before the end of the file?",
    options: [
      "The compiler ignores the remainder of the program quietly",
      "A lexical error 'Unterminated comment' is flagged",
      "The parser automatically closes the comment at EOF",
      "It becomes a runtime exception"
    ],
    correctIndex: 1,
    explanation: "A block comment that reaches EOF without matching '*/' violates lexical grammar, producing an 'unterminated comment' lexical diagnostic."
  },
  {
    id: 11,
    question: "Why does the lexical analyzer typically discard whitespace and comments?",
    options: [
      "To save computer battery power",
      "Because they carry no grammatical or operational semantics for code execution",
      "Because DFAs cannot process space characters",
      "To compress the binary file size"
    ],
    correctIndex: 1,
    explanation: "Whitespace and comments serve readability for human programmers, but have no syntactic meaning in context-free grammar parsing (except as token delimiters)."
  },
  {
    id: 12,
    question: "What is Thompson's Construction used for in compiler design?",
    options: [
      "Converting an NFA into a DFA",
      "Converting a Regular Expression into an NFA with epsilon transitions",
      "Minimizing DFA states to their canonical minimum",
      "Generating machine assembly code"
    ],
    correctIndex: 1,
    explanation: "Thompson's Construction is a standard algorithmic technique for systematically transforming any Regular Expression into an equivalent Nondeterministic Finite Automaton (NFA)."
  },
  {
    id: 13,
    question: "Which algorithm is used to convert an NFA into an equivalent DFA?",
    options: [
      "Subset Construction (Powerset Construction)",
      "Hopcroft's Algorithm",
      "Dijkstra's Algorithm",
      "CYK Parsing Algorithm"
    ],
    correctIndex: 0,
    explanation: "The Subset Construction algorithm models each DFA state as a mathematical subset of NFA states reachable via character transitions and epsilon-closures."
  },
  {
    id: 14,
    question: "Given 'x = a+++b;', how does the scanner tokenize '+++' according to Maximal Munch?",
    options: [
      "+ followed by ++",
      "++ (increment) followed by + (addition)",
      "Three separate + tokens",
      "Lexical error: ambiguous sequence"
    ],
    correctIndex: 1,
    explanation: "Maximal Munch consumes the longest valid operator first, matching '++' first, leaving '+' as the next operator. Hence: (a++) + b."
  },
  {
    id: 15,
    question: "What is a 'Lookahead' character in lexical analysis?",
    options: [
      "A character stored for syntax error recovery",
      "Inspecting subsequent characters in the input stream without consuming them to disambiguate tokens",
      "A debugger breakpoint feature",
      "A variable declared at the top of a C file"
    ],
    correctIndex: 1,
    explanation: "Lookahead peeks ahead at the next input character(s) (e.g. checking whether '=' follows '<' to yield '<=') before finalizing token decisions."
  }
];
