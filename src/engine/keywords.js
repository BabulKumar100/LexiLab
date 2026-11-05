// LexiLab - Keywords Definition & Metadata

export const C_KEYWORDS = new Set([
  'auto',
  'break',
  'case',
  'char',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extern',
  'float',
  'for',
  'goto',
  'if',
  'inline',
  'int',
  'long',
  'register',
  'restrict',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'typedef',
  'union',
  'unsigned',
  'void',
  'volatile',
  'while',
  '_Bool',
  '_Complex',
  '_Imaginary',
  'bool',
  'true',
  'false',
  'NULL'
]);

export const KEYWORD_CATEGORIES = {
  DATA_TYPE: ['int', 'float', 'char', 'double', 'void', 'short', 'long', 'signed', 'unsigned', 'bool', '_Bool', 'enum', 'struct', 'union'],
  CONTROL_FLOW: ['if', 'else', 'switch', 'case', 'default', 'while', 'for', 'do', 'goto', 'break', 'continue', 'return'],
  STORAGE_CLASS: ['auto', 'register', 'static', 'extern', 'typedef'],
  TYPE_QUALIFIER: ['const', 'volatile', 'restrict'],
  OPERATOR_KEYWORD: ['sizeof'],
  LITERAL_KEYWORD: ['true', 'false', 'NULL']
};

export function isKeyword(str) {
  return C_KEYWORDS.has(str);
}

export function getKeywordCategory(str) {
  for (const [cat, words] of Object.entries(KEYWORD_CATEGORIES)) {
    if (words.includes(str)) return cat;
  }
  return 'GENERAL';
}
