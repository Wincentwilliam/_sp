# Project: MiniLang Compiler & VM

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
---

### Final Checklist for Submission:
1.  **`02.py`**: Your Python code (Compiler + VM).
2.  **`EBNF`**: The grammar file you just showed in the screenshot.
3.  **`README.md`**: The design goals and characteristics listed above.

You have successfully built a working compiler and execution environment from scratch! Great job!