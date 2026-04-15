# 第二章：LLVM 架構基礎
## LLVM Architecture Basics

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

<div align="center">

![Chapter 2](https://img.shields.io/badge/Chapter-2-4CAF50?style=for-the-badge)
![Level](https://img.shields.io/badge/Level-Intermediate-2196F3?style=for-the-badge)
![Duration](https://img.shields.io/badge/Duration-2%20weeks-FF9800?style=for-the-badge)

*Mastering the LLVM Framework*

</div>

---

## Table of Contents

1. [Introduction to LLVM](#21-introduction-to-llvm)
2. [LLVM Architecture Overview](#22-llvm-architecture-overview)
3. [LLVM IR: The Heart of LLVM](#23-llvm-ir-the-heart-of-llvm)
4. [LLVM Toolchain](#24-llvm-toolchain)
5. [LLVM C++ API](#25-llvm-c-api)
6. [LLVM Pass Infrastructure](#26-llvm-pass-infrastructure)
7. [Target Description System](#27-target-description-system)
8. [Clang: The C Language Frontend](#28-clang-the-c-language-frontend)
9. [Setting Up Your Environment](#29-setting-up-your-environment)
10. [Summary](#210-summary)
11. [Exercises](#211-exercises)

---

## 2.1 Introduction to LLVM

**LLVM** (Low Level Virtual Machine) is an open-source compiler infrastructure project that provides a modular, reusable, and powerful framework for building compilers, language runtimes, and related tools. Created by Vikram Adve and Chris Lattner at the University of Illinois in 2000, LLVM has evolved into one of the most influential and widely-adopted compiler frameworks in modern software development.

### 2.1.1 The LLVM Revolution

LLVM transformed the compiler landscape by providing:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM'S IMPACT                                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  BEFORE LLVM:                    AFTER LLVM:                          │
│                                                                        │
│  ┌──────────────────┐           ┌──────────────────────────────────┐  │
│  │  Language X       │           │          LLVM Core               │  │
│  │  ─────────────── │           │  ┌────────────────────────────┐  │  │
│  │  [Frontend]     │           │  │  Optimization Passes     │  │  │
│  │  [Optimizer]    │           │  │  Code Generation          │  │  │
│  │  [Backend]     │           │  │  Target Support           │  │  │
│  │  ─────────────── │           │  └────────────────────────────┘  │  │
│  │  [x86 Backend] │           │       ▲         ▲        ▲        │  │
│  └──────────────────┘           │       │         │        │        │  │
│                                 │  ┌────┴──┐ ┌───┴──┐ ┌───┴──┐    │  │
│  Language Y:                    │  │ Clang │ │Swift │ │ Rust │    │  │
│  ┌──────────────────┐           │  │      │ │      │ │      │    │  │
│  │  [Frontend]     │           │  └──────┘ └──────┘ └──────┘    │  │
│  │  [Optimizer]    │           └──────────────────────────────────┘  │
│  │  [Backend]     │                                                    │
│  │  [x86 Backend] │                                                    │
│  └──────────────────┘                                                    │
│                                                                        │
│  ❌ Duplicated Effort        ✅ Shared Infrastructure                  │
│  ❌ Expensive Maintenance    ✅ Reusable Components                    │
│  ❌ Limited Portability      ✅ Multi-Target Support                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1.2 LLVM in Production

The widespread adoption of LLVM demonstrates its reliability and performance:

| Language/Project | Organization | Purpose |
|-----------------|--------------|---------|
| **Clang** | LLVM Project | C/C++/Objective-C compiler |
| **Swift** | Apple | Modern programming language |
| **Rust** | Rust Foundation | Memory-safe systems language |
| **Julia** | Julia Computing | High-performance technical computing |
| **Flutter** | Google | Cross-platform UI framework |
| **PyTorch** | Meta | Machine learning framework |
| **WebAssembly** | W3C | WebAssembly compilation target |
| **LFortran** | Various | Modern Fortran compiler |
| **Carbon** | Google | C++ successor language |

### 2.1.3 Why Learn LLVM?

| Benefit | Description |
|---------|-------------|
| **Industry Relevance** | Used by Apple, Google, Meta, and many others |
| **Modular Design** | Learn components incrementally |
| **Excellent Documentation** | Comprehensive official docs and tutorials |
| **Active Community** | Large, helpful developer community |
| **Production Quality** | Battle-tested in real-world applications |

---

## 2.2 LLVM Architecture Overview

LLVM's design philosophy centers on **separation of concerns**, enabling modularity, reusability, and extensibility.

### 2.2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LLVM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   LANGUAGES                          RUNTIME SYSTEMS                    │
│   ──────────                         ───────────────                   │
│                                                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│   │  Clang   │   │  Swift   │   │  Rust    │   │  Julia   │        │
│   │  (C/C++) │   │Compiler  │   │Compiler  │   │Compiler  │        │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘        │
│        │                │                │                │              │
│        └────────────────┼────────────────┼────────────────┘              │
│                         │                                                  │
│                         ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                      LLVM IR                                     │  │
│   │  ┌───────────────────────────────────────────────────────────┐  │  │
│   │  │                                                            │  │  │
│   │  │  ; Module                                                 │  │  │
│   │  │  define i32 @add(i32 %a, i32 %b) {                       │  │  │
│   │  │    %result = add i32 %a, %b                               │  │  │
│   │  │    ret i32 %result                                       │  │  │
│   │  │  }                                                         │  │  │
│   │  │                                                            │  │  │
│   │  └───────────────────────────────────────────────────────────┘  │  │
│   │                                                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                         │                                                  │
│                         ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                   OPTIMIZER (opt)                                 │  │
│   │                                                                   │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│   │  │  SSA     │  │  Loop    │  │  Global   │  │  Vector- │     │  │
│   │  │ Passes   │  │ Passes   │  │  Value    │  │  ization │     │  │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│   │                                                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                         │                                                  │
│                         ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │              CODE GENERATOR (llc)                                │  │
│   │                                                                   │  │
│   │  ┌─────────────────────────────────────────────────────────┐     │  │
│   │  │                  Target Machine                          │     │  │
│   │  │                                                           │     │  │
│   │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │     │  │
│   │  │  │  x86   │  │  ARM   │  │ RISC-V │  │WASM    │       │     │  │
│   │  │  │        │  │        │  │        │  │        │       │     │  │
│   │  │  └────────┘  └────────┘  └────────┘  └────────┘       │     │  │
│   │  │                                                           │     │  │
│   │  └─────────────────────────────────────────────────────────┘     │  │
│   │                                                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2.2 Core Components

| Component | Description | Key Classes |
|-----------|-------------|-------------|
| **LLVM IR** | Type-safe, RISC-like instruction set | `Module`, `Function`, `BasicBlock` |
| **Core Library** | Basic types, utilities, smart pointers | `LLVMContext`, `Value`, `Type` |
| **CodeGen** | Target-independent code generation | `TargetMachine`, `MCAsmBackend` |
| **Analysis** | Various analysis passes | `DominatorTree`, `LoopInfo`, `AA` |
| **Transform** | Optimization transformations | `InstCombine`, `Inlining`, `GVN` |
| **MC** | Machine code assembly/disassembly | `MCSymbol`, `MCInst` |

### 2.2.3 The Three-Pass Model in LLVM

```
┌────────────────────────────────────────────────────────────────────────┐
│                    LLVM THREE-PASS MODEL                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌─────────────────────┐                                              │
│   │       FRONTEND      │     Language-specific parsing                │
│   │                     │     • Clang: C/C++/Obj-C                    │
│   │  [Language Parser]  │     • Swift: Swift language                 │
│   │  [Semantic Analyze] │     • Any custom frontend                   │
│   │  [AST Builder]     │                                             │
│   └──────────┬──────────┘                                              │
│              │                                                         │
│              ▼                                                         │
│   ┌─────────────────────┐     ┌─────────────────────────────────┐   │
│   │    OPTIMIZER         │────►│   Target-Independent Passes      │   │
│   │                     │     │                                   │   │
│   │  [Pass Manager]     │     │  • Constant folding               │   │
│   │  [Transform Passes]  │     │  • Dead code elimination         │   │
│   │  [Analysis Passes]   │     │  • Loop optimizations            │   │
│   │                     │     │  • Function inlining              │   │
│   └──────────┬──────────┘     │  • Vectorization                 │   │
│              │                └─────────────────────────────────┘   │
│              ▼                                                         │
│   ┌─────────────────────┐     ┌─────────────────────────────────┐   │
│   │       BACKEND        │────►│   Target-Specific Code Gen      │   │
│   │                     │     │                                   │   │
│   │  [Instruction Sel]  │     │  • x86/x86-64                   │   │
│   │  [Register Alloc]   │     │  • ARM/AArch64                  │   │
│   │  [Code Emission]    │     │  • RISC-V                        │   │
│   │                     │     │  • WebAssembly                   │   │
│   └─────────────────────┘     │  • And many more...               │   │
│                                └─────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 LLVM IR: The Heart of LLVM

LLVM IR (Intermediate Representation) is the typed, RISC-like instruction set that serves as the common representation between frontend and backend.

### 2.3.1 IR Design Philosophy

| Property | Description | Benefit |
|----------|-------------|---------|
| **Strongly Typed** | Every value has a defined type | Enables type-safe optimizations |
| **SSA Form** | Each variable assigned once | Simplifies data flow analysis |
| **RISC-like** | Simple, few instruction types | Easy to analyze and optimize |
| **Unlimited Registers** | Infinite virtual registers | Enables optimal register allocation |
| **Hierarchy** | Structured with modules, functions, blocks | Mirrors program structure |

### 2.3.2 IR Module Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                     LLVM IR STRUCTURE                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     LLVM MODULE                                  │  │
│  │                                                                 │  │
│  │  ┌──────────────────┐    ┌──────────────────┐                   │  │
│  │  │   Global Vars    │    │   Type Definitions │                │  │
│  │  │                  │    │                   │                  │  │
│  │  │ @global_var      │    │ %struct.Point    │                 │  │
│  │  │ @constant_str    │    │ %Node = type {...}│                 │  │
│  │  └──────────────────┘    └──────────────────┘                   │  │
│  │                                                                 │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                      FUNCTIONS                            │  │  │
│  │  │                                                          │  │  │
│  │  │  ┌────────────────────────────────────────────────┐    │  │  │
│  │  │  │  define i32 @main() {                          │    │  │  │
│  │  │  │                                                │    │  │  │
│  │  │  │    ┌──────────────────────────────────────┐   │    │  │  │
│  │  │  │    │  BASIC BLOCKS                        │   │    │  │  │
│  │  │  │    │                                      │   │    │  │  │
│  │  │  │    │  entry:                               │   │    │  │  │
│  │  │  │    │    %result = call @factorial(i32 5) │   │    │  │  │
│  │  │  │    │    ret i32 %result                  │   │    │  │  │
│  │  │  │    │                                      │   │    │  │  │
│  │  │  │    └──────────────────────────────────────┘   │    │  │  │
│  │  │  │                                                │    │  │  │
│  │  │  │  }                                            │    │  │  │
│  │  │  └────────────────────────────────────────────────┘    │  │  │
│  │  │                                                          │  │  │
│  │  │  ┌────────────────────────────────────────────────┐    │  │  │
│  │  │  │  define i32 @factorial(i32 %n) {             │    │  │  │
│  │  │  │    entry: ...                                  │    │  │  │
│  │  │  │    then: ...                                   │    │  │  │
│  │  │  │    else: ...                                   │    │  │  │
│  │  │  │  }                                            │    │  │  │
│  │  │  └────────────────────────────────────────────────┘    │  │  │
│  │  │                                                          │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3.3 Complete IR Example

```llvm
; factorial.ll - Complete LLVM IR Module
; This module demonstrates various LLVM IR features

; ============================================================
; Global Variables
; ============================================================
@global_count = global i32 0
@.str_fmt = private constant [4 x i8] c"%d\0A\00"

; ============================================================
; Function Declarations (External)
; ============================================================
declare i32 @printf(i8* %format, ...)

; ============================================================
; Main Function
; ============================================================
define i32 @main() {
entry:
    ; Call factorial function
    %result = call i32 @factorial(i32 5)
    
    ; Print result
    %fmt_ptr = getelementptr [4 x i8], [4 x i8]* @.str_fmt, i32 0, i32 0
    %call = call i32 @printf(i8* %fmt_ptr, i32 %result)
    
    ret i32 0
}

; ============================================================
; Recursive Factorial Function
; ============================================================
define i32 @factorial(i32 %n) {
entry:
    ; Compare n <= 1
    %cmp_result = icmp sle i32 %n, 1
    
    ; Conditional branch
    br i1 %cmp_result, label %base_case, label %recursive_case

base_case:
    ; Return 1 for base case
    ret i32 1

recursive_case:
    ; Calculate n - 1
    %n_minus_1 = sub i32 %n, 1
    
    ; Recursive call
    %recursive_result = call i32 @factorial(i32 %n_minus_1)
    
    ; Multiply n * factorial(n-1)
    %final_result = mul i32 %n, %recursive_result
    
    ret i32 %final_result
}

; ============================================================
; Iterative Factorial (Alternative Implementation)
; ============================================================
define i32 @factorial_iter(i32 %n) {
entry:
    ; Initialize accumulator
    %acc = alloca i32
    store i32 1, i32* %acc
    
    ; Initialize counter
    %counter = alloca i32
    store i32 %n, i32* %counter
    
    br label %loop_header

loop_header:
    ; Load counter
    %current = load i32, i32* %counter
    
    ; Check if counter > 0
    %continue = icmp sgt i32 %current, 0
    br i1 %continue, label %loop_body, label %loop_exit

loop_body:
    ; Multiply accumulator by counter
    %acc_val = load i32, i32* %acc
    %new_acc = mul i32 %acc_val, %current
    store i32 %new_acc, i32* %acc
    
    ; Decrement counter
    %new_counter = sub i32 %current, 1
    store i32 %new_counter, i32* %counter
    
    br label %loop_header

loop_exit:
    ; Load final result
    %result = load i32, i32* %acc
    ret i32 %result
}
```

### 2.3.4 LLVM IR Type System

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM IR TYPE HIERARCHY                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                            TYPE                                        │
│                              │                                          │
│              ┌───────────────┼───────────────┐                        │
│              │               │               │                          │
│           Primitive      Aggregate         Function                      │
│              │               │               │                          │
│     ┌────┬────┼────┐    ┌────┴────┐    ┌────┴────┐                   │
│     │    │    │    │    │        │    │         │                    │
│     ▼    ▼    ▼    ▼    ▼        ▼    ▼         ▼                    │
│   void  i1  i8  i32 i64    Array  Struct  Vector   (Ret) (Args)       │
│         f32 f64        [N x T] {T1,T2}  <N x T>                      │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│  PRIMITIVE TYPES:                                                     │
│  ┌──────────┬─────────────────────────────────────────────────────┐    │
│  │  Type   │  Description                                         │    │
│  ├──────────┼─────────────────────────────────────────────────────┤    │
│  │  i1     │  1-bit integer (boolean)                             │    │
│  │  i8     │  8-bit integer (byte)                               │    │
│  │  i16    │  16-bit integer (half word)                         │    │
│  │  i32    │  32-bit integer (word)                              │    │
│  │  i64    │  64-bit integer (double word)                       │    │
│  │  float  │  32-bit IEEE 754 single precision                    │    │
│  │  double │  64-bit IEEE 754 double precision                    │    │
│  │  void   │  No return type                                     │    │
│  └──────────┴─────────────────────────────────────────────────────┘    │
│                                                                        │
│  AGGREGATE TYPES:                                                     │
│  ┌──────────┬─────────────────────────────────────────────────────┐    │
│  │  Type   │  Example                                            │    │
│  ├──────────┼─────────────────────────────────────────────────────┤    │
│  │  Array  │  [10 x i32]        - 10-element i32 array          │    │
│  │  Struct │  {i32, float}     - Struct with i32 and float     │    │
│  │  Vector │  <4 x float>      - 4-element SIMD vector         │    │
│  └──────────┴─────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3.5 Key LLVM IR Instructions

#### Arithmetic Instructions

```llvm
; Integer Arithmetic
%sum = add i32 %a, %b           ; Addition: a + b
%dif = sub i32 %a, %b           ; Subtraction: a - b
%prod = mul i32 %a, %b          ; Multiplication: a * b
%quot = sdiv i32 %a, %b         ; Signed division: a / b
%rem = srem i32 %a, %b          ; Signed remainder: a % b

; Floating-Point Arithmetic
%fadd = fadd float %x, %y      ; FP addition
%fmul = fmul float %x, %y      ; FP multiplication
%fdiv = fdiv float %x, %y      ; FP division
%frem = frem float %x, %y      ; FP remainder
```

#### Comparison Instructions

```llvm
; Integer Comparisons
%eq = icmp eq i32 %a, %b        ; Equal (==)
%ne = icmp ne i32 %a, %b        ; Not equal (!=)
%ugt = icmp ugt i32 %a, %b      ; Unsigned greater than
%slt = icmp slt i32 %a, %b      ; Signed less than
%uge = icmp uge i32 %a, %b      ; Unsigned greater or equal

; Floating-Point Comparisons
%foeq = fcmp oeq float %x, %y  ; Ordered equal
%fogt = fcmp ogt float %x, %y  ; Ordered greater than
%funo = fcmp uno float %x, %y   ; Unordered (NaN-aware)
```

#### Memory Instructions

```llvm
; Stack Allocation
%ptr = alloca i32                ; Allocate one i32 on stack
%arr = alloca i32, i32 10       ; Allocate array of 10 i32s

; Load and Store
%val = load i32, i32* %ptr      ; Load from memory
store i32 %val, i32* %ptr       ; Store to memory

; Pointer Arithmetic
%gep = getelementptr i32, i32* %ptr, i32 5
; First index selects element, subsequent indices select fields
```

#### Control Flow Instructions

```llvm
; Unconditional Branch
br label %destination

; Conditional Branch
%cmp = icmp ne i32 %a, 0
br i1 %cmp, label %then, label %else

; Function Call
%result = call i32 @function(i32 %arg1, i32 %arg2)

; Return
ret i32 %value
ret void
```

---

## 2.4 LLVM Toolchain

LLVM provides a comprehensive suite of command-line tools for compilation, optimization, and analysis.

### 2.4.1 Essential Tools Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM TOOLCHAIN                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   SOURCE CODE                                                         │
│   (.c, .cpp)                                                         │
│        │                                                               │
│        ▼                                                               │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│   │  clang  │───►│ llvm-as │───►│   opt   │───►│   llc   │           │
│   │         │    │         │    │         │    │         │           │
│   │  .ll    │    │   .bc   │    │  .bc    │    │   .s    │           │
│   │  (text) │    │ (binary)│    │(opt)    │    │(asm)    │           │
│   └─────────┘    └─────────┘    └─────────┘    └────┬────┘           │
│                                                       │               │
│                                                       ▼               │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│   │ llvm-dis│◄───│llvm-link│◄───│llvm-extract│◄──│   ld    │           │
│   │         │    │         │    │         │    │         │           │
│   │  .ll   │    │  .bc    │    │  .bc    │    │ Executable│          │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.4.2 Tool Reference

| Tool | Purpose | Key Options |
|------|---------|-------------|
| `clang` | C/C++ compiler frontend | `-c`, `-S`, `-emit-llvm`, `-O2`, `-Wall` |
| `llvm-as` | Assemble .ll to .bc | `-o` (output file) |
| `llvm-dis` | Disassemble .bc to .ll | `-o` (output file) |
| `llc` | Compile IR to assembly | `-O2`, `-march=x86_64`, `-filetype=obj` |
| `opt` | Run optimization passes | `-O2`, `-passes=gvn`, `-stats` |
| `llvm-link` | Link multiple .bc files | `-o` (output file) |
| `lli` | Execute IR directly | `-force-interpreter` |
| `llvm-config` | Get LLVM build information | `--cxxflags`, `--ldflags`, `--libs` |

### 2.4.3 Practical Tool Usage Examples

#### Compiling C to LLVM IR

```bash
# Basic compilation to assembly
clang -S -o hello.s hello.c

# Generate LLVM IR (text format)
clang -S -emit-llvm -O2 hello.c -o hello.ll

# Generate LLVM bitcode (binary format)
clang -c -emit-llvm -O2 hello.c -o hello.bc

# View IR with LLVM's pretty printer
cat hello.ll

# Or use llvm-dis for formatted output
llvm-dis < hello.bc | head -50
```

#### Optimization Pipeline

```bash
# Run specific optimization passes
opt -S -passes=instcombine hello.ll -o hello_opt1.ll
opt -S -passes=gvn hello.ll -o hello_opt2.ll

# Run standard optimization (equivalent to -O2)
opt -S -O2 hello.ll -o hello_opt.ll

# Combine multiple passes
opt -S -passes='instcombine,gvn,dce' hello.ll -o hello_opt.ll

# View available passes
opt --help | grep -A2 'Passes:'

# Analyze optimization impact
opt -S -stats hello.ll 2>&1 | head -30
```

#### Code Generation

```bash
# Compile IR to x86-64 assembly
llc -O2 hello.ll -o hello.s

# Compile for ARM64
llc -O2 -march=aarch64 hello.ll -o hello_arm.s

# Compile for RISC-V
llc -O2 -march=riscv64 hello.ll -o hello_riscv.s

# Compile to object file directly
llc -O2 -filetype=obj hello.ll -o hello.o
```

#### Linking and Execution

```bash
# Assemble and link
clang hello.s -o hello

# Link multiple object files
clang main.o helper.o -o program

# Link with libraries
clang main.o -lm -lpthread -o program

# Execute
./hello

# Execute IR directly (interpreter)
lli hello.bc
```

### 2.4.4 Analysis and Debugging Tools

```bash
# View Control Flow Graph
opt -dot-cfg hello.bc
# Generates cfg.main.dot

# View Call Graph
opt -dot-callgraph hello.bc
# Generates callgraph.dot

# Print module info
opt -print-module-name hello.bc

# Count instructions by type
opt -stats hello.bc 2>&1 | grep -E "instcount|basicblock"

# Time pass execution
opt -time-passes -O2 hello.ll -o /dev/null
```

---

## 2.5 LLVM C++ API

The LLVM C++ API provides a powerful interface for building compiler tools.

### 2.5.1 Core Classes Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM C++ CLASS HIERARCHY                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                           Value                                         │
│                             │                                          │
│              ┌──────────────┼──────────────┐                          │
│              │              │              │                           │
│           User          Argument       BasicBlock                       │
│              │                                                       │
│         ┌───┼───┐                                                     │
│         │   │   │                                                     │
│      Instruction  Function                                      │
│         │                                                           │
│    ┌────┴────┐                                                      │
│    │         │                                                       │
│   CallInst  BinaryOperator                                           │
│                  │                                                    │
│             ┌────┴────┐                                              │
│             │         │                                               │
│          AddInst   SubInst                                            │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│                         Type                                            │
│                           │                                            │
│            ┌──────────────┼──────────────┐                           │
│            │              │              │                             │
│       IntegerType    FunctionType    PointerType                       │
│            │                                                       │
│      ┌─────┴─────┐                                                   │
│      │           │                                                    │
│    i8Type    i32Type                                                 │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│                        Module                                           │
│                           │                                            │
│              ┌───────────┼───────────┐                               │
│              │           │           │                                │
│          Functions   GlobalVars   TypeTab                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.5.2 Complete IR Generation Example

```cpp
// factorial_ir.cpp
// Demonstrates LLVM C++ API for generating LLVM IR

#include <llvm/IR/LLVMContext.h>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>
#include <llvm/IR/Verifier.h>
#include <llvm/IR/LegacyPassManager.h>
#include <llvm/IR/Instructions.h>
#include <llvm/Support/raw_ostream.h>

#include <iostream>
#include <memory>

using namespace llvm;

// ============================================================================
// HELPER: Create a function in the module
// ============================================================================
Function* createFactorialFunction(Module* module, LLVMContext& context, 
                                   IRBuilder<>& builder) {
    
    // Create function type: i32 (i32)
    std::vector<Type*> paramTypes(1, builder.getInt32Ty());
    FunctionType* factorialType = FunctionType::get(
        builder.getInt32Ty(),  // Return type
        paramTypes,             // Parameter types
        false                   // Not variadic
    );
    
    // Create the function
    Function* factorialFunc = Function::Create(
        factorialType,
        Function::ExternalLinkage,
        "factorial",
        module
    );
    
    // Name the function argument
    Argument* nArg = &factorialFunc->arg_begin();
    nArg->setName("n");
    
    // ============================================================
    // Create basic blocks
    // ============================================================
    BasicBlock* entryBlock = BasicBlock::Create(context, "entry", factorialFunc);
    BasicBlock* condBlock = BasicBlock::Create(context, "cond", factorialFunc);
    BasicBlock* baseBlock = BasicBlock::Create(context, "base_case", factorialFunc);
    BasicBlock* recBlock = BasicBlock::Create(context, "recursive_case", factorialFunc);
    
    // ============================================================
    // entry block: Compare n <= 1
    // ============================================================
    builder.SetInsertPoint(entryBlock);
    
    // Create comparison: n <= 1
    Value* isBaseCase = builder.CreateICmpSLE(
        nArg, 
        builder.getInt32(1), 
        "cmp_n_le_1"
    );
    
    // Branch to either base case or recursive case
    builder.CreateCondBr(isBaseCase, baseBlock, recBlock);
    
    // ============================================================
    // base_case block: Return 1
    // ============================================================
    builder.SetInsertPoint(baseBlock);
    builder.CreateRet(builder.getInt32(1));
    
    // ============================================================
    // recursive_case block: Return n * factorial(n - 1)
    // ============================================================
    builder.SetInsertPoint(recBlock);
    
    // Calculate n - 1
    Value* nMinus1 = builder.CreateSub(
        nArg, 
        builder.getInt32(1), 
        "n_minus_1"
    );
    
    // Recursive call
    Value* recursiveResult = builder.CreateCall(
        factorialFunc, 
        nMinus1, 
        "factorial_rec"
    );
    
    // Multiply n * factorial(n - 1)
    Value* result = builder.CreateMul(
        nArg, 
        recursiveResult, 
        "result"
    );
    
    builder.CreateRet(result);
    
    // ============================================================
    // Verify the function
    // ============================================================
    if (verifyFunction(*factorialFunc, &errs())) {
        std::cerr << "Function verification failed!\n";
        return nullptr;
    }
    
    return factorialFunc;
}

// ============================================================================
// HELPER: Create main function
// ============================================================================
Function* createMainFunction(Module* module, LLVMContext& context,
                              IRBuilder<>& builder, Function* factorialFunc) {
    
    // Create function type: i32 ()
    FunctionType* mainType = FunctionType::get(builder.getInt32Ty(), false);
    
    Function* mainFunc = Function::Create(
        mainType,
        Function::ExternalLinkage,
        "main",
        module
    );
    
    // Create entry block
    BasicBlock* entry = BasicBlock::Create(context, "entry", mainFunc);
    builder.SetInsertPoint(entry);
    
    // Call factorial(5)
    Value* arg = builder.getInt32(5);
    Value* result = builder.CreateCall(factorialFunc, arg, "fact_result");
    
    // Print the result (simplified - just return it)
    builder.CreateRet(result);
    
    // Verify
    if (verifyFunction(*mainFunc, &errs())) {
        std::cerr << "Main function verification failed!\n";
        return nullptr;
    }
    
    return mainFunc;
}

// ============================================================================
// MAIN: Generate LLVM IR for factorial
// ============================================================================
int main() {
    // Create LLVM context, module, and builder
    LLVMContext context;
    Module* module = new Module("factorial_module", context);
    IRBuilder<> builder(context);
    
    // Set the data layout and target triple (optional but helpful)
    module->setDataLayout("e-m:e-i64:64-f80:128-n8:16:32:64-S128");
    module->setTargetTriple("x86_64-pc-linux-gnu");
    
    // Create the factorial function
    Function* factorialFunc = createFactorialFunction(module, context, builder);
    
    if (!factorialFunc) {
        std::cerr << "Failed to create factorial function\n";
        return 1;
    }
    
    // Create main function
    Function* mainFunc = createMainFunction(module, context, builder, factorialFunc);
    
    if (!mainFunc) {
        std::cerr << "Failed to create main function\n";
        return 1;
    }
    
    // Verify the entire module
    if (verifyModule(*module, &errs())) {
        std::cerr << "Module verification failed!\n";
        return 1;
    }
    
    // Print the generated IR
    std::cout << "Generated LLVM IR:\n";
    std::cout << "========================================\n";
    module->print(outs(), nullptr);
    std::cout << "========================================\n";
    
    // Clean up
    delete module;
    
    return 0;
}
```

### 2.5.3 Building and Running

```bash
# Compile the IR generator
clang++ -std=c++17 -O2 factorial_ir.cpp \
    `llvm-config --cxxflags --ldflags --system-libs --libs core` \
    -o factorial_ir

# Run it to generate IR
./factorial_ir

# The output will be:
# Generated LLVM IR:
# ========================================
# ; ModuleID = 'factorial_module'
# source_filename = "factorial_module"
# 
# define i32 @factorial(i32 %n) {
# entry:
#   %cmp_n_le_1 = icmp sle i32 %n, 1
#   br i1 %cmp_n_le_1, label %base_case, label %recursive_case
# 
# base_case:                                       ; preds = %entry
#   ret i32 1
# 
# recursive_case:                                  ; preds = %entry
#   %n_minus_1 = sub i32 %n, 1
#   %factorial_rec = call i32 @factorial(i32 %n_minus_1)
#   %result = mul i32 %n, %factorial_rec
#   ret i32 %result
# }
# 
# define i32 @main() {
# entry:
#   %fact_result = call i32 @factorial(i32 5)
#   ret i32 %fact_result
# }
# ========================================
```

---

## 2.6 LLVM Pass Infrastructure

LLVM's optimizer is built on a pass-based architecture where each pass performs a specific analysis or transformation.

### 2.6.1 Pass Types

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM PASS CATEGORIES                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                     ANALYSIS PASSES                          │     │
│  │                                                              │     │
│  │   • Compute information without modifying IR                 │     │
│  │   • Results can be cached and reused                         │     │
│  │   • Other passes can query the analysis                     │     │
│  │                                                              │     │
│  │   Examples:                                                  │     │
│  │   • DominatorTree - Control flow dominance                   │     │
│  │   • PostDominatorTree - Post-domination                     │     │
│  │   • LoopInfo - Loop structure analysis                       │     │
│  │   • ScalarEvolution - Loop trip count analysis               │     │
│  │   • AliasAnalysis - Memory aliasing information              │     │
│  │   • CallGraph - Function call relationships                  │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                              │                                          │
│                              ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                  TRANSFORMATION PASSES                       │     │
│  │                                                              │     │
│  │   • Modify the IR to improve it                             │     │
│  │   • Typically invalidate analyses they modify                │     │
│  │   • May run multiple times (iteratively)                    │     │
│  │                                                              │     │
│  │   Examples:                                                  │     │
│  │   • InstCombine - Instruction combining/simplifying          │     │
│  │   • DCE - Dead code elimination                            │     │
│  │   • GVN - Global value numbering (common subexpressions)    │     │
│  │   • InlineFunction - Function inlining                       │     │
│  │   • LoopUnroll - Loop unrolling                             │     │
│  │   • Vectorize - SIMD vectorization                          │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.6.2 Pass Pipeline

```bash
# Default optimization pipeline (-O2)
opt -O2 input.ll -o output.ll

# Custom pass pipeline
opt -S -passes='default<O2>' input.ll -o output.ll

# Explicit pass sequence
opt -S -passes='mem2reg,instcombine,gvn,dce,simplifycfg' input.ll -o output.ll

# Analysis + Transform
opt -S -passes='aa-pipeline,dce' input.ll -o output.ll

# Loop optimization pipeline
opt -S -passes='loop-rotate,loop-unroll,loop-distribute' input.ll -o output.ll
```

### 2.6.3 Pass Dependencies

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PASS DEPENDENCIES                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Pass Execution Order:                                                 │
│                                                                        │
│      ┌─────────────────────────────────────────────────────────┐        │
│      │                                                         │        │
│      │    Pass A (Analysis)                                   │        │
│      │         │                                               │        │
│      │         │ Provides: DominatorTree                      │        │
│      │         │                                               │        │
│      │         ▼                                               │        │
│      │    Pass B (Analysis)                                   │        │
│      │         │                                               │        │
│      │         │ Uses: DominatorTree                          │        │
│      │         │ Provides: LoopInfo                           │        │
│      │         │                                               │        │
│      │         ▼                                               │        │
│      │    Pass C (Transform)                                  │        │
│      │         │                                               │        │
│      │         │ Uses: DominatorTree, LoopInfo                │        │
│      │         │ Invalidates: DominatorTree, LoopInfo        │        │
│      │         │                                               │        │
│      │         ▼                                               │        │
│      │    Pass A' (Re-run analysis)                          │        │
│      │                                                         │        │
│      └─────────────────────────────────────────────────────────┘        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2.7 Target Description System

LLVM's target-independent code generator uses a declarative description system.

### 2.7.1 Supported Targets

| Architecture | Targets | Applications |
|--------------|---------|--------------|
| **x86** | x86, x86-64 | PCs, servers |
| **ARM** | ARM, AArch64 | Mobile, embedded |
| **MIPS** | MIPS, MIPS64 | Routers, embedded |
| **RISC-V** | RISC-V (32/64) | Research, embedded |
| **PowerPC** | PPC, PPC64 | Servers, supercomputers |
| **WebAssembly** | wasm32, wasm64 | Web browsers |
| **Hexagon** | Hexagon | DSPs |

### 2.7.2 Cross-Compilation

```bash
# Compile for ARM64 (Linux)
clang --target=aarch64-linux-gnu -o hello_arm hello.c

# Compile for ARM64 (Apple Silicon)
clang --target=arm64-apple-darwin -o hello_arm hello.c

# Compile for RISC-V
clang --target=riscv64-unknown-elf -o hello_riscv hello.c

# Compile for WebAssembly
clang --target=wasm32 -o hello.wasm hello.c

# Compile for x86-64 (Windows cross from Linux)
x86_64-w64-mingw32-clang -o hello.exe hello.c
```

---

## 2.8 Clang: The C Language Frontend

Clang is LLVM's native C/C++/Objective-C frontend, known for excellent diagnostics and modularity.

### 2.8.1 Clang Compilation Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CLANG COMPILATION FLOW                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  SOURCE CODE                                                          │
│      │                                                                │
│      ▼                                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │ Prepro│─►│ Lexer  │─►│ Parser │─►│ AST    │─►│CodeGen│          │
│  │  cess │  │        │  │        │  │ Build  │  │       │          │
│  │       │  │Tokens  │  │ Parse  │  │        │  │LLVM IR│          │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘          │
│                                                            │           │
│                                                            ▼           │
│                                                         ┌────────┐    │
│                                                         │ LLVM   │    │
│                                                         │ Opt    │    │
│                                                         └────────┘    │
│                                                            │           │
│                                                            ▼           │
│                                                         ┌────────┐    │
│                                                         │  LLC   │    │
│                                                         │  (CG)  │    │
│                                                         └────────┘    │
│                                                            │           │
│                                                            ▼           │
│                                                        ASSEMBLY       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.8.2 Clang Diagnostic Features

```bash
# Enable all warnings
clang -Wall -Wextra -Wpedantic -c hello.c

# Treat warnings as errors
clang -Werror -c hello.c

# Show expanded macros
clang -E -dM hello.c

# Dump AST
clang -Xclang -ast-dump -fsyntax-only hello.c

# Dump CFG (requires compilation)
clang -Xclang -cfg-dump -fsyntax-only hello.c
```

---

## 2.9 Setting Up Your Environment

### 2.9.1 Installation

#### Ubuntu/Debian

```bash
# Install LLVM and Clang
sudo apt-get update
sudo apt-get install llvm llvm-dev clang lld

# Verify installation
llvm-config --version
clang --version
```

#### macOS

```bash
# Using Homebrew
brew install llvm

# Add to PATH (add to ~/.zshrc)
echo 'export PATH="/usr/local/opt/llvm/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Windows

```powershell
# Download from https://releases.llvm.org/
# Or use Chocolatey
choco install llvm
```

### 2.9.2 Verify Installation

```bash
# Check versions
llvm-config --version
clang --version
llc --version
opt --version

# Check available targets
llc --version | grep "Registered Targets"
```

### 2.9.3 Building with LLVM

```bash
# Get compiler flags
llvm-config --cxxflags
# Output: -I/usr/lib/llvm-14/include -std=c++14 -fPIC ...

# Get linker flags
llvm-config --ldflags
# Output: -L/usr/lib/llvm-14/lib -Wl,-rpath,/usr/lib/llvm-14/lib

# Get required libraries
llvm-config --libs core analysis native
```

**Complete compilation command:**

```bash
clang++ -std=c++17 -O2 myprogram.cpp \
    `llvm-config --cxxflags --ldflags --system-libs --libs core native` \
    -o myprogram
```

---

## 2.10 Summary

### Key Takeaways

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CHAPTER 2 KEY POINTS                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✅ LLVM provides a modular, reusable compiler infrastructure          │
│                                                                        │
│  ✅ LLVM IR is the typed, SSA-based intermediate representation       │
│                                                                        │
│  ✅ LLVM separates frontend (language-specific) from backend           │
│     (target-specific) via IR                                           │
│                                                                        │
│  ✅ LLVM toolchain includes clang, llc, opt, llvm-as/dis              │
│                                                                        │
│  ✅ The C++ API enables programmatic IR generation and transformation  │
│                                                                        │
│  ✅ LLVM's pass system provides extensible optimization               │
│                                                                        │
│  ✅ Clang provides production-quality C/C++ compilation               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Learning Checklist

- [ ] I understand LLVM's modular architecture
- [ ] I can read and write LLVM IR
- [ ] I can use LLVM command-line tools (clang, llc, opt)
- [ ] I can generate LLVM IR using the C++ API
- [ ] I understand the pass-based optimization system
- [ ] I can cross-compile for different architectures

---

## 2.11 Exercises

### Exercise 2.1: LLVM IR Exploration ⭐⭐

**Objective:** Analyze LLVM IR at different optimization levels

**Task:** 
1. Write a C function with optimization opportunities
2. Compile with `-O0`, `-O1`, `-O2`, `-O3`
3. Compare the generated IR using `clang -S -emit-llvm`
4. Document all differences you observe

**Deliverable:** A comparison report with screenshots of IR differences.

---

### Exercise 2.2: Manual IR Writing ⭐⭐

**Objective:** Write LLVM IR directly

**Task:** Write the following functions directly in LLVM IR:

1. GCD function using Euclidean algorithm
2. Array sum function
3. Recursive Fibonacci

Compile and run using `llc`.

---

### Exercise 2.3: IR Generation API ⭐⭐⭐

**Objective:** Generate IR programmatically

**Task:** Write a C++ program that generates LLVM IR for:
1. A function that computes `a * b + c`
2. A loop that sums numbers from 1 to n
3. A recursive function of your choice

---

### Exercise 2.4: Optimization Pipeline ⭐⭐

**Objective:** Explore optimization passes

**Task:** 
1. Write a function with dead code, common subexpressions, and loop-invariant code
2. Run individual optimization passes using `opt`
3. Analyze the impact of each pass using `--stats`

---

### Exercise 2.5: Cross-Compilation ⭐⭐

**Objective:** Compile for multiple targets

**Task:** 
1. Install a cross-compilation toolchain (ARM or RISC-V)
2. Cross-compile a "Hello World" program
3. If possible, run on hardware or emulator

---

### Exercise 2.6: Clang Diagnostics ⭐

**Objective:** Analyze compiler diagnostics

**Task:** 
1. Write C code with various bugs (type mismatches, undefined variables)
2. Compare error messages between GCC and Clang
3. Evaluate which provides more helpful diagnostics

---

### Exercise 2.7: Clang Static Analysis ⭐⭐

**Objective:** Use Clang's static analyzer

**Task:** 
1. Write a program with memory leaks, null dereferences, or buffer overflows
2. Run the Clang static analyzer: `scan-build clang -c program.c`
3. Interpret the results

---

**[Next Chapter: 第三章_詞法分析與語法分析.md](第三章_詞法分析與語法分析.md)**

---

## Further Reading

| Resource | Description |
|----------|-------------|
| [LLVM Language Reference](https://llvm.org/docs/LangRef.html) | Complete IR specification |
| [LLVM Programmer's Manual](https://llvm.org/docs/ProgrammersManual.html) | C++ API guide |
| [Kaleidoscope Tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/) | Building a language with LLVM |

*Chapter 2 Complete*
