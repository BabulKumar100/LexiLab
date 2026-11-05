// LexiLab - Position Tracker

export class PositionTracker {
  constructor(source = '') {
    this.source = source;
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  reset(source = '') {
    this.source = source;
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  peek(offset = 0) {
    const pos = this.index + offset;
    return pos < this.source.length ? this.source[pos] : null;
  }

  advance() {
    if (this.isAtEnd()) return null;
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

  isAtEnd() {
    return this.index >= this.source.length;
  }

  getPosition() {
    return {
      index: this.index,
      line: this.line,
      column: this.column
    };
  }
}
