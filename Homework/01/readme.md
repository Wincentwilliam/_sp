<div align="center">

# p0 Compiler Project - While Loop & Function Calls

> **Built by: Google AI Studio**

</div>

This project is an enhancement of the **p0 compiler**. It introduces control flow handling for `while` loops and provides a detailed implementation analysis of the function call mechanism within the Virtual Machine (VM).

## Project Files
*   **01.c**: The complete source code for the compiler (Lexer, Parser, Generator, VM).
*   **test.p0**: A test script written in p0 language to verify the new features.
*   **README.md**: Documentation of the design principles and usage.

---

## How to Run

### 1. Compile the Source Code
Use `gcc` to compile the C file.

```bash
gcc 01.c -o compiler
```

### 2. Run the Compiler
Execute the compiled compiler with a test file.

```bash
./compiler test.p0
```

---

## Features Implemented

### 1. While Loop Support
The compiler now handles `while` loop constructs with the following semantics:
- Condition evaluation before each iteration
- Jump instructions for loop control
- Proper bytecode generation for loop bodies

### 2. Function Call Mechanism
The VM implements function calls with:
- Stack frame management
- Parameter passing
- Return value handling
- Local variable scoping

---

## Compiler Architecture

```
+-------------+    +----------+    +-----------+    +--------+
|   Source    | -> |  Lexer   | -> |  Parser   | -> |  Code  |
|    (.p0)    |    | (Tokens) |    |   (AST)   |    |  Gen   |
+-------------+    +----------+    +-----------+    +--------+
                                                      |
                                                      v
+-------------+    +----------+    +-----------+    +--------+
|   Output    | <- |   VM     | <- | Bytecode  | <- |  IR    |
|  (Result)   |    | (Execute)|    |  (Code)   |    |        |
+-------------+    +----------+    +-----------+    +--------+
```

---

## Testing

Create a test file `test.p0`:

```
// Test while loop
var i = 0;
while (i < 5) {
    print(i);
    i = i + 1;
}

// Test function call
function add(a, b) {
    return a + b;
}
print(add(3, 4));
```

---

## Notes

- The compiler is written in C for educational purposes
- The VM is stack-based for simplicity
- All error handling is implemented with clear error messages
