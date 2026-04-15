# 第二章：LLVM 架構基礎 (LLVM Architecture Basics)

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

## 2.1 Introduction to LLVM

LLVM (Low Level Virtual Machine) is an open-source compiler infrastructure project that provides a modular, reusable set of libraries for building compilers. Originally created by Vikram Adve and Chris Lattner at the University of Illinois in 2000, LLVM has evolved into one of the most influential compiler frameworks in modern software development.

### 2.1.1 Why LLVM?

LLVM addresses several limitations of traditional compiler architectures:

| Feature | Traditional Compilers | LLVM |
|---------|---------------------|------|
| **Language Support** | Single language | Multiple frontends |
| **Target Platforms** | Fixed targets | Extensible targets |
| **Optimization** | Limited passes | Sophisticated optimizer |
| **Modularity** | Monolithic design | Library-based design |
| **License** | Often proprietary | Apache 2.0 (permissive) |

### 2.1.2 LLVM in Production

Major projects using LLVM include:

- **Clang**: C/C++/Objective-C compiler
- **Swift**: Apple's modern programming language
- **Rust**: Memory-safe systems programming language
- **Julia**: High-performance technical computing
- **Flutter**: Google's cross-platform UI framework
- **PyTorch**: ML framework (via TorchScript)
- **WebAssembly**: Compilation target for web

## 2.2 LLVM's Modular Architecture

LLVM's design philosophy centers on **separation of concerns**. The system is composed of distinct libraries, each handling a specific aspect of compilation.

```
┌────────────────────────────────────────────────────────────────────┐
│                         LLVM Architecture                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐ │
│  │   Clang      │    │   Swift      │    │   Other Frontends    │ │
│  │   (C/C++/Obj)│    │   Compiler   │    │   (Rust, Julia, etc) │ │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘ │
│         │                   │                       │             │
│         └───────────────────┼───────────────────────┘             │
│                             ▼                                       │
│                   ┌──────────────────┐                              │
│                   │    LLVM IR       │                              │
│                   │  (Intermediate   │                              │
│                   │  Representation) │                              │
│                   └────────┬─────────┘                              │
│                            │                                        │
│                            ▼                                        │
│                   ┌──────────────────┐                              │
│                   │   Optimizer      │                              │
│                   │   (opt / llc)    │                              │
│                   │                  │                              │
│                   │  - PassManager   │                              │
│                   │  - Transforms   │                              │
│                   │  - Analyses     │                              │
│                   └────────┬─────────┘                              │
│                            │                                        │
│                            ▼                                        │
│  ┌────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │    x86     │    │      ARM        │    │      RISC-V        │  │
│  │   Target   │    │    Target       │    │      Target        │  │
│  └────────────┘    └──────────────────┘    └────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2.1 Core Components

| Component | Description |
|-----------|-------------|
| **LLVM IR** | The intermediate representation - language and machine independent |
| **LLVM Core** | Basic data types, smart pointers, utility classes |
| **CodedGen** | Target-independent code generator |
| **Target** | Architecture-specific code (x86, ARM, RISC-V, etc.) |
| **PassManager** | Orchestrates optimization and analysis passes |
| **Linker** | Combines multiple IR modules |

## 2.3 LLVM IR: The Heart of LLVM

LLVM IR is a typed, RISC-like instruction set that serves as the common representation between frontend and backend.

### 2.3.1 IR Characteristics

- **Strongly typed**: Every value has a defined type
- **Three-address code**: Each instruction has at most three operands
- **Unlimited virtual registers**: Infinite registers for optimization
- **Static single assignment (SSA)**: Each variable assigned exactly once
- **Phi nodes**: Handle control flow merges in SSA form

### 2.3.2 IR Syntax

LLVM IR can be written in human-readable text format (`.ll` files) or binary bitcode (`.bc` files).

**Example LLVM IR:**

```llvm
; Simple function in LLVM IR
; File: hello.ll
;
; This function calculates the factorial of n

define i32 @factorial(i32 %n) {
entry:
  %cmp = icmp sle i32 %n, 0
  br i1 %cmp, label %return, label %recurse

return:
  ret i32 1

recurse:
  %dec = sub i32 %n, 1
  %call = call i32 @factorial(i32 %dec)
  %result = mul i32 %n, %call
  ret i32 %result
}

define i32 @main() {
entry:
  %result = call i32 @factorial(i32 5)
  ret i32 %result
}
```

### 2.3.3 Basic Types

| Type | Description | Example |
|------|-------------|---------|
| `i1` | 1-bit integer | Boolean |
| `i8` | 8-bit integer | Byte/char |
| `i32` | 32-bit integer | Standard int |
| `i64` | 64-bit integer | Long |
| `float` | 32-bit float | Single precision |
| `double` | 64-bit float | Double precision |
| `void` | No return type | Functions returning nothing |
| `[N x T]` | Array of N elements of type T | `[10 x i32]` |
| `<N x T>` | Vector of N elements | `<4 x float>` |

### 2.3.4 Global Variables and Functions

```llvm
; Global variable
@global_var = global i32 42

; Constant
@constant_str = constant [13 x i8] c"Hello World\00"

; Function declaration
declare i32 @printf(i8* %format, ...)

; Function definition with attributes
define i32 @add(i32 %a, i32 %b) #0 {
  %result = add i32 %a, %b
  ret i32 %result
}

attributes #0 = { nounwind "frame-pointer"="none" }
```

## 2.4 LLVM Toolchain

LLVM provides a rich set of command-line tools for compilation and analysis.

### 2.4.1 Essential Tools

| Tool | Purpose |
|------|---------|
| `clang` | C/C++/Objective-C compiler frontend |
| `clang++` | C++ compiler frontend |
| `llvm-as` | Assemble .ll to .bc |
| `llvm-dis` | Disassemble .bc to .ll |
| `llc` | Compile IR to target assembly |
| `lli` | Execute IR directly (interpreter) |
| `opt` | Run optimization passes |
| `llvm-link` | Link multiple .bc files |
| `llvm-mc` | Machine code assembler/disassembler |

### 2.4.2 Practical Tool Usage

**Compiling C to LLVM IR:**

```bash
# Generate LLVM IR from C source
clang -S -emit-llvm -O2 hello.c -o hello.ll

# Generate optimized IR with more detail
clang -S -emit-llvm -O2 -flto -fdebug-pass=Arguments hello.c -o hello.ll
```

**Viewing Generated IR:**

```bash
# Simple viewing
cat hello.ll

# With LLVM's IR printer (better formatting)
llvm-as < hello.ll | llvm-dis -o -
```

**Compiling IR to Assembly:**

```bash
# Compile for your native architecture
llc -O2 hello.ll -o hello.s

# Compile for specific target
llc -O2 -march=arm64 hello.ll -o hello_arm.s

# Compile for RISC-V
llc -O2 -march=riscv64 hello.ll -o hello_riscv.s
```

**Running Optimization Passes:**

```bash
# Run specific pass
opt -S -passes=instcombine hello.ll -o hello_opt.ll

# Run default optimization pipeline (equivalent to -O2)
opt -S -O2 hello.ll -o hello_opt.ll

# Run all analysis and transformation passes
opt -S -debug-pass=Arguments hello.ll

# List available passes
opt --help
```

### 2.4.3 Clang Compilation Pipeline

```bash
# Full compilation with verbose output
clang -v -c hello.c -o hello.o

# Show preprocessed output
clang -E hello.c -o hello.i

# Show AST dump
clang -Xclang -ast-dump -fsyntax-only hello.c

# Show memory SSA (requires -O1 or higher)
clang -O1 -S -debug-pass=Structure hello.c
```

## 2.5 LLVM C++ API Overview

LLVM provides extensive C++ APIs for building compiler tools. The core classes you'll work with are:

### 2.5.1 Core Classes

| Class | Purpose |
|-------|---------|
| `LLVMContext` | Owns the global state (types, constants, etc.) |
| `Module` | Contains a translation unit's IR |
| `IRBuilder<>` | Convenience class for building instructions |
| `Value` | Base class for all IR values |
| `Type` | Represents LLVM types |
| `Function` | Represents a function in IR |
| `BasicBlock` | A sequence of instructions with single entry/exit |

### 2.5.2 Minimal LLVM IR Generation Example

```cpp
// hello_world.cpp - Minimal LLVM IR generation
#include <llvm/IR/LLVMContext.h>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>
#include <llvm/IR/Verifier.h>
#include <llvm/Support/raw_ostream.h>

using namespace llvm;

int main() {
    // Create LLVM context and module
    LLVMContext context;
    Module *module = new Module("hello_world.ll", context);
    IRBuilder<> builder(context);
    
    // Create function type: i32 ()
    FunctionType *funcType = FunctionType::get(builder.getInt32Ty(), false);
    
    // Create main function
    Function *mainFunc = Function::Create(
        funcType, 
        Function::ExternalLinkage, 
        "main", 
        module
    );
    
    // Create entry basic block
    BasicBlock *entry = BasicBlock::Create(context, "entry", mainFunc);
    builder.SetInsertPoint(entry);
    
    // Create: ret i32 0
    builder.CreateRet(builder.getInt32(0));
    
    // Verify the module
    if (verifyFunction(*mainFunc, &errs())) {
        errs() << "Function verification failed!\n";
        return 1;
    }
    
    // Print the module to stdout
    module->print(outs(), nullptr);
    
    // Clean up
    delete module;
    return 0;
}
```

**Compile and run:**

```bash
clang++ -std=c++17 hello_world.cpp `llvm-config --cxxflags --ldflags --system-libs --libs core` -o hello_world
./hello_world
```

**Output:**

```llvm
; ModuleID = 'hello_world.ll'
source_filename = "hello_world.ll"

define i32 @main() {
entry:
  ret i32 0
}
```

### 2.5.3 Building a More Complex Function

```cpp
// factorial.cpp - Generate factorial function in LLVM IR
#include <llvm/IR/LLVMContext.h>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>
#include <llvm/IR/Verifier.h>
#include <llvm/Support/raw_ostream.h>

using namespace llvm;

Function* createFactorialFunction(Module *module, IRBuilder<> &builder) {
    // Function type: i32 (i32)
    std::vector<Type*> argTypes(1, builder.getInt32Ty());
    FunctionType *funcType = FunctionType::get(builder.getInt32Ty(), argTypes, false);
    
    // Create factorial function
    Function *factorial = Function::Create(
        funcType,
        Function::ExternalLinkage,
        "factorial",
        module
    );
    
    // Name the argument
    BasicBlock *entry = BasicBlock::Create(module->getContext(), "entry", factorial);
    builder.SetInsertPoint(entry);
    
    // Get function argument
    Argument *n = &factorial->arg_begin();
    n->setName("n");
    
    // Create basic blocks
    BasicBlock *condBlock = BasicBlock::Create(module->getContext(), "cond", factorial);
    BasicBlock *thenBlock = BasicBlock::Create(module->getContext(), "then", factorial);
    BasicBlock *elseBlock = BasicBlock::Create(module->getContext(), "else", factorial);
    
    // entry: compare n <= 0
    Value *cond = builder.CreateICmpSLE(n, builder.getInt32(0), "cmp");
    builder.CreateBr(condBlock);
    
    // cond: branch based on condition
    builder.SetInsertPoint(condBlock);
    builder.CreateCondBr(cond, thenBlock, elseBlock);
    
    // then: return 1
    builder.SetInsertPoint(thenBlock);
    builder.CreateRet(builder.getInt32(1));
    
    // else: return n * factorial(n - 1)
    builder.SetInsertPoint(elseBlock);
    Value *nMinus1 = builder.CreateSub(n, builder.getInt32(1), "n_minus_1");
    std::vector<Value*> args(1, nMinus1);
    Value *recursiveCall = builder.CreateCall(factorial, args, "rec");
    Value *result = builder.CreateMul(n, recursiveCall, "result");
    builder.CreateRet(result);
    
    // Verify
    if (verifyFunction(*factorial, &errs())) {
        errs() << "Function verification failed!\n";
    }
    
    return factorial;
}

int main() {
    LLVMContext context;
    Module *module = new Module("factorial.ll", context);
    IRBuilder<> builder(context);
    
    createFactorialFunction(module, builder);
    
    module->print(outs(), nullptr);
    
    delete module;
    return 0;
}
```

**Output LLVM IR:**

```llvm
define i32 @factorial(i32 %n) {
entry:
  %cmp = icmp sle i32 %n, 0
  br label %cond

cond:                                             ; preds = %entry
  br i1 %cmp, label %then, label %else

then:                                             ; preds = %cond
  ret i32 1

else:                                             ; preds = %cond
  %n_minus_1 = sub i32 %n, 1
  %rec = call i32 @factorial(i32 %n_minus_1)
  %result = mul i32 %n, %rec
  ret i32 %result
}
```

## 2.6 LLVM Pass Infrastructure

LLVM's optimizer is built on a pass-based architecture where each pass performs a specific analysis or transformation.

### 2.6.1 Pass Types

| Pass Type | Description | Examples |
|-----------|-------------|----------|
| **Analysis Pass** | Computes information | DominatorTree, LoopInfo, AA |
| **Transform Pass** | Modifies IR | DCE, InstCombine, Inlining |
| **Utility Pass** | Neither analysis nor transform | ExtractFunction, LoopExtractor |
| **Wrapper Pass** | Hosts another pass | CrossDSOCalls |

### 2.6.2 Standard Optimization Passes

```bash
# Instruction combining (algebraic simplifications)
opt -S -passes=instcombine hello.ll -o hello_opt.ll

# Dead code elimination
opt -S -passes=adce hello.ll -o hello_opt.ll

# Loop unrolling
opt -S -passes=loop-unroll hello.ll -o hello_opt.ll

# Function inlining
opt -S -passes=inline hello.ll -o hello_opt.ll

# Combine multiple passes
opt -S -passes='default<O2>' hello.ll -o hello_opt.ll

# Custom pass pipeline
opt -S -passes='gvn,mem2reg,dce' hello.ll -o hello_opt.ll
```

### 2.6.3 Analyzing IR with LLVM Tools

```bash
# View control flow graph
opt -dot-cfg hello.bc
# Generates cfg.main.dot

# View call graph
opt -dot-callgraph hello.bc
# Generates callgraph.dot

# Count instructions
opt -S -stats hello.ll 2>&1 | grep -E "Instruction|DynamicMemory"

# Time each pass
opt -S -time-passes hello.ll -o /dev/null
```

## 2.7 Target Description System

LLVM's target-independent code generator uses a declarative description system to support multiple architectures.

### 2.7.1 Target Registration

```cpp
#include <llvm/Target/TargetMachine.h>
#include <llvm/Target/TargetOptions.h>
#include <llvm/Target/TargetMachine.h>

// Get target for host machine
std::string targetTriple = sys::getDefaultTargetTriple();
TargetMachine *target = Target->createTargetMachine(targetTriple, "generic", "", options, Reloc::PIC_);
```

### 2.7.2 Supported Targets

LLVM natively supports many targets:

| Architecture | Targets |
|--------------|---------|
| x86 | x86, x86-64 |
| ARM | ARM, AArch64, Thumb |
| MIPS | MIPS, MIPS64 |
| RISC | RISC-V (32/64), SPARC |
| PowerPC | PPC, PPC64 |
| WebAssembly | wasm32, wasm64 |

### 2.7.3 Cross-Compilation Example

```bash
# Compile C to ARM64 assembly
clang --target=aarch64-linux-gnu -S hello.c -o hello_arm.s

# Compile C to RISC-V
clang --target=riscv64-unknown-elf -S hello.c -o hello_riscv.s

# Compile to WebAssembly
clang --target=wasm32 -S hello.c -o hello.wat
```

## 2.8 Clang: The C Language Family Frontend

Clang is LLVM's native C/C++/Objective-C frontend, known for its speed, diagnostics quality, and modularity.

### 2.8.1 Clang Features

- **Fast compilation**: Significantly faster than GCC in many cases
- **Beautiful diagnostics**: Color-coded, actionable error messages
- **Static analysis**: Built-in static analyzer
- **Plugin architecture**: Extensible with custom plugins
- **LibTooling**: Library for building tooling applications

### 2.8.2 Useful Clang Flags

```bash
# Basic compilation
clang -c hello.c -o hello.o

# Optimization levels
clang -O0 -c hello.c    # No optimization (debug)
clang -O1 -c hello.c    # Basic optimization
clang -O2 -c hello.c    # Standard optimization
clang -O3 -c hello.c    # Aggressive optimization
clang -Os -c hello.c    # Size optimization
clang -Oz -c hello.c    # Aggressive size optimization

# Debug information
clang -g -c hello.c -o hello.o    # DWARF debug info
clang -g -gsimple-template-names -c hello.c  # Clang-specific

# Warning flags
clang -Wall -Wextra -Werror hello.c

# Include search paths
clang -I/path/to/include hello.c

# Preprocessor definitions
clang -DMACRO=value hello.c

# Analysis
clang --analyze hello.c    # Static analysis

# AST dump
clang -Xclang -ast-dump -fsyntax-only hello.c

# Generate LLVM IR
clang -S -emit-llvm -O2 hello.c -o hello.ll
```

### 2.8.3 Clang Static Analyzer

```bash
# Run static analysis
scan-build clang -c hello.c

# Or use the analyzer directly
clang -Xclang -analyze -Xclang -analyzer-output=text hello.c

# With more detailed output
clang -Xclang -analyze -Xclang -analyzer-output=plist-multi-file hello.c
```

## 2.9 Project Structure for LLVM-based Tools

When building compiler tools with LLVM, a typical project structure is:

```
my-compiler/
├── CMakeLists.txt          # Build configuration
├── include/
│   └── mycompiler/
│       ├── Lexer.h
│       ├── Parser.h
│       └── Codegen.h
├── lib/
│   ├── Lexer.cpp
│   ├── Parser.cpp
│   └── Codegen.cpp
├── tools/
│   └── mycompiler.cpp       # Main entry point
└── tests/
    ├── lexer_test.cpp
    └── parser_test.cpp
```

### CMakeLists.txt Example

```cmake
cmake_minimum_required(VERSION 3.10)
project(MyCompiler)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(LLVM REQUIRED CONFIG)
include_directories(${LLVM_INCLUDE_DIRS})
add_definitions(${LLVM_DEFINITIONS})

add_subdirectory(lib)
add_subdirectory(tools)
```

## 2.10 Setting Up Your LLVM Development Environment

### 2.10.1 Installation

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install llvm llvm-dev clang lld
```

**macOS:**
```bash
brew install llvm
```

**Windows:**
Download installer from https://releases.llvm.org/

### 2.10.2 Verify Installation

```bash
llvm-config --version
clang --version
llc --version
opt --version
```

### 2.10.3 Using llvm-config

```bash
# Get compiler flags
llvm-config --cxxflags
# Output: -I/usr/lib/llvm-14/include -std=c++14 ...

# Get linker flags
llvm-config --ldflags
# Output: -L/usr/lib/llvm-14/lib ...

# Get all libraries needed
llvm-config --libs core analysis native
```

**Compiling with LLVM:**

```bash
clang++ -std=c++17 myprogram.cpp `llvm-config --cxxflags --ldflags --system-libs --libs core` -o myprogram
```

## Summary

This chapter provided a comprehensive introduction to LLVM's architecture:

1. **LLVM's modular design**: Frontends → LLVM IR → Optimizer → Backends
2. **LLVM IR fundamentals**: Typed, SSA-based intermediate representation
3. **Toolchain**: clang, llc, opt, llvm-as, llvm-dis
4. **C++ API basics**: LLVMContext, Module, IRBuilder
5. **Pass infrastructure**: Analysis and transformation passes
6. **Target system**: Support for multiple architectures
7. **Clang frontend**: Production-quality C/C++ compiler

With this foundation, subsequent chapters will dive deeper into each compilation phase, implementing them using LLVM's APIs.

---

## Exercises

### Exercise 2.1: Explore LLVM IR
1. Write a simple C function that computes the sum of an array
2. Compile it to LLVM IR using `clang -S -emit-llvm -O2`
3. Compare the IR generated at different optimization levels (-O0, -O1, -O2, -O3)
4. Document the differences you observe

### Exercise 2.2: Generate LLVM IR Programmatically
Write a C++ program using the LLVM API that generates the following function:

```llvm
; i32 sum_array(i32* %arr, i32 %len)
; Returns the sum of all elements in the array
```

Test your generator by compiling the output with `llc`.

### Exercise 2.3: Optimization Pipeline
1. Write a C++ file with various optimization opportunities (dead code, common subexpressions, etc.)
2. Compile to LLVM IR
3. Run individual optimization passes and observe their effects
4. Create a custom pass pipeline and compare results

### Exercise 2.4: Cross-Compilation
1. Install a cross-compilation toolchain (e.g., ARM or RISC-V)
2. Write a simple "Hello, World!" program
3. Compile for your host architecture
4. Cross-compile for the target architecture
5. If you have QEMU, test the cross-compiled binary

### Exercise 2.5: Clang Static Analysis
1. Write a C file with various bugs (buffer overflows, use-after-free patterns, null dereferences)
2. Run the Clang static analyzer on it
3. Interpret the diagnostic messages
4. Fix the bugs and verify they are resolved

### Exercise 2.6: Research LLVM Extensions
Research one of the following LLVM-related projects:
- Clang plugins and AST visitors
- LLVM-based interpreters (e.g., LLILC, VMKit)
- WebAssembly backend
- GPU offloading (NVPTX, AMDGPU)

Write a summary (500 words) of your findings.

---

**[Next Chapter: 第三章_詞法分析與語法分析.md](第三章_詞法分析與語法分析.md)**

---

## References

1. LLVM Official Documentation: https://llvm.org/docs/
2. LLVM Language Reference Manual: https://llvm.org/docs/LangRef.html
3. Lattner, C., & Adve, V. (2004). LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation. *CGO 2004*.
4. Clang Documentation: https://clang.llvm.org/docs/
5. Building LLVM with CMake: https://llvm.org/docs/CMake.html
