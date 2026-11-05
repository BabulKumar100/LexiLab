// LexiLab - Token Types & Definitions

export const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  INTEGER_LITERAL: 'INTEGER_LITERAL',
  FLOAT_LITERAL: 'FLOAT_LITERAL',
  STRING_LITERAL: 'STRING_LITERAL',
  CHAR_LITERAL: 'CHAR_LITERAL',
  ARITHMETIC_OPERATOR: 'ARITHMETIC_OPERATOR',
  RELATIONAL_OPERATOR: 'RELATIONAL_OPERATOR',
  LOGICAL_OPERATOR: 'LOGICAL_OPERATOR',
  BITWISE_OPERATOR: 'BITWISE_OPERATOR',
  ASSIGNMENT_OPERATOR: 'ASSIGNMENT_OPERATOR',
  TERNARY_OPERATOR: 'TERNARY_OPERATOR',
  POINTER_OPERATOR: 'POINTER_OPERATOR',
  SEPARATOR: 'SEPARATOR',
  PREPROCESSOR: 'PREPROCESSOR',
  COMMENT: 'COMMENT',
  ERROR: 'ERROR'
};

export const TOKEN_METADATA = {
  [TOKEN_TYPES.KEYWORD]: {
    label: 'Keyword',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    badgeClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/50',
    description: 'Reserved word with special predefined syntactic meaning in the language grammar.',
    example: 'int, if, while, return, sizeof'
  },
  [TOKEN_TYPES.IDENTIFIER]: {
    label: 'Identifier',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    badgeClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-700/50',
    description: 'User-defined name assigned to variables, functions, structs, or arrays.',
    example: 'count, sum, my_var, calculateTotal'
  },
  [TOKEN_TYPES.INTEGER_LITERAL]: {
    label: 'Integer Literal',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    description: 'Fixed whole numeric value (decimal, hexadecimal, octal, or binary).',
    example: '42, 0, 0xFF, 0b1010'
  },
  [TOKEN_TYPES.FLOAT_LITERAL]: {
    label: 'Float Literal',
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    badgeClass: 'bg-orange-950/70 text-orange-300 border-orange-700/50',
    description: 'Real numeric value containing a fractional point and optional scientific exponent.',
    example: '3.1415, 0.05, 1e-4, 2.5f'
  },
  [TOKEN_TYPES.STRING_LITERAL]: {
    label: 'String Literal',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    description: 'Sequence of characters enclosed within double quotation marks.',
    example: '"Hello, Compiler!", "Score: %d\\n"'
  },
  [TOKEN_TYPES.CHAR_LITERAL]: {
    label: 'Character Literal',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    badgeClass: 'bg-teal-950/70 text-teal-300 border-teal-700/50',
    description: 'Single character enclosed in single quotation marks, or an escape sequence.',
    example: "'a', '\\n', '\\0', 'X'"
  },
  [TOKEN_TYPES.ARITHMETIC_OPERATOR]: {
    label: 'Arithmetic Op',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
    description: 'Mathematical operations for numbers.',
    example: '+, -, *, /, %, ++, --'
  },
  [TOKEN_TYPES.RELATIONAL_OPERATOR]: {
    label: 'Relational Op',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    badgeClass: 'bg-sky-950/70 text-sky-300 border-sky-700/50',
    description: 'Comparison operators returning boolean relationship evaluations.',
    example: '<, >, <=, >=, ==, !='
  },
  [TOKEN_TYPES.LOGICAL_OPERATOR]: {
    label: 'Logical Op',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    badgeClass: 'bg-violet-950/70 text-violet-300 border-violet-700/50',
    description: 'Boolean propositional logic operators.',
    example: '&&, ||, !'
  },
  [TOKEN_TYPES.BITWISE_OPERATOR]: {
    label: 'Bitwise Op',
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
    badgeClass: 'bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-700/50',
    description: 'Bit-level manipulation operators.',
    example: '&, |, ^, ~, <<, >>'
  },
  [TOKEN_TYPES.ASSIGNMENT_OPERATOR]: {
    label: 'Assignment Op',
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    badgeClass: 'bg-pink-950/70 text-pink-300 border-pink-700/50',
    description: 'Store or update value into a variable (simple or compound).',
    example: '=, +=, -=, *=, /=, %=, &=, |=, ^='
  },
  [TOKEN_TYPES.TERNARY_OPERATOR]: {
    label: 'Ternary Op',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    badgeClass: 'bg-purple-950/70 text-purple-300 border-purple-700/50',
    description: 'Conditional expression operator ? :',
    example: '?, :'
  },
  [TOKEN_TYPES.POINTER_OPERATOR]: {
    label: 'Member/Pointer Op',
    color: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
    badgeClass: 'bg-blue-900/60 text-blue-200 border-blue-600/50',
    description: 'Structure member access or pointer indirection.',
    example: '->, .'
  },
  [TOKEN_TYPES.SEPARATOR]: {
    label: 'Separator',
    color: 'text-slate-300 bg-slate-700/20 border-slate-600/30',
    badgeClass: 'bg-slate-800/80 text-slate-300 border-slate-600/50',
    description: 'Punctuation mark, delimiter, parentheses, brackets, or braces.',
    example: ';, ,, (, ), {, }, [, ]'
  },
  [TOKEN_TYPES.PREPROCESSOR]: {
    label: 'Preprocessor',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-700/50',
    description: 'Preprocessor directive starting with # symbol.',
    example: '#include, #define, #ifdef, #ifndef, #endif'
  },
  [TOKEN_TYPES.COMMENT]: {
    label: 'Comment',
    color: 'text-slate-500 bg-slate-800/30 border-slate-700/30',
    badgeClass: 'bg-slate-900 text-slate-400 border-slate-700',
    description: 'Single-line or multi-line comment ignored during code synthesis.',
    example: '// single line or /* block */'
  },
  [TOKEN_TYPES.ERROR]: {
    label: 'Lexical Error',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
    badgeClass: 'bg-red-950/80 text-red-300 border-red-600/60',
    description: 'Ill-formed character sequence or invalid token violating lexical grammar.',
    example: '@, unterminated string, malformed number'
  }
};
