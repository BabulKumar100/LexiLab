// LexiLab - Deterministic Finite Automata (DFA) Specifications & Interactive Simulators

export const DFA_MODELS = [
  {
    id: 'identifier',
    name: 'Identifier DFA',
    description: 'Accepts C identifiers according to the pattern [a-zA-Z_][a-zA-Z0-9_]*',
    alphabet: '[a-zA-Z], _, [0-9]',
    startState: 'q0',
    acceptStates: ['q1'],
    nodes: [
      { id: 'q0', label: 'q0 (Start)', isStart: true, isAccept: false, x: 80, y: 150, desc: 'Initial Start State' },
      { id: 'q1', label: 'q1 (Accept)', isStart: false, isAccept: true, x: 300, y: 150, desc: 'Valid Identifier State' },
      { id: 'dead', label: 'Trap / Dead', isStart: false, isAccept: false, isTrap: true, x: 200, y: 280, desc: 'Rejection Trap State' }
    ],
    edges: [
      { from: 'q0', to: 'q1', label: '[a-zA-Z_]', desc: 'First char must be letter or underscore' },
      { from: 'q1', to: 'q1', label: '[a-zA-Z0-9_]', desc: 'Self-loop on alphanumeric or underscore' },
      { from: 'q0', to: 'dead', label: '[0-9] or other', desc: 'Invalid start character' },
      { from: 'q1', to: 'dead', label: 'invalid char', desc: 'Invalid character in identifier' }
    ],
    simulate: (input) => {
      const trace = [];
      let currentState = 'q0';
      trace.push({ state: currentState, char: null, desc: 'Begin in Start State q0' });

      if (!input || input.length === 0) {
        return { trace, isAccepted: false, finalState: currentState, reason: 'Empty string cannot be accepted.' };
      }

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (currentState === 'q0') {
          if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            currentState = 'q1';
            trace.push({ state: currentState, char: ch, desc: `Read '${ch}' -> Transition to q1 (Accepting)` });
          } else {
            currentState = 'dead';
            trace.push({ state: currentState, char: ch, desc: `Read illegal leading '${ch}' -> Trap state` });
            break;
          }
        } else if (currentState === 'q1') {
          if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '_') {
            trace.push({ state: currentState, char: ch, desc: `Read '${ch}' -> Self-loop in q1` });
          } else {
            currentState = 'dead';
            trace.push({ state: currentState, char: ch, desc: `Read invalid '${ch}' -> Trap state` });
            break;
          }
        }
      }

      const isAccepted = currentState === 'q1';
      return {
        trace,
        isAccepted,
        finalState: currentState,
        reason: isAccepted ? `Accepted! "${input}" is a valid identifier.` : `Rejected: String failed to end in an accepting state.`
      };
    }
  },
  {
    id: 'number',
    name: 'Integer & Float DFA',
    description: 'Recognizes integers and floating-point literals with optional fractional component and scientific exponent.',
    alphabet: '[0-9], ., e/E, +, -',
    startState: 'q0',
    acceptStates: ['q1', 'q3', 'q6'],
    nodes: [
      { id: 'q0', label: 'q0 (Start)', isStart: true, isAccept: false, x: 50, y: 150 },
      { id: 'q1', label: 'q1 (Int Accept)', isStart: false, isAccept: true, x: 180, y: 150 },
      { id: 'q2', label: 'q2 (Decimal Pt)', isStart: false, isAccept: false, x: 300, y: 150 },
      { id: 'q3', label: 'q3 (Float Accept)', isStart: false, isAccept: true, x: 420, y: 150 },
      { id: 'q4', label: 'q4 (Exp e/E)', isStart: false, isAccept: false, x: 420, y: 260 },
      { id: 'q5', label: 'q5 (Exp Sign)', isStart: false, isAccept: false, x: 300, y: 260 },
      { id: 'q6', label: 'q6 (Sci Accept)', isStart: false, isAccept: true, x: 180, y: 260 },
      { id: 'trap', label: 'Trap', isStart: false, isAccept: false, isTrap: true, x: 50, y: 260 }
    ],
    edges: [
      { from: 'q0', to: 'q1', label: '[0-9]' },
      { from: 'q1', to: 'q1', label: '[0-9]' },
      { from: 'q1', to: 'q2', label: '.' },
      { from: 'q2', to: 'q3', label: '[0-9]' },
      { from: 'q3', to: 'q3', label: '[0-9]' },
      { from: 'q3', to: 'q4', label: 'e, E' },
      { from: 'q1', to: 'q4', label: 'e, E' },
      { from: 'q4', to: 'q5', label: '+, -' },
      { from: 'q4', to: 'q6', label: '[0-9]' },
      { from: 'q5', to: 'q6', label: '[0-9]' },
      { from: 'q6', to: 'q6', label: '[0-9]' }
    ],
    simulate: (input) => {
      const trace = [];
      let currentState = 'q0';
      trace.push({ state: currentState, char: null, desc: 'Start at q0' });

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (currentState === 'q0') {
          if (ch >= '0' && ch <= '9') {
            currentState = 'q1';
            trace.push({ state: currentState, char: ch, desc: `Read digit '${ch}' -> q1 (Integer Accept)` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Illegal start char '${ch}' -> Trap` });
            break;
          }
        } else if (currentState === 'q1') {
          if (ch >= '0' && ch <= '9') {
            trace.push({ state: currentState, char: ch, desc: `Read digit '${ch}' -> Loop in q1` });
          } else if (ch === '.') {
            currentState = 'q2';
            trace.push({ state: currentState, char: ch, desc: `Read '.' -> q2 (Awaiting fractional digits)` });
          } else if (ch === 'e' || ch === 'E') {
            currentState = 'q4';
            trace.push({ state: currentState, char: ch, desc: `Read exponent '${ch}' -> q4` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Unexpected '${ch}' -> Trap` });
            break;
          }
        } else if (currentState === 'q2') {
          if (ch >= '0' && ch <= '9') {
            currentState = 'q3';
            trace.push({ state: currentState, char: ch, desc: `Read fractional digit '${ch}' -> q3 (Float Accept)` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Missing fractional digits after '.' -> Trap` });
            break;
          }
        } else if (currentState === 'q3') {
          if (ch >= '0' && ch <= '9') {
            trace.push({ state: currentState, char: ch, desc: `Read digit '${ch}' -> Loop in q3` });
          } else if (ch === 'e' || ch === 'E') {
            currentState = 'q4';
            trace.push({ state: currentState, char: ch, desc: `Read exponent '${ch}' -> q4` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Unexpected '${ch}' -> Trap` });
            break;
          }
        } else if (currentState === 'q4') {
          if (ch === '+' || ch === '-') {
            currentState = 'q5';
            trace.push({ state: currentState, char: ch, desc: `Read exponent sign '${ch}' -> q5` });
          } else if (ch >= '0' && ch <= '9') {
            currentState = 'q6';
            trace.push({ state: currentState, char: ch, desc: `Read exponent digit '${ch}' -> q6 (Sci Accept)` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Invalid exponent -> Trap` });
            break;
          }
        } else if (currentState === 'q5') {
          if (ch >= '0' && ch <= '9') {
            currentState = 'q6';
            trace.push({ state: currentState, char: ch, desc: `Read exponent digit '${ch}' -> q6 (Sci Accept)` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Expected digit after exponent sign -> Trap` });
            break;
          }
        } else if (currentState === 'q6') {
          if (ch >= '0' && ch <= '9') {
            trace.push({ state: currentState, char: ch, desc: `Read exponent digit '${ch}' -> Loop in q6` });
          } else {
            currentState = 'trap';
            trace.push({ state: currentState, char: ch, desc: `Unexpected character -> Trap` });
            break;
          }
        }
      }

      const isAccepted = ['q1', 'q3', 'q6'].includes(currentState);
      return {
        trace,
        isAccepted,
        finalState: currentState,
        reason: isAccepted ? `Accepted! Valid number format (${currentState === 'q1' ? 'Integer' : 'Float'}).` : `Rejected! Reached non-accepting state ${currentState}.`
      };
    }
  },
  {
    id: 'string',
    name: 'String Literal DFA',
    description: 'Recognizes double-quoted string literals with escape character sequences.',
    alphabet: '", \\, any ASCII',
    startState: 'q0',
    acceptStates: ['q2'],
    nodes: [
      { id: 'q0', label: 'q0 (Start)', isStart: true, isAccept: false, x: 80, y: 150 },
      { id: 'q1', label: 'q1 (In String)', isStart: false, isAccept: false, x: 230, y: 150 },
      { id: 'q_esc', label: 'q_esc (Escape \\)', isStart: false, isAccept: false, x: 230, y: 260 },
      { id: 'q2', label: 'q2 (Accept)', isStart: false, isAccept: true, x: 380, y: 150 }
    ],
    edges: [
      { from: 'q0', to: 'q1', label: '"' },
      { from: 'q1', to: 'q1', label: '[^"\\\\]' },
      { from: 'q1', to: 'q_esc', label: '\\' },
      { from: 'q_esc', to: 'q1', label: 'any char' },
      { from: 'q1', to: 'q2', label: '"' }
    ],
    simulate: (input) => {
      const trace = [];
      let currentState = 'q0';
      trace.push({ state: currentState, char: null, desc: 'Start at q0' });

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (currentState === 'q0') {
          if (ch === '"') {
            currentState = 'q1';
            trace.push({ state: currentState, char: ch, desc: 'Read opening quote " -> q1' });
          } else {
            trace.push({ state: 'trap', char: ch, desc: 'Must begin with quote "' });
            return { trace, isAccepted: false, finalState: 'trap', reason: 'Must begin with quote "' };
          }
        } else if (currentState === 'q1') {
          if (ch === '\\') {
            currentState = 'q_esc';
            trace.push({ state: currentState, char: ch, desc: 'Read escape \\ -> q_esc' });
          } else if (ch === '"') {
            currentState = 'q2';
            trace.push({ state: currentState, char: ch, desc: 'Read closing quote " -> q2 (Accept)' });
          } else {
            trace.push({ state: currentState, char: ch, desc: `Read character '${ch}' -> Loop in q1` });
          }
        } else if (currentState === 'q_esc') {
          currentState = 'q1';
          trace.push({ state: currentState, char: ch, desc: `Read escaped char '${ch}' -> Return to q1` });
        } else if (currentState === 'q2') {
          trace.push({ state: 'trap', char: ch, desc: `Extra character after closing quote -> Rejection` });
          return { trace, isAccepted: false, finalState: 'trap', reason: 'Characters after string closing quote are illegal.' };
        }
      }

      const isAccepted = currentState === 'q2';
      return {
        trace,
        isAccepted,
        finalState: currentState,
        reason: isAccepted ? 'Accepted! Valid string literal.' : 'Rejected! String is unterminated.'
      };
    }
  },
  {
    id: 'char_literal',
    name: 'Character Literal DFA',
    description: 'Recognizes single-quoted character constants including escape sequences like \'\\n\' or \'\\t\'.',
    alphabet: "', \\, any ASCII",
    startState: 'q0',
    acceptStates: ['q3'],
    nodes: [
      { id: 'q0', label: 'q0 (Start)', isStart: true, isAccept: false, x: 60, y: 150 },
      { id: 'q1', label: 'q1 (Quote Read)', isStart: false, isAccept: false, x: 190, y: 150 },
      { id: 'q_esc', label: 'q_esc (Escape \\)', isStart: false, isAccept: false, x: 190, y: 260 },
      { id: 'q2', label: 'q2 (Char Read)', isStart: false, isAccept: false, x: 330, y: 150 },
      { id: 'q3', label: 'q3 (Accept)', isStart: false, isAccept: true, x: 450, y: 150 }
    ],
    edges: [
      { from: 'q0', to: 'q1', label: "'" },
      { from: 'q1', to: 'q_esc', label: '\\' },
      { from: 'q1', to: 'q2', label: "[^'\\\\]" },
      { from: 'q_esc', to: 'q2', label: 'any char' },
      { from: 'q2', to: 'q3', label: "'" }
    ],
    simulate: (input) => {
      const trace = [];
      let currentState = 'q0';
      trace.push({ state: currentState, char: null, desc: 'Start at q0' });

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (currentState === 'q0') {
          if (ch === "'") {
            currentState = 'q1';
            trace.push({ state: currentState, char: ch, desc: "Read opening quote ' -> q1" });
          } else {
            return { trace, isAccepted: false, finalState: 'trap', reason: "Character literal must begin with single-quote '" };
          }
        } else if (currentState === 'q1') {
          if (ch === '\\') {
            currentState = 'q_esc';
            trace.push({ state: currentState, char: ch, desc: "Read escape '\\' -> q_esc" });
          } else if (ch === "'") {
            return { trace, isAccepted: false, finalState: 'trap', reason: "Empty character literal '' is illegal in C" };
          } else {
            currentState = 'q2';
            trace.push({ state: currentState, char: ch, desc: `Read character '${ch}' -> q2` });
          }
        } else if (currentState === 'q_esc') {
          currentState = 'q2';
          trace.push({ state: currentState, char: ch, desc: `Read escaped char '${ch}' -> q2` });
        } else if (currentState === 'q2') {
          if (ch === "'") {
            currentState = 'q3';
            trace.push({ state: currentState, char: ch, desc: "Read closing quote ' -> q3 (Accept)" });
          } else {
            return { trace, isAccepted: false, finalState: 'trap', reason: "Multi-character character literal is illegal in standard C" };
          }
        } else if (currentState === 'q3') {
          return { trace, isAccepted: false, finalState: 'trap', reason: "Excess characters after closing single-quote" };
        }
      }

      const isAccepted = currentState === 'q3';
      return {
        trace,
        isAccepted,
        finalState: currentState,
        reason: isAccepted ? `Accepted! Valid character literal '${input}'.` : 'Incomplete or unclosed character literal.'
      };
    }
  },
  {
    id: 'relational',
    name: 'Relational Operator DFA',
    description: 'Models Maximal Munch for operators like <, <=, <<, <<=',
    alphabet: '<, =, <',
    startState: 'q0',
    acceptStates: ['q_lt', 'q_le', 'q_shl', 'q_shle'],
    nodes: [
      { id: 'q0', label: 'q0 (Start)', isStart: true, isAccept: false, x: 60, y: 150 },
      { id: 'q_lt', label: 'q1 (< Accept)', isStart: false, isAccept: true, x: 200, y: 100 },
      { id: 'q_le', label: 'q2 (<= Accept)', isStart: false, isAccept: true, x: 350, y: 100 },
      { id: 'q_shl', label: 'q3 (<< Accept)', isStart: false, isAccept: true, x: 200, y: 220 },
      { id: 'q_shle', label: 'q4 (<<= Accept)', isStart: false, isAccept: true, x: 350, y: 220 }
    ],
    edges: [
      { from: 'q0', to: 'q_lt', label: '<' },
      { from: 'q_lt', to: 'q_le', label: '=' },
      { from: 'q_lt', to: 'q_shl', label: '<' },
      { from: 'q_shl', to: 'q_shle', label: '=' }
    ],
    simulate: (input) => {
      const trace = [];
      let currentState = 'q0';
      trace.push({ state: currentState, char: null, desc: 'Start at q0' });

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (currentState === 'q0') {
          if (ch === '<') {
            currentState = 'q_lt';
            trace.push({ state: currentState, char: ch, desc: "Read '<' -> q1 (< operator)" });
          } else {
            return { trace, isAccepted: false, finalState: 'trap', reason: "Must begin with '<'" };
          }
        } else if (currentState === 'q_lt') {
          if (ch === '=') {
            currentState = 'q_le';
            trace.push({ state: currentState, char: ch, desc: "Read '=' -> q2 (<= operator)" });
          } else if (ch === '<') {
            currentState = 'q_shl';
            trace.push({ state: currentState, char: ch, desc: "Read '<' -> q3 (<< left shift)" });
          } else {
            return { trace, isAccepted: false, finalState: 'trap', reason: `Unexpected '${ch}' after '<'` };
          }
        } else if (currentState === 'q_shl') {
          if (ch === '=') {
            currentState = 'q_shle';
            trace.push({ state: currentState, char: ch, desc: "Read '=' -> q4 (<<= left shift assign)" });
          } else {
            return { trace, isAccepted: false, finalState: 'trap', reason: `Unexpected '${ch}' after '<<'` };
          }
        } else {
          return { trace, isAccepted: false, finalState: 'trap', reason: 'No further transitions available in operator DFA.' };
        }
      }

      const isAccepted = ['q_lt', 'q_le', 'q_shl', 'q_shle'].includes(currentState);
      return {
        trace,
        isAccepted,
        finalState: currentState,
        reason: isAccepted ? `Accepted! Matched operator '${input}'.` : 'Incomplete operator.'
      };
    }
  }
];
