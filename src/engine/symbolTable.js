// LexiLab - Symbol Table Management

export class SymbolTable {
  constructor() {
    this.entries = new Map();
  }

  clear() {
    this.entries.clear();
  }

  /**
   * Add or update an identifier symbol entry.
   * Note on Compiler Theory:
   * At the pure Lexical Analysis phase, all variable/function names are purely IDENTIFIERS.
   * Semantic attributes (such as inferred data type, function signature, and block scope)
   * are captured here as an educational preview ("Extended Symbol Table") to demonstrate
   * how the Symbol Table persists and enriches across subsequent compiler phases.
   */
  insert({ name, line, column, inferredType = 'auto', category = 'IDENTIFIER', semanticHint = 'Variable', scope = 'global' }) {
    if (this.entries.has(name)) {
      const entry = this.entries.get(name);
      entry.occurrences++;
      if (!entry.lines.includes(line)) {
        entry.lines.push(line);
      }
      if (inferredType && inferredType !== 'auto' && entry.dataType === 'auto') {
        entry.dataType = inferredType;
      }
      if (semanticHint && semanticHint !== 'Variable' && entry.semanticHint === 'Variable') {
        entry.semanticHint = semanticHint;
      }
    } else {
      this.entries.set(name, {
        id: this.entries.size + 1,
        name,
        category: 'IDENTIFIER',
        semanticHint,
        dataType: inferredType || 'auto',
        scope,
        occurrences: 1,
        lines: [line],
        firstSeen: { line, column },
        memoryAddress: `0x${(0x7fff0000 + (this.entries.size * 4)).toString(16).toUpperCase()}`
      });
    }
  }

  getAllEntries() {
    return Array.from(this.entries.values());
  }

  get(name) {
    return this.entries.get(name);
  }

  size() {
    return this.entries.size;
  }
}
