// LexiLab - Predefined Sample Programs for Testing & Demos

export const SAMPLE_PROGRAMS = [
  {
    id: 'starter',
    name: 'College Demo: Variables & Condition',
    category: 'Basic',
    description: 'The standard lecture example demonstrating keywords, identifiers, literals, operators, and separators.',
    code: `// LexiLab Standard College Demo
int a = 10;
float b = 20.5;

if (a < b) {
    printf("Hello World\\n");
}`
  },
  {
    id: 'maximal-munch',
    name: 'Maximal Munch & Operators',
    category: 'Advanced Lexical',
    description: 'Demonstrates the Longest Match Principle: a+++b recognized as (a++) + b, <<= as 3-char operator, etc.',
    code: `// Maximal Munch (Longest Match) Test
int a = 5;
int b = 10;
int result = a+++b; // Recognized as (a++) + (b)

int flag = 1;
if (a <= b && b != 0) {
    flag <<= 2;
}

ptr->value = (*p) + 42;`
  },
  {
    id: 'errors-demo',
    name: 'Lexical Errors Showcase',
    category: 'Error Diagnostics',
    description: 'Illegal characters, unterminated literals, invalid octal digits, plus a number/identifier split that is a syntax note rather than one INVALID_IDENTIFIER token.',
    code: `// Lexical errors vs syntax-phase notes
int valid_var = 100;

// 1. Lexical error: '@' is not in the C alphabet
int bad_calc = 10 @ 2;

// 2. NOT one invalid identifier. Tokens: 123 + invalid_ident
int 123invalid_ident = 50;

// 3. Lexical error: unterminated string
char *msg = "Unclosed string;

// 4. Two floats by maximal munch: 3.14 and .15
float split_float = 3.14.15;

// 5. Lexical error: 8 is not an octal digit
int bad_octal = 08;

/* 6. Lexical error: unterminated comment at end of code
int orphaned_code = 99;
`
  },
  {
    id: 'factorial-function',
    name: 'Factorial & Functions',
    category: 'Functions & Loops',
    description: 'Recursive and iterative factorial function demonstrating function calls, returns, and loop syntax.',
    code: `#include <stdio.h>

/* Compute Factorial of a non-negative integer */
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int num = 5;
    int ans = factorial(num);
    printf("Factorial of %d is %d\\n", num, ans);
    return 0;
}`
  },
  {
    id: 'struct-pointers',
    name: 'Structs, Enums & Pointers',
    category: 'Data Structures',
    description: 'C struct definitions, pointer dereferencing (->, .), enums, and typedefs.',
    code: `typedef struct {
    int id;
    float gpa;
    char grade;
} Student;

enum Status { PENDING = 0, ACTIVE = 1, GRADUATED = 2 };

int main() {
    Student s1;
    s1.id = 101;
    s1.gpa = 3.85f;
    s1.grade = 'A';

    Student *ptr = &s1;
    ptr->gpa += 0.1f;

    return 0;
}`
  },
  {
    id: 'hex-binary-numbers',
    name: 'Hex, Octal & Binary Literals',
    category: 'Literals',
    description: 'Testing hex numbers (0xFF), binary numbers (0b1010), scientific exponents (1.25e-4), and escaped chars.',
    code: `// Various numeric and character literals
int hex_val = 0x2F4A;
int bin_val = 0b110010;
float sci_val = 1.45e-3;
double big_val = 2.99792458e8;

char tab_char = '\\t';
char newline = '\\n';
char quote = '\\'';
char *escaped_str = "Line 1\\nLine 2\\t\\"Nested Quotes\\"";`
  }
];
