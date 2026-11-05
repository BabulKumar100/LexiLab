// LexiLab - Core Lexical Analyzer (Lexer) Engine

import { TOKEN_TYPES } from './tokenTypes.js';
import { isKeyword } from './keywords.js';
import { SORTED_OPERATORS, SEPARATORS } from './operators.js';
import { SymbolTable } from './symbolTable.js';
import { LexicalError, ERROR_CODES, createErrorSnippet } from './errorHandler.js';
import { consumeNumber } from './numberScanner.js';

export class Lexer {
  constructor(source = '') {
    this.source = source;
    this.tokens = [];
    this.errors = [];
    this.syntaxNotes = [];
    this.symbolTable = new SymbolTable();
    this.index = 0;
    this.line = 1;
    this.column = 1;
    this.tokenCounter = 1;
  }

  isAtEnd() {
    return this.index >= this.source.length;
  }

  peek(offset = 0) {
    const pos = this.index + offset;
    return pos < this.source.length ? this.source[pos] : '';
  }

  advance() {
    if (this.isAtEnd()) return '';
    const ch = this.source[this.index];
    this.index++;
    if (ch === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }

  addToken(type, lexeme, startLine, startColumn, metadata = {}) {
    const token = {
      id: this.tokenCounter++,
      type,
      lexeme,
      line: startLine,
      column: startColumn,
      endLine: this.line,
      endColumn: this.column,
      startIndex: this.index - lexeme.length,
      endIndex: this.index,
      ...metadata
    };
    this.tokens.push(token);
    return token;
  }

  addError(code, message, lexeme, startLine, startColumn, suggestion) {
    const snippet = createErrorSnippet(this.source, startLine, startColumn, lexeme.length);
    const err = new LexicalError({
      code,
      message,
      line: startLine,
      column: startColumn,
      lexeme,
      suggestion,
      snippet,
      phase: 'LEXICAL'
    });
    this.errors.push(err);
    this.tokens.push({
      id: this.tokenCounter++,
      type: TOKEN_TYPES.ERROR,
      lexeme,
      line: startLine,
      column: startColumn,
      isError: true,
      errorDetails: err
    });
  }

  isWhitespace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n';
  }

  isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  isHexDigit(ch) {
    return this.isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F');
  }

  isAlphaNumeric(ch) {
    return this.isAlpha(ch) || this.isDigit(ch);
  }

  /**
   * Tokenize source code.
   * By default, comments are skipped like standard compiler front-ends.
   * If includeComments is true, comments are retained as COMMENT tokens for visual inspection.
   */
  tokenize(sourceCode = this.source, options = {}) {
    const { includeComments = false } = options;
    const startTime = performance.now();
    this.source = sourceCode;
    this.tokens = [];
    this.errors = [];
    this.syntaxNotes = [];
    this.symbolTable.clear();
    this.index = 0;
    this.line = 1;
    this.column = 1;
    this.tokenCounter = 1;

    let lastDataType = null;

    while (!this.isAtEnd()) {
      const startLine = this.line;
      const startCol = this.column;
      const ch = this.peek();

      // 1. Whitespace
      if (this.isWhitespace(ch)) {
        this.advance();
        continue;
      }

      // 2. Comments or Division Operator
      if (ch === '/') {
        if (this.peek(1) === '/') {
          // Single-line comment
          let commentText = '';
          while (!this.isAtEnd() && this.peek() !== '\n') {
            commentText += this.advance();
          }
          if (includeComments) {
            this.addToken(TOKEN_TYPES.COMMENT, commentText, startLine, startCol);
          }
          continue;
        } else if (this.peek(1) === '*') {
          // Multi-line comment
          let commentText = this.advance() + this.advance(); // consume '/*'
          let closed = false;
          while (!this.isAtEnd()) {
            if (this.peek() === '*' && this.peek(1) === '/') {
              commentText += this.advance(); // '*'
              commentText += this.advance(); // '/'
              closed = true;
              break;
            }
            commentText += this.advance();
          }
          if (!closed) {
            this.addError(
              ERROR_CODES.ERR_UNTERMINATED_COMMENT,
              'Unterminated multi-line block comment',
              commentText.length > 20 ? commentText.slice(0, 17) + '...' : commentText,
              startLine,
              startCol,
              'Ensure block comments are closed with "*/" before end-of-file.'
            );
          } else if (includeComments) {
            this.addToken(TOKEN_TYPES.COMMENT, commentText, startLine, startCol);
          }
          continue;
        }
      }

      // 3. Preprocessor Directives (#include, #define, etc.)
      if (ch === '#') {
        let directive = '';
        while (!this.isAtEnd() && this.peek() !== '\n') {
          directive += this.advance();
        }
        this.addToken(TOKEN_TYPES.PREPROCESSOR, directive, startLine, startCol);
        continue;
      }

      // 4. String Literals ("...")
      if (ch === '"') {
        let strVal = this.advance(); // consume opening quote
        let closed = false;

        while (!this.isAtEnd()) {
          const c = this.peek();
          if (c === '\n') {
            break; // raw newline inside string without escaping is illegal in C
          }
          if (c === '\\') {
            strVal += this.advance(); // consume '\'
            if (!this.isAtEnd()) {
              strVal += this.advance(); // consume escaped char
            }
            continue;
          }
          if (c === '"') {
            strVal += this.advance(); // consume closing quote
            closed = true;
            break;
          }
          strVal += this.advance();
        }

        if (!closed) {
          this.addError(
            ERROR_CODES.ERR_UNTERMINATED_STRING,
            'Unterminated string literal',
            strVal,
            startLine,
            startCol,
            'Close the string with a matching double-quote (") before end-of-line.'
          );
        } else {
          this.addToken(TOKEN_TYPES.STRING_LITERAL, strVal, startLine, startCol);
        }
        continue;
      }

      // 5. Character Literals ('...')
      if (ch === "'") {
        let charVal = this.advance(); // consume opening quote
        let closed = false;

        while (!this.isAtEnd()) {
          const c = this.peek();
          if (c === '\n') break;
          if (c === '\\') {
            charVal += this.advance();
            if (!this.isAtEnd()) charVal += this.advance();
            continue;
          }
          if (c === "'") {
            charVal += this.advance();
            closed = true;
            break;
          }
          charVal += this.advance();
        }

        if (!closed) {
          this.addError(
            ERROR_CODES.ERR_UNTERMINATED_CHAR,
            'Unterminated character literal',
            charVal,
            startLine,
            startCol,
            "Close the character literal with a single-quote (') before end-of-line."
          );
        } else if (charVal === "''") {
          this.addError(
            ERROR_CODES.ERR_UNTERMINATED_CHAR,
            'Empty character literal is invalid in C',
            charVal,
            startLine,
            startCol,
            "A character literal must contain at least one character, e.g. 'a'."
          );
        } else {
          this.addToken(TOKEN_TYPES.CHAR_LITERAL, charVal, startLine, startCol);
        }
        continue;
      }

      // 6. Numeric literals.
      // Maximal munch stops at the end of a valid number. A following identifier
      // is a separate token. That adjacency is a syntax-phase note, not INVALID_IDENTIFIER.
      if (this.isDigit(ch) || (ch === '.' && this.isDigit(this.peek(1)))) {
        const numeric = consumeNumber({
          peek: (offset = 0) => this.peek(offset),
          advance: () => this.advance()
        });

        if (numeric.error) {
          this.addError(
            numeric.error.code,
            numeric.error.message,
            numeric.lexeme,
            startLine,
            startCol,
            numeric.error.suggestion
          );
        } else {
          this.addToken(
            numeric.isFloat ? TOKEN_TYPES.FLOAT_LITERAL : TOKEN_TYPES.INTEGER_LITERAL,
            numeric.lexeme,
            startLine,
            startCol,
            { base: numeric.base, phase: 'LEXICAL' }
          );
          if (numeric.adjacentIdentifier) {
            // Coordinates point at the numeric token's own start so the note lines up with
            // the lexeme its message quotes; the neighbour's position is spelled out too.
            this.syntaxNotes.push({
              phase: 'SYNTAX',
              code: 'SYN_NUMBER_IDENTIFIER_ADJACENCY',
              message: `Split into two tokens: numeric literal "${numeric.lexeme}" at line ${startLine}, column ${startCol} and the identifier that follows at line ${this.line}, column ${this.column}. C lexical rules do not merge them into one INVALID_IDENTIFIER.`,
              line: startLine,
              column: startCol,
              lexeme: numeric.lexeme,
              suggestion: 'A declaration such as int 123invalid is illegal in the parser because a name cannot start with a digit. The scanner itself still emits a number and then an identifier.'
            });
          }
        }
        continue;
      }

      // 7. Identifiers and Keywords
      if (this.isAlpha(ch)) {
        let ident = '';
        while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
          ident += this.advance();
        }

        if (isKeyword(ident)) {
          this.addToken(TOKEN_TYPES.KEYWORD, ident, startLine, startCol);
          if (['int', 'float', 'char', 'double', 'void', 'short', 'long', 'bool', 'struct'].includes(ident)) {
            lastDataType = ident;
          }
        } else {
          // Pure Lexical Analysis Classification: STRICTLY an IDENTIFIER
          this.addToken(TOKEN_TYPES.IDENTIFIER, ident, startLine, startCol);

          // Educational Extended Symbol Table preview:
          // Lookahead for '(' is noted as a semantic hint, while keeping formal token classification as IDENTIFIER
          let tempIdx = this.index;
          while (tempIdx < this.source.length && (this.source[tempIdx] === ' ' || this.source[tempIdx] === '\t')) {
            tempIdx++;
          }
          const isFollowedByParen = tempIdx < this.source.length && this.source[tempIdx] === '(';

          this.symbolTable.insert({
            name: ident,
            line: startLine,
            column: startCol,
            inferredType: lastDataType || 'auto',
            category: 'IDENTIFIER',
            semanticHint: isFollowedByParen ? 'Function Call (Lookahead "(")' : 'Variable'
          });
          lastDataType = null;
        }
        continue;
      }

      // 8. Operators (Maximal Munch matching)
      let matchedOp = null;
      for (const opSpec of SORTED_OPERATORS) {
        let match = true;
        for (let i = 0; i < opSpec.op.length; i++) {
          if (this.peek(i) !== opSpec.op[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          matchedOp = opSpec;
          break;
        }
      }

      if (matchedOp) {
        for (let i = 0; i < matchedOp.op.length; i++) {
          this.advance();
        }
        this.addToken(matchedOp.type, matchedOp.op, startLine, startCol, {
          opName: matchedOp.name
        });
        continue;
      }

      // 9. Separators / Punctuation
      if (SEPARATORS[ch]) {
        const sepChar = this.advance();
        this.addToken(TOKEN_TYPES.SEPARATOR, sepChar, startLine, startCol, {
          sepName: SEPARATORS[sepChar]
        });
        continue;
      }

      // 10. Lexical Error: Invalid character (e.g. '@', '$', '\', etc.)
      const invalidChar = this.advance();
      this.addError(
        ERROR_CODES.ERR_INVALID_CHARACTER,
        `Illegal or unrecognized character: '${invalidChar}' (ASCII ${invalidChar.charCodeAt(0)})`,
        invalidChar,
        startLine,
        startCol,
        `Remove '${invalidChar}' or replace it with a valid C operator or separator.`
      );
    }

    const duration = performance.now() - startTime;

    return {
      tokens: this.tokens,
      errors: this.errors,
      syntaxNotes: this.syntaxNotes,
      symbolTable: this.symbolTable.getAllEntries(),
      stats: {
        totalTokens: this.tokens.length,
        totalErrors: this.errors.length,
        totalKeywords: this.tokens.filter(t => t.type === TOKEN_TYPES.KEYWORD).length,
        totalIdentifiers: this.tokens.filter(t => t.type === TOKEN_TYPES.IDENTIFIER).length,
        totalLiterals: this.tokens.filter(t => [TOKEN_TYPES.INTEGER_LITERAL, TOKEN_TYPES.FLOAT_LITERAL, TOKEN_TYPES.STRING_LITERAL, TOKEN_TYPES.CHAR_LITERAL].includes(t.type)).length,
        totalOperators: this.tokens.filter(t => t.type && t.type.includes('OPERATOR')).length,
        totalSeparators: this.tokens.filter(t => t.type === TOKEN_TYPES.SEPARATOR).length,
        totalComments: this.tokens.filter(t => t.type === TOKEN_TYPES.COMMENT).length,
        totalLines: this.source.split('\n').length,
        totalChars: this.source.length,
        scanDurationMs: Number(duration.toFixed(2))
      }
    };
  }
}
