// Shared numeric-literal scanner.
// Letters after a finished number are NOT glued into the literal.
// `123invalid` is therefore INTEGER "123" plus IDENTIFIER "invalid".

export function consumeNumber({ peek, advance }) {
  const isDigit = (c) => c >= '0' && c <= '9';
  const isHex = (c) => isDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
  const isAlpha = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';

  let lexeme = '';
  let isFloat = false;
  let base = 'decimal';
  let error = null;

  const take = () => {
    const c = advance();
    lexeme += c;
    return c;
  };

  const finish = () => ({
    lexeme,
    isFloat,
    base: isFloat ? 'float' : base,
    error,
    adjacentIdentifier: !error && isAlpha(peek(0))
  });

  const consumeExponent = () => {
    if (peek(0) !== 'e' && peek(0) !== 'E') return false;
    const sign = peek(1);
    const digitPos = sign === '+' || sign === '-' ? peek(2) : peek(1);
    if (!isDigit(digitPos)) return false;
    take();
    if (peek(0) === '+' || peek(0) === '-') take();
    while (isDigit(peek(0))) take();
    return true;
  };

  const consumeIntSuffix = () => {
    let sawUnsigned = false;
    let longCount = 0;
    while (true) {
      const c = peek(0);
      if ((c === 'u' || c === 'U') && !sawUnsigned) {
        take();
        sawUnsigned = true;
        continue;
      }
      if ((c === 'l' || c === 'L') && longCount < 2) {
        take();
        longCount++;
        continue;
      }
      break;
    }
  };

  const consumeFloatSuffix = () => {
    const c = peek(0);
    if (c === 'f' || c === 'F' || c === 'l' || c === 'L') take();
  };

  if (peek(0) === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
    base = 'hex';
    take();
    take();
    let digits = 0;
    while (isHex(peek(0))) {
      take();
      digits++;
    }
    if (digits === 0) {
      error = {
        code: 'ERR_MALFORMED_NUMBER',
        message: `Hexadecimal literal "${lexeme}" has no digits`,
        suggestion: 'Write at least one hexadecimal digit after 0x, for example 0x2A.'
      };
    } else {
      consumeIntSuffix();
    }
    return finish();
  }

  if (peek(0) === '0' && (peek(1) === 'b' || peek(1) === 'B')) {
    base = 'binary';
    take();
    take();
    let digits = 0;
    while (peek(0) === '0' || peek(0) === '1') {
      take();
      digits++;
    }
    if (digits === 0) {
      error = {
        code: 'ERR_MALFORMED_NUMBER',
        message: `Binary literal "${lexeme}" has no digits`,
        suggestion: 'Write at least one binary digit after 0b, for example 0b1010.'
      };
    } else if (isDigit(peek(0))) {
      while (isDigit(peek(0))) take();
      error = {
        code: 'ERR_MALFORMED_NUMBER',
        message: `Invalid binary digit in "${lexeme}"`,
        suggestion: 'Binary literals may contain only 0 and 1 after the 0b prefix.'
      };
    } else {
      consumeIntSuffix();
    }
    return finish();
  }

  if (peek(0) === '.' && isDigit(peek(1))) {
    isFloat = true;
    base = 'float';
    take();
    while (isDigit(peek(0))) take();
    if (consumeExponent()) isFloat = true;
    if (!error) consumeFloatSuffix();
    return finish();
  }

  const startedWithZero = peek(0) === '0';
  while (isDigit(peek(0))) take();
  const digitPart = lexeme;

  if (peek(0) === '.' && peek(1) !== '.') {
    isFloat = true;
    base = 'float';
    take();
    while (isDigit(peek(0))) take();
  }

  if (consumeExponent()) {
    isFloat = true;
    base = 'float';
  }

  if (!isFloat && startedWithZero && digitPart.length > 1 && /^[0-9]+$/.test(digitPart)) {
    base = 'octal';
    if (/[89]/.test(digitPart)) {
      error = {
        code: 'ERR_MALFORMED_NUMBER',
        message: `Invalid octal digit in "${digitPart}"`,
        suggestion: 'Octal constants use digits 0–7. A leading zero does not make 8 or 9 legal. Write 8 as decimal, or use a valid octal such as 010.'
      };
    }
  }

  if (!error) {
    if (isFloat) consumeFloatSuffix();
    else consumeIntSuffix();
  }

  return finish();
}
