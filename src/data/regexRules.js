// LexiLab - Regular Expression Rules & Patterns Explorer

export const REGEX_PATTERNS = [
  {
    id: 'identifier',
    tokenType: 'IDENTIFIER',
    name: 'Identifier Pattern',
    regexString: '^[a-zA-Z_][a-zA-Z0-9_]*$',
    regex: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    description: 'Begins with an alphabetical letter or underscore, followed by zero or more letters, digits, or underscores.',
    formalGrammar: 'letter -> [a-zA-Z] | _\ndigit -> [0-9]\nidentifier -> letter (letter | digit)*',
    exampleMatch: 'total_sum_2026',
    exampleFail: '2026total',
    dfaStatesCount: 2
  },
  {
    id: 'integer',
    tokenType: 'INTEGER_LITERAL',
    name: 'Decimal Integer Literal',
    regexString: '^(0|[1-9][0-9]*)$',
    regex: /^(0|[1-9][0-9]*)$/,
    description: 'Either a zero or a non-zero digit followed by arbitrary digits. Disallows redundant leading zeros in standard decimal.',
    formalGrammar: 'nonzero -> [1-9]\ndigit -> [0-9]\ninteger -> 0 | nonzero digit*',
    exampleMatch: '42091',
    exampleFail: '0123 (Octal in C)',
    dfaStatesCount: 3
  },
  {
    id: 'hex_integer',
    tokenType: 'INTEGER_LITERAL (Hex)',
    name: 'Hexadecimal Integer',
    regexString: '^0[xX][0-9a-fA-F]+$',
    regex: /^0[xX][0-9a-fA-F]+$/,
    description: 'Prefix 0x or 0X followed by one or more hexadecimal digits (0-9, a-f, A-F).',
    formalGrammar: 'hexPrefix -> 0 (x | X)\nhexdigit -> [0-9a-fA-F]\nhexNum -> hexPrefix hexdigit+',
    exampleMatch: '0x3F4A',
    exampleFail: '0xG12',
    dfaStatesCount: 3
  },
  {
    id: 'float_literal',
    tokenType: 'FLOAT_LITERAL',
    name: 'Floating Point Number',
    regexString: '^[0-9]+\\.[0-9]+([eE][+-]?[0-9]+)?[fFlL]?$',
    regex: /^[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?[fFlL]?$/,
    description: 'Digits with a required decimal point, fractional digits, optional exponent notation (e/E), and optional float suffix.',
    formalGrammar: 'digit -> [0-9]\nexp -> (e | E) (+ | -)? digit+\nfloat -> digit+ . digit+ exp? (f | F | l | L)?',
    exampleMatch: '3.14159e-2',
    exampleFail: '3.14.15',
    dfaStatesCount: 5
  },
  {
    id: 'string_literal',
    tokenType: 'STRING_LITERAL',
    name: 'String Literal',
    regexString: '^"([^"\\\\\\n]|\\\\.)*"$',
    regex: /^"([^"\\\n]|\\.)*"$/,
    description: 'Enclosed by double quotes. Allows character escape sequences (e.g. \\n, \\", \\\\) but forbids unescaped raw newlines.',
    formalGrammar: 'escChar -> \\ ( [^\\n] )\nstrChar -> [^"\\\\\\n] | escChar\nstring -> " strChar* "',
    exampleMatch: '"LexiLab Compiler 2.0\\n"',
    exampleFail: '"Unclosed string',
    dfaStatesCount: 3
  },
  {
    id: 'char_literal',
    tokenType: 'CHAR_LITERAL',
    name: 'Character Literal',
    regexString: "^'([^'\\\\\\n]|\\\\.)'$",
    regex: /^'([^'\\\n]|\\.)'$/,
    description: 'Enclosed in single quotes with exactly one character or a single escaped character sequence.',
    formalGrammar: 'charVal -> [^\'\\\\\\n] | ( \\ [^\\n] )\ncharLit -> \' charVal \'',
    exampleMatch: "'\\n'",
    exampleFail: "'' (empty) or 'abc'",
    dfaStatesCount: 4
  },
  {
    id: 'comment',
    tokenType: 'COMMENT',
    name: 'Single & Multi-line Comment',
    regexString: '^(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)$',
    regex: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)$/,
    description: 'Either line comments starting with // until newline or block comments between /* and */.',
    formalGrammar: 'lineComment -> // [^\\n]*\nblockComment -> /* ( [^*] | *+ [^/*] )* *+ /\ncomment -> lineComment | blockComment',
    exampleMatch: '/* Block comment */',
    exampleFail: '/* unclosed comment',
    dfaStatesCount: 5
  },
  {
    id: 'operators',
    tokenType: 'OPERATOR',
    name: 'Relational & Equality Operator',
    regexString: '^(==|!=|<=|>=|<|>)$',
    regex: /^(==|!=|<=|>=|<|>)$/,
    description: 'Comparison operators matched via longest match / maximal munch principle.',
    formalGrammar: 'relOp -> < | > | <= | >= | == | !=',
    exampleMatch: '<=',
    exampleFail: '<==',
    dfaStatesCount: 4
  }
];
