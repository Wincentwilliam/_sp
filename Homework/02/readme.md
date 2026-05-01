<div align="center">

# Homework 2 : MiniLang Compiler & VM

> **Built by: Gemini AI**

</div>

### 1. Design Goals
MiniLang is a simple imperative language designed to demonstrate the core concepts of a compiler: lexical analysis, parsing into an Abstract Syntax Tree (AST), bytecode generation, and execution via a virtual machine.

### 2. Language Features
- **Variables:** Declaration with `let` and subsequent assignment.
- **Control Flow:** `if` statements and `while` loops for logic.
- **Arithmetic:** Supports `+`, `-`, `*`, `/`.
- **Comparisons:** Supports `<` and `>` for loop/if conditions.
- **Output:** Built-in `print()` function to display values.

### 3. Implementation Details
- **Lexer:** Regular expression-based tokenizer.
- **Parser:** Recursive Descent Parser that generates an AST.
- **Compiler:** Translates AST nodes into a linear sequence of Bytecode.
- **Virtual Machine:** A stack-based machine that interprets instructions (PUSH, LOAD, STORE, OP, JUMP).
- **Type System:** Strong Typing (specifically handling Integers).
- **Memory Management:** No Garbage Collection (uses a stack for primitive operations).
- **Target Machine:** Stack machine (intermediate bytecode).

### 4. Code Example
```rust
let a = 5;
let b = 10;
if (a < b) {
    print(a + b);
}
let i = 0;
while (i < 3) {
    print(i);
    i = i + 1;
}
```

---

## Architecture Overview

### Compiler Pipeline

```
Source Code (.ml) --> Lexer --> Tokens --> Parser --> AST --> CodeGen --> Bytecode --> VM --> Output
```

### Lexer
The lexer tokenizes the input using regular expressions:
- Keywords: `let`, `if`, `while`, `print`
- Identifiers: Variable names
- Operators: `+`, `-`, `*`, `/`, `<`, `>`, `=`
- Literals: Integer numbers
- Delimiters: `(`, `)`, `{`, `}`, `;`

### Parser
The parser uses recursive descent to build an AST:
- Expression parsing with operator precedence
- Statement parsing (assignment, if, while, print)
- Program structure validation

### Code Generator
Translates AST to bytecode:
- Variable allocation
- Expression evaluation
- Control flow jumps
- Function calls

### Virtual Machine
Stack-based execution:
- Push/pop operations
- Arithmetic on stack top
- Jump instructions for control flow
- Load/store for variables

---

## Bytecode Instruction Set

| Instruction | Operand | Description |
|-------------|---------|-------------|
| PUSH | value | Push value onto stack |
| LOAD | var_index | Load variable onto stack |
| STORE | var_index | Store top of stack in variable |
| ADD | - | Pop two, push sum |
| SUB | - | Pop two, push difference |
| MUL | - | Pop two, push product |
| DIV | - | Pop two, push quotient |
| LT | - | Pop two, push 1 if less than, else 0 |
| GT | - | Pop two, push 1 if greater than, else 0 |
| JUMP | offset | Unconditional jump |
| JUMP_IF_FALSE | offset | Jump if top of stack is 0 |
| PRINT | - | Print top of stack |
| HALT | - | Stop execution |

---

## Final Checklist for Submission:
1.  **`02.py`**: Your Python code (Compiler + VM).
2.  **`EBNF`**: The grammar file.
3.  **`README.md`**: The design goals and characteristics listed above.

You have successfully built a working compiler and execution environment from scratch!
