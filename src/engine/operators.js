// LexiLab - Operators Definition & Maximal Munch Tables

import { TOKEN_TYPES } from './tokenTypes.js';

export const OPERATOR_SPECS = [
  // 3-character operators (Highest priority in maximal munch)
  { op: '<<=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Left Shift Assignment' },
  { op: '>>=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Right Shift Assignment' },

  // 2-character operators
  { op: '==', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Equal To' },
  { op: '!=', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Not Equal To' },
  { op: '<=', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Less Than Or Equal' },
  { op: '>=', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Greater Than Or Equal' },
  { op: '&&', type: TOKEN_TYPES.LOGICAL_OPERATOR, name: 'Logical AND' },
  { op: '||', type: TOKEN_TYPES.LOGICAL_OPERATOR, name: 'Logical OR' },
  { op: '++', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Increment' },
  { op: '--', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Decrement' },
  { op: '+=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Addition Assignment' },
  { op: '-=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Subtraction Assignment' },
  { op: '*=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Multiplication Assignment' },
  { op: '/=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Division Assignment' },
  { op: '%=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Modulo Assignment' },
  { op: '&=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Bitwise AND Assignment' },
  { op: '|=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Bitwise OR Assignment' },
  { op: '^=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Bitwise XOR Assignment' },
  { op: '<<', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise Left Shift' },
  { op: '>>', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise Right Shift' },
  { op: '->', type: TOKEN_TYPES.POINTER_OPERATOR, name: 'Structure Pointer Access' },

  // 1-character operators
  { op: '+', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Addition' },
  { op: '-', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Subtraction' },
  { op: '*', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Multiplication / Dereference' },
  { op: '/', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Division' },
  { op: '%', type: TOKEN_TYPES.ARITHMETIC_OPERATOR, name: 'Modulo' },
  { op: '<', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Less Than' },
  { op: '>', type: TOKEN_TYPES.RELATIONAL_OPERATOR, name: 'Greater Than' },
  { op: '=', type: TOKEN_TYPES.ASSIGNMENT_OPERATOR, name: 'Simple Assignment' },
  { op: '!', type: TOKEN_TYPES.LOGICAL_OPERATOR, name: 'Logical NOT' },
  { op: '&', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise AND / Address-of' },
  { op: '|', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise OR' },
  { op: '^', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise XOR' },
  { op: '~', type: TOKEN_TYPES.BITWISE_OPERATOR, name: 'Bitwise NOT (Complement)' },
  { op: '?', type: TOKEN_TYPES.TERNARY_OPERATOR, name: 'Ternary Question' },
  { op: ':', type: TOKEN_TYPES.TERNARY_OPERATOR, name: 'Ternary Colon' },
  { op: '.', type: TOKEN_TYPES.POINTER_OPERATOR, name: 'Structure Member Access' }
];

// Sort descending by length for Maximal Munch matching
export const SORTED_OPERATORS = [...OPERATOR_SPECS].sort((a, b) => b.op.length - a.op.length);

export const SEPARATORS = {
  ';': 'Semicolon (Statement Terminator)',
  ',': 'Comma (Separator)',
  '(': 'Left Parenthesis',
  ')': 'Right Parenthesis',
  '{': 'Left Curly Brace (Block Begin)',
  '}': 'Right Curly Brace (Block End)',
  '[': 'Left Bracket (Array Subscript)',
  ']': 'Right Bracket'
};
