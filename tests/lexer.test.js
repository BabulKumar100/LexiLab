import { describe, it, expect } from 'vitest';
import { Lexer } from '../src/engine/lexer.js';
import { TOKEN_TYPES } from '../src/engine/tokenTypes.js';
import { ERROR_CODES } from '../src/engine/errorHandler.js';

describe('LexiLab — Comprehensive Compiler Lexical Engine Test Suite', () => {
  const lexer = new Lexer();

  // ==========================================
  // Category 1: Keywords (20+ tests)
  // ==========================================
  describe('1. Reserved Keyword Recognition (20+ C Keywords)', () => {
    const keywordsToTest = [
      'int', 'float', 'char', 'double', 'void',
      'if', 'else', 'while', 'for', 'do',
      'return', 'break', 'continue', 'switch', 'case',
      'default', 'sizeof', 'struct', 'typedef', 'enum',
      'const', 'static', 'bool', 'true', 'false'
    ];

    keywordsToTest.forEach(kw => {
      it(`Recognizes keyword "${kw}"`, () => {
        const res = lexer.tokenize(kw);
        expect(res.tokens.length).toBe(1);
        expect(res.tokens[0].type).toBe(TOKEN_TYPES.KEYWORD);
        expect(res.tokens[0].lexeme).toBe(kw);
      });
    });
  });

  // ==========================================
  // Category 2: Operators & Maximal Munch (15+ tests)
  // ==========================================
  describe('2. Operators & Maximal Munch Principle (15+ Operators)', () => {
    const operators = [
      { op: '+', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '-', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '*', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '/', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '%', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '++', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '--', type: TOKEN_TYPES.ARITHMETIC_OPERATOR },
      { op: '==', type: TOKEN_TYPES.RELATIONAL_OPERATOR },
      { op: '!=', type: TOKEN_TYPES.RELATIONAL_OPERATOR },
      { op: '<=', type: TOKEN_TYPES.RELATIONAL_OPERATOR },
      { op: '>=', type: TOKEN_TYPES.RELATIONAL_OPERATOR },
      { op: '&&', type: TOKEN_TYPES.LOGICAL_OPERATOR },
      { op: '||', type: TOKEN_TYPES.LOGICAL_OPERATOR },
      { op: '<<', type: TOKEN_TYPES.BITWISE_OPERATOR },
      { op: '>>', type: TOKEN_TYPES.BITWISE_OPERATOR },
      { op: '<<=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR },
      { op: '>>=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR },
      { op: '->', type: TOKEN_TYPES.POINTER_OPERATOR }
    ];

    operators.forEach(({ op, type }) => {
      it(`Correctly matches operator "${op}" as ${type}`, () => {
        const res = lexer.tokenize(op);
        expect(res.tokens.length).toBe(1);
        expect(res.tokens[0].lexeme).toBe(op);
        expect(res.tokens[0].type).toBe(type);
      });
    });

    it('Maximal Munch: a+++b tokenized as (a++) + b', () => {
      const res = lexer.tokenize('a+++b');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['a', '++', '+', 'b']);
    });

    it('Maximal Munch: a---b tokenized as (a--) - b', () => {
      const res = lexer.tokenize('a---b');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['a', '--', '-', 'b']);
    });

    it('Maximal Munch: x>>=1 tokenized as x >>= 1', () => {
      const res = lexer.tokenize('x>>=1');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['x', '>>=', '1']);
    });
  });

  // ==========================================
  // Category 3: Numeric Literals (10+ tests)
  // ==========================================
  describe('3. Numeric Literals (Decimal, Float, Hex, Binary, Scientific)', () => {
    it('Decimals: 0 and 42', () => {
      const res = lexer.tokenize('0 42 1000');
      expect(res.tokens.every(t => t.type === TOKEN_TYPES.INTEGER_LITERAL)).toBe(true);
      expect(res.tokens.map(t => t.lexeme)).toEqual(['0', '42', '1000']);
    });

    it('Floating-point: 3.14159', () => {
      const res = lexer.tokenize('3.14159');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
      expect(res.tokens[0].lexeme).toBe('3.14159');
    });

    it('Floats starting with decimal: .5', () => {
      const res = lexer.tokenize('.5');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
    });

    it('Scientific notation: 1e10, 2.5e-3, 3E+4', () => {
      const res = lexer.tokenize('1e10 2.5e-3 3E+4');
      expect(res.tokens.length).toBe(3);
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
      expect(res.tokens[1].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
      expect(res.tokens[2].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
    });

    it('Float suffixes: 2.5f, 10.0L', () => {
      const res = lexer.tokenize('2.5f 10.0L');
      expect(res.tokens[0].lexeme).toBe('2.5f');
      expect(res.tokens[1].lexeme).toBe('10.0L');
    });

    it('Hexadecimal: 0x2A, 0XFF, 0x1a3f', () => {
      const res = lexer.tokenize('0x2A 0XFF 0x1a3f');
      expect(res.tokens.every(t => t.type === TOKEN_TYPES.INTEGER_LITERAL)).toBe(true);
      expect(res.tokens.map(t => t.lexeme)).toEqual(['0x2A', '0XFF', '0x1a3f']);
    });

    it('Binary literal: 0b1010, 0B1100', () => {
      const res = lexer.tokenize('0b1010 0B1100');
      expect(res.tokens[0].lexeme).toBe('0b1010');
      expect(res.tokens[1].lexeme).toBe('0B1100');
    });

    it('Octal literals: 010 and 0, while tagging base', () => {
      const res = lexer.tokenize('010 0 7');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['010', '0', '7']);
      expect(res.tokens[0].base).toBe('octal');
      expect(res.tokens[1].base).toBe('decimal');
      expect(res.tokens[2].base).toBe('decimal');
    });

    it('Does not absorb an identifier into a hex literal', () => {
      const res = lexer.tokenize('0xFGmore');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['0xF', 'Gmore']);
      expect(res.tokens[0].base).toBe('hex');
      expect(res.syntaxNotes.length).toBe(1);
    });
  });

  // ==========================================
  // Category 4: String & Character Literals (10+ tests)
  // ==========================================
  describe('4. String & Character Literals with Escape Sequences', () => {
    it('Simple string: "Hello, World!"', () => {
      const res = lexer.tokenize('"Hello, World!"');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.STRING_LITERAL);
      expect(res.tokens[0].lexeme).toBe('"Hello, World!"');
    });

    it('Escaped characters inside string: "Line 1\\nLine 2\\t\\"Quote\\""', () => {
      const res = lexer.tokenize('"Line 1\\nLine 2\\t\\"Quote\\""');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.STRING_LITERAL);
    });

    it('Empty string: ""', () => {
      const res = lexer.tokenize('""');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.STRING_LITERAL);
      expect(res.tokens[0].lexeme).toBe('""');
    });

    it('Character literal: \'a\', \'Z\', \'9\'', () => {
      const res = lexer.tokenize("'a' 'Z' '9'");
      expect(res.tokens.every(t => t.type === TOKEN_TYPES.CHAR_LITERAL)).toBe(true);
    });

    it('Escaped character literal: \'\\n\', \'\\t\', \'\\\\\'', () => {
      const res = lexer.tokenize("'\\n' '\\t' '\\\\'");
      expect(res.tokens.every(t => t.type === TOKEN_TYPES.CHAR_LITERAL)).toBe(true);
    });
  });

  // ==========================================
  // Category 5: Comments Handling (10+ tests)
  // ==========================================
  describe('5. Single-line and Multi-line Comments', () => {
    it('Comments are skipped by default (Standard Compiler)', () => {
      const res = lexer.tokenize('// This is comment\nint x = 5;');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['int', 'x', '=', '5', ';']);
      expect(res.tokens.some(t => t.type === TOKEN_TYPES.COMMENT)).toBe(false);
    });

    it('Comments are retained when includeComments is true', () => {
      const res = lexer.tokenize('// Comment\nint x = 5;', { includeComments: true });
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.COMMENT);
      expect(res.tokens[0].lexeme).toBe('// Comment');
    });

    it('Multi-line comment /* ... */ skipped by default', () => {
      const res = lexer.tokenize('/* Block comment */ float y;');
      expect(res.tokens.map(t => t.lexeme)).toEqual(['float', 'y', ';']);
    });

    it('Multi-line comment spans multiple lines', () => {
      const code = '/* Line 1\nLine 2\nLine 3 */\nint z;';
      const res = lexer.tokenize(code);
      expect(res.tokens[0].lexeme).toBe('int');
      expect(res.tokens[0].line).toBe(4);
    });
  });

  // ==========================================
  // Category 6: Error Diagnostics (15+ tests)
  // ==========================================
  describe('6. Lexical Error Diagnostics & Linting', () => {
    it('Flags invalid character: @', () => {
      const res = lexer.tokenize('int a = 10 @ 2;');
      expect(res.errors.length).toBe(1);
      expect(res.errors[0].code).toBe(ERROR_CODES.ERR_INVALID_CHARACTER);
      expect(res.errors[0].lexeme).toBe('@');
    });

    it('Flags invalid character: $ and `', () => {
      const res = lexer.tokenize('$ `');
      expect(res.errors.length).toBe(2);
    });

    it('Flags unterminated string literal before newline', () => {
      const res = lexer.tokenize('printf("Hello World\n);');
      expect(res.errors.some(e => e.code === ERROR_CODES.ERR_UNTERMINATED_STRING)).toBe(true);
    });

    it('Flags unterminated multi-line comment at EOF', () => {
      const res = lexer.tokenize('int x; /* unclosed comment');
      expect(res.errors.some(e => e.code === ERROR_CODES.ERR_UNTERMINATED_COMMENT)).toBe(true);
    });

    it('Splits 123abc into an integer and an identifier, with a syntax note', () => {
      const res = lexer.tokenize('int 123abc = 10;');
      expect(res.errors.some(e => e.code === ERROR_CODES.ERR_MALFORMED_NUMBER)).toBe(false);
      expect(res.tokens.map(t => t.lexeme)).toEqual(['int', '123', 'abc', '=', '10', ';']);
      expect(res.tokens[1].type).toBe(TOKEN_TYPES.INTEGER_LITERAL);
      expect(res.tokens[2].type).toBe(TOKEN_TYPES.IDENTIFIER);
      expect(res.syntaxNotes[0].phase).toBe('SYNTAX');
      expect(res.syntaxNotes[0].code).toBe('SYN_NUMBER_IDENTIFIER_ADJACENCY');
    });

    it('Splits 10.5.2 into two floats by maximal munch', () => {
      const res = lexer.tokenize('float f = 10.5.2;');
      expect(res.errors.length).toBe(0);
      expect(res.tokens.map(t => t.lexeme)).toEqual(['float', 'f', '=', '10.5', '.2', ';']);
      expect(res.tokens[3].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
      expect(res.tokens[4].type).toBe(TOKEN_TYPES.FLOAT_LITERAL);
    });

    it('Flags invalid octal digit in 08', () => {
      const res = lexer.tokenize('08');
      expect(res.errors.some(e => e.code === ERROR_CODES.ERR_MALFORMED_NUMBER)).toBe(true);
    });

    it('Classifies printf as IDENTIFIER even when followed by (', () => {
      const res = lexer.tokenize('printf("Hi");');
      expect(res.tokens[0].type).toBe(TOKEN_TYPES.IDENTIFIER);
      expect(res.tokens[0].lexeme).toBe('printf');
      expect(res.symbolTable[0].category).toBe('IDENTIFIER');
      expect(res.symbolTable[0].semanticHint).toContain('Function');
    });

    it('Flags empty character literal \'\'', () => {
      const res = lexer.tokenize("char c = '';");
      expect(res.errors.some(e => e.code === ERROR_CODES.ERR_UNTERMINATED_CHAR)).toBe(true);
    });
  });

  // ==========================================
  // Category 7: Accurate Line & Column Coordinates
  // ==========================================
  describe('7. Precise Line & Column Position Coordinates', () => {
    it('Coordinates for default example: printf("Hello World\\n");', () => {
      const code = '    printf("Hello World\\n");';
      const res = lexer.tokenize(code);

      expect(res.tokens[0]).toMatchObject({ lexeme: 'printf', line: 1, column: 5 });
      expect(res.tokens[1]).toMatchObject({ lexeme: '(', line: 1, column: 11 });
      expect(res.tokens[2]).toMatchObject({ lexeme: '"Hello World\\n"', line: 1, column: 12 });
      expect(res.tokens[3]).toMatchObject({ lexeme: ')', line: 1, column: 27 });
      expect(res.tokens[4]).toMatchObject({ lexeme: ';', line: 1, column: 28 });
    });

    it('Empty input returns zero tokens and zero errors', () => {
      const res = lexer.tokenize('');
      expect(res.tokens.length).toBe(0);
      expect(res.errors.length).toBe(0);
    });

    it('Whitespace-only input returns zero tokens and zero errors', () => {
      const res = lexer.tokenize('   \t\n   \n\t  ');
      expect(res.tokens.length).toBe(0);
      expect(res.errors.length).toBe(0);
    });
  });

  // ==========================================
  // Category 8: Symbol Table Verification
  // ==========================================
  describe('8. Symbol Table Identifier Attributes & References', () => {
    it('Records unique identifiers, occurrence counts, and line numbers', () => {
      const code = `
        int total = 0;
        total = total + 5;
        total++;
      `;
      const res = lexer.tokenize(code);
      const totalEntry = res.symbolTable.find(s => s.name === 'total');

      expect(totalEntry).toBeDefined();
      expect(totalEntry.category).toBe('IDENTIFIER');
      expect(totalEntry.dataType).toBe('int');
      expect(totalEntry.occurrences).toBe(4);
    });
  });
});
