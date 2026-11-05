// LexiLab - Step-by-Step Interactive Scanner Trace Generator

import { TOKEN_TYPES } from './tokenTypes.js';
import { isKeyword } from './keywords.js';
import { SORTED_OPERATORS, SEPARATORS } from './operators.js';
import { consumeNumber } from './numberScanner.js';

export function generateScannerTrace(sourceCode) {
  const steps = [];
  let index = 0;
  let line = 1;
  let column = 1;
  let tokenCounter = 1;
  const emittedTokens = [];

  function addStep({ action, char = '', lookahead1 = '', lookahead2 = '', buffer = '', dfaState = 'START', token = null }) {
    steps.push({
      stepNumber: steps.length + 1,
      index,
      line,
      column,
      char: char === ' ' ? '␣ (Space)' : char === '\n' ? '\\n (Newline)' : char === '\t' ? '\\t (Tab)' : char,
      lookahead1: lookahead1 === ' ' ? '␣' : lookahead1 === '\n' ? '\\n' : lookahead1,
      lookahead2: lookahead2 === ' ' ? '␣' : lookahead2 === '\n' ? '\\n' : lookahead2,
      buffer,
      dfaState,
      action,
      emittedToken: token ? { ...token } : null,
      tokensSnapshot: [...emittedTokens]
    });
  }

  function peek(offset = 0) {
    const pos = index + offset;
    return pos < sourceCode.length ? sourceCode[pos] : '';
  }

  function advance() {
    if (index >= sourceCode.length) return '';
    const ch = sourceCode[index];
    index++;
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  }

  addStep({
    action: 'Scanner initialized at beginning of source code.',
    dfaState: 'START',
    char: peek(0),
    lookahead1: peek(1),
    lookahead2: peek(2)
  });

  while (index < sourceCode.length) {
    const ch = peek();
    const startLine = line;
    const startCol = column;

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      addStep({
        action: `Encountered whitespace character; advancing scanner without creating token.`,
        char: ch,
        lookahead1: peek(1),
        lookahead2: peek(2),
        dfaState: 'SKIP_WHITESPACE'
      });
      advance();
      continue;
    }

    // Comment or Division
    if (ch === '/' && peek(1) === '/') {
      let buffer = '';
      addStep({
        action: 'Encountered "//" -> Entering single-line comment state.',
        char: ch,
        lookahead1: peek(1),
        lookahead2: peek(2),
        dfaState: 'COMMENT_LINE',
        buffer
      });
      while (index < sourceCode.length && peek() !== '\n') {
        buffer += advance();
      }
      const tok = { id: tokenCounter++, type: TOKEN_TYPES.COMMENT, lexeme: buffer, line: startLine, column: startCol };
      emittedTokens.push(tok);
      addStep({
        action: `Comment reached newline/end. Discarded in syntax phase (tracked in scanner).`,
        dfaState: 'COMMENT_ACCEPT',
        buffer,
        token: tok
      });
      continue;
    }

    if (ch === '/' && peek(1) === '*') {
      let buffer = advance() + advance();
      addStep({
        action: 'Encountered "/*" -> Entering multi-line comment state.',
        char: '/*',
        lookahead1: peek(0),
        lookahead2: peek(1),
        dfaState: 'COMMENT_BLOCK',
        buffer
      });
      let closed = false;
      while (index < sourceCode.length) {
        if (peek() === '*' && peek(1) === '/') {
          buffer += advance() + advance();
          closed = true;
          break;
        }
        buffer += advance();
      }
      const tokType = closed ? TOKEN_TYPES.COMMENT : TOKEN_TYPES.ERROR;
      const tok = { id: tokenCounter++, type: tokType, lexeme: buffer, line: startLine, column: startCol };
      emittedTokens.push(tok);
      addStep({
        action: closed ? 'Comment closed with "*/".' : 'Lexical error: unterminated block comment.',
        dfaState: closed ? 'COMMENT_ACCEPT' : 'ERROR_STATE',
        buffer,
        token: tok
      });
      continue;
    }

    // Preprocessor
    if (ch === '#') {
      let buffer = '';
      while (index < sourceCode.length && peek() !== '\n') {
        buffer += advance();
      }
      const tok = { id: tokenCounter++, type: TOKEN_TYPES.PREPROCESSOR, lexeme: buffer, line: startLine, column: startCol };
      emittedTokens.push(tok);
      addStep({
        action: `Scanned preprocessor directive "${buffer}".`,
        dfaState: 'PREPROCESSOR_ACCEPT',
        buffer,
        token: tok
      });
      continue;
    }

    // String literal
    if (ch === '"') {
      let buffer = advance();
      let closed = false;
      addStep({
        action: 'Encountered \'"\' -> Transitioning to STRING_LITERAL DFA state.',
        char: '"',
        lookahead1: peek(0),
        lookahead2: peek(1),
        dfaState: 'IN_STRING',
        buffer
      });

      while (index < sourceCode.length) {
        const c = peek();
        if (c === '\n') break;
        if (c === '\\') {
          buffer += advance();
          if (index < sourceCode.length) buffer += advance();
          continue;
        }
        if (c === '"') {
          buffer += advance();
          closed = true;
          break;
        }
        buffer += advance();
      }

      const tok = {
        id: tokenCounter++,
        type: closed ? TOKEN_TYPES.STRING_LITERAL : TOKEN_TYPES.ERROR,
        lexeme: buffer,
        line: startLine,
        column: startCol
      };
      emittedTokens.push(tok);
      addStep({
        action: closed ? `Matched complete string literal "${buffer}".` : 'Unterminated string literal error.',
        dfaState: closed ? 'STRING_ACCEPT' : 'ERROR_STATE',
        buffer,
        token: tok
      });
      continue;
    }

    // Character literal
    if (ch === "'") {
      let buffer = advance();
      let closed = false;
      while (index < sourceCode.length) {
        const c = peek();
        if (c === '\n') break;
        if (c === '\\') {
          buffer += advance();
          if (index < sourceCode.length) buffer += advance();
          continue;
        }
        if (c === "'") {
          buffer += advance();
          closed = true;
          break;
        }
        buffer += advance();
      }
      const tok = {
        id: tokenCounter++,
        type: closed ? TOKEN_TYPES.CHAR_LITERAL : TOKEN_TYPES.ERROR,
        lexeme: buffer,
        line: startLine,
        column: startCol
      };
      emittedTokens.push(tok);
      addStep({
        action: closed ? `Matched character literal ${buffer}.` : 'Unterminated character literal error.',
        dfaState: closed ? 'CHAR_ACCEPT' : 'ERROR_STATE',
        buffer,
        token: tok
      });
      continue;
    }

    // Number — same maximal-munch rules as the lexer (do not absorb a following identifier)
    if ((ch >= '0' && ch <= '9') || (ch === '.' && peek(1) >= '0' && peek(1) <= '9')) {
      addStep({
        action: `Lookahead sees '${peek(1) || 'EOF'}' / '${peek(2) || 'EOF'}'. Entering NUMBER DFA. A letter after the number stays outside this token.`,
        char: ch,
        lookahead1: peek(1),
        lookahead2: peek(2),
        dfaState: 'NUMBER_START',
        buffer: ''
      });

      const numeric = consumeNumber({ peek, advance });
      const tok = {
        id: tokenCounter++,
        type: numeric.error
          ? TOKEN_TYPES.ERROR
          : (numeric.isFloat ? TOKEN_TYPES.FLOAT_LITERAL : TOKEN_TYPES.INTEGER_LITERAL),
        lexeme: numeric.lexeme,
        line: startLine,
        column: startCol,
        base: numeric.base
      };
      emittedTokens.push(tok);
      addStep({
        action: numeric.error
          ? numeric.error.message
          : numeric.adjacentIdentifier
            ? `Emitted ${tok.type} "${numeric.lexeme}" (${numeric.base}). Next character starts a separate IDENTIFIER. That adjacency is a syntax note, not one INVALID_IDENTIFIER.`
            : `Emitted ${tok.type} "${numeric.lexeme}" (base: ${numeric.base}).`,
        dfaState: numeric.error ? 'ERROR_STATE' : (numeric.isFloat ? 'FLOAT_ACCEPT' : 'INT_ACCEPT'),
        buffer: numeric.lexeme,
        token: tok,
        lookahead1: peek(0),
        lookahead2: peek(1)
      });
      continue;
    }

    // Identifier or Keyword
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let buffer = '';
      addStep({
        action: `Encountered letter/underscore '${ch}' -> Entering IDENTIFIER DFA state.`,
        char: ch,
        lookahead1: peek(1),
        lookahead2: peek(2),
        dfaState: 'IDENTIFIER_SCAN',
        buffer
      });

      while (index < sourceCode.length && ((peek() >= 'a' && peek() <= 'z') || (peek() >= 'A' && peek() <= 'Z') || (peek() >= '0' && peek() <= '9') || peek() === '_')) {
        buffer += advance();
      }

      const kw = isKeyword(buffer);
      const tokType = kw ? TOKEN_TYPES.KEYWORD : TOKEN_TYPES.IDENTIFIER;
      const tok = {
        id: tokenCounter++,
        type: tokType,
        lexeme: buffer,
        line: startLine,
        column: startCol
      };
      emittedTokens.push(tok);

      addStep({
        action: kw ? `Checked reserved keyword table: "${buffer}" is a KEYWORD.` : `Identifier pattern matched: "${buffer}" is an IDENTIFIER.`,
        dfaState: kw ? 'KEYWORD_ACCEPT' : 'IDENTIFIER_ACCEPT',
        buffer,
        token: tok
      });
      continue;
    }

    // Operators (Maximal Munch)
    let matchedOp = null;
    for (const opSpec of SORTED_OPERATORS) {
      let match = true;
      for (let i = 0; i < opSpec.op.length; i++) {
        if (peek(i) !== opSpec.op[i]) {
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
      let buffer = '';
      for (let i = 0; i < matchedOp.op.length; i++) {
        buffer += advance();
      }
      const tok = {
        id: tokenCounter++,
        type: matchedOp.type,
        lexeme: buffer,
        line: startLine,
        column: startCol,
        opName: matchedOp.name
      };
      emittedTokens.push(tok);
      addStep({
        action: `Maximal Munch matched operator "${buffer}" (${matchedOp.name}).`,
        dfaState: 'OPERATOR_ACCEPT',
        buffer,
        token: tok,
        lookahead1: peek(0),
        lookahead2: peek(1)
      });
      continue;
    }

    // Separators
    if (SEPARATORS[ch]) {
      const sep = advance();
      const tok = {
        id: tokenCounter++,
        type: TOKEN_TYPES.SEPARATOR,
        lexeme: sep,
        line: startLine,
        column: startCol,
        sepName: SEPARATORS[sep]
      };
      emittedTokens.push(tok);
      addStep({
        action: `Matched separator "${sep}" (${SEPARATORS[sep]}).`,
        dfaState: 'SEPARATOR_ACCEPT',
        buffer: sep,
        token: tok
      });
      continue;
    }

    // Illegal char
    const bad = advance();
    const tok = {
      id: tokenCounter++,
      type: TOKEN_TYPES.ERROR,
      lexeme: bad,
      line: startLine,
      column: startCol
    };
    emittedTokens.push(tok);
    addStep({
      action: `Lexical Error: Illegal character '${bad}' (ASCII ${bad.charCodeAt(0)}).`,
      dfaState: 'ERROR_STATE',
      buffer: bad,
      token: tok
    });
  }

  addStep({
    action: `Reached End Of File (EOF). Tokenization complete! Total tokens: ${emittedTokens.length}.`,
    dfaState: 'EOF_DONE',
    char: 'EOF'
  });

  return steps;
}
