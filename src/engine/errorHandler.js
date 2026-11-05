// LexiLab - Lexical Error Handler

export const ERROR_CODES = {
  ERR_INVALID_CHARACTER: 'ERR_INVALID_CHARACTER',
  ERR_UNTERMINATED_STRING: 'ERR_UNTERMINATED_STRING',
  ERR_UNTERMINATED_CHAR: 'ERR_UNTERMINATED_CHAR',
  ERR_UNTERMINATED_COMMENT: 'ERR_UNTERMINATED_COMMENT',
  ERR_MALFORMED_NUMBER: 'ERR_MALFORMED_NUMBER',
  ERR_INVALID_ESCAPE: 'ERR_INVALID_ESCAPE'
};

export class LexicalError {
  constructor({ code, message, line, column, lexeme, suggestion, snippet, phase = 'LEXICAL' }) {
    this.code = code;
    this.message = message;
    this.phase = phase;
    this.line = line;
    this.column = column;
    this.lexeme = lexeme;
    this.suggestion = suggestion || 'Check the character sequence against the C lexical grammar.';
    this.snippet = snippet || '';
    this.timestamp = Date.now();
  }
}

export function createErrorSnippet(source, line, column, errorLen = 1) {
  const lines = source.split('\n');
  const targetLine = lines[line - 1] || '';
  const lineNum = String(line).padStart(3, ' ');
  const pointer = ' '.repeat(Math.max(0, column - 1)) + '^'.repeat(Math.max(1, errorLen));

  return `${lineNum} | ${targetLine}\n    | ${pointer}`;
}
