# 讓 AI 教你編譯器 -- 理論與實作（LLVM 版）

### Learn Compilers with AI -- Theory and Implementation (LLVM Edition)

---

> **Transparency Notice:** This book was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

<div align="center">

![Compiler Pipeline](https://img.shields.io/badge/Topic-Compiler%20Construction-blue)
![LLVM](https://img.shields.io/badge/Framework-LLVM-green)
![Language](https://img.shields.io/badge/Language-English-orange)
![Level](https://img.shields.io/badge/Level-University%20Course-purple)

*A comprehensive textbook bridging theory and practice in modern compiler design*

</div>

---

## Table of Contents

| Chapter | Title | Description | Key Topics |
|:-------:|-------|-------------|-----------|
| [前言](前言.md) | Foreword | Motivation & book overview | Why compilers matter, LLVM revolution |
| [第一章](第一章_編譯器概論.md) | Compiler Overview | Fundamental concepts | Compilation pipeline, architecture patterns |
| [第二章](第二章_LLVM架構基礎.md) | LLVM Architecture | LLVM design & tools | Toolchain, C++ API, pass infrastructure |
| [第三章](第三章_詞法分析與語法分析.md) | Lexical & Syntax Analysis | Scanners & parsers | Tokenization, CFGs, recursive descent |
| [第四章](第四章_語意分析與AST.md) | Semantic Analysis | Type systems & AST | Symbol tables, type checking, TAC |
| [第五章](第五章_LLVM中間表示層(IR).md) | LLVM IR | Intermediate representation | SSA, instructions, IR generation |
| [第六章](第六章_目標程式碼生成.md) | Code Generation | Target-specific output | Instruction selection, register alloc |
| [第七章](第七章_總結與練習.md) | Summary & Exercises | Review & practice | Project ideas, advanced topics |
| [附錄](附錄_參考資源.md) | Appendix | References & resources | Documentation, books, tools |

---

## Overview

This textbook provides a **comprehensive guide to compiler design and implementation**, with a practical focus on the **LLVM (Low Level Virtual Machine)** framework. Written for university students taking compiler courses, this book bridges the gap between theoretical compiler concepts and real-world implementation using industry-standard tools.

### What Makes This Book Unique?

| Feature | Description |
|---------|-------------|
| **Theory + Practice** | Every concept comes with working code implementations |
| **LLVM-Focused** | Uses production-grade LLVM infrastructure, not toy examples |
| **Hands-On Exercises** | End-of-chapter exercises reinforce every concept |
| **Complete Pipeline** | From source code to executable, every phase covered |
| **Multiple Languages** | Examples in C, C++, and LLVM IR |

### What You Will Learn

By completing this book, you will master:

- ✅ **Compilation Pipeline Architecture** — Understand the multi-stage nature of compilers
- ✅ **Lexical Analysis** — Build scanners using regular expressions and finite automata
- ✅ **Syntax Analysis** — Implement parsers with context-free grammars
- ✅ **Semantic Analysis** — Perform type checking and scope analysis
- ✅ **LLVM IR Generation** — Generate production-quality intermediate code
- ✅ **Code Optimization** — Apply LLVM's powerful optimization passes
- ✅ **Target Code Generation** — Compile to x86, ARM, RISC-V, and more
- ✅ **Compiler Tool Development** — Build your own compiler tools using LLVM APIs

---

## Chapter Overview

### Chapter 1: Compiler Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOURCE CODE                                │
│                         (.c, .cpp)                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LEXICAL ANALYSIS                              │
│              (Scanner / Lexer)                                  │
│           Tokens: if, identifier, (, {, etc.                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SYNTAX ANALYSIS                                │
│                  (Parser)                                       │
│         Abstract Syntax Tree (AST)                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SEMANTIC ANALYSIS                              │
│            Type Checking, Scope Analysis                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTERMEDIATE REPRESENTATION                        │
│                     (LLVM IR)                                   │
│              Platform-independent code                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIMIZATION                                 │
│            (Various optimization passes)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               TARGET CODE GENERATION                            │
│                    (Assembly/Object)                            │
│                x86, ARM, RISC-V, etc.                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXECUTABLE                                 │
│                    (Machine Code)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Chapter 2: LLVM Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Clang     │  │   Swift     │  │   Rust      │
│   (C/C++)   │  │   Compiler  │  │   Compiler  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│              LLVM Core Libraries                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │     IR      │  │ Optimizer  │  │  Target  │  │
│  │ (LLVM IR)   │  │   Passes    │  │  Infos   │  │
│  └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   x86       │  │    ARM      │  │   RISC-V   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Chapter 3-4: Frontend Development

Build your own compiler frontend:
- **Lexical Analyzer** — Tokenization with finite automata
- **Syntax Analyzer** — Recursive descent parser with AST construction
- **Semantic Analyzer** — Symbol tables, type checking, scope resolution

### Chapter 5: LLVM IR Mastery

Deep dive into LLVM's intermediate representation:
- SSA form and phi nodes
- Type system (primitive and aggregate types)
- All LLVM instructions explained
- Generating IR programmatically with C++ APIs

### Chapter 6: Backend Development

Transform IR to machine code:
- Instruction selection via SelectionDAG
- Register allocation algorithms
- Calling conventions (x86-64, ARM, RISC-V)
- Stack frame layout
- Cross-compilation

---

## Prerequisites

### Required Knowledge

| Topic | Level | Notes |
|-------|-------|-------|
| **Programming** | Intermediate | Comfortable with C/C++ |
| **Data Structures** | Basic | Trees, graphs, hash tables |
| **Algorithms** | Basic | Recursion, traversal |
| **Computer Architecture** | Elementary | Registers, memory, stack |

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **LLVM** | ≥14.0 | Core compiler infrastructure |
| **Clang** | ≥14.0 | C/C++ compiler frontend |
| **C++ Compiler** | C++14+ | Building examples |
| **Make/CMake** | Latest | Build system |

### Recommended Background Reading

1. Basic data structures (stacks, queues, trees)
2. Elementary automata theory concepts
3. Assembly language basics (any architecture)
4. Operating system concepts (stack, heap, memory)

---

## Getting Started

### Installation

#### Ubuntu / Debian

```bash
# Add LLVM repository
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh 14

# Install LLVM and Clang
sudo apt-get update
sudo apt-get install llvm-14 llvm-14-dev clang-14 lldb-14 lld-14

# Create symlinks (optional but recommended)
sudo ln -sf /usr/bin/llvm-config-14 /usr/bin/llvm-config
sudo ln -sf /usr/bin/clang-14 /usr/bin/clang
sudo ln -sf /usr/bin/llc-14 /usr/bin/llc
sudo ln -sf /usr/bin/opt-14 /usr/bin/opt
```

#### macOS

```bash
# Using Homebrew
brew install llvm

# After installation, add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="/usr/local/opt/llvm/bin:$PATH"
```

#### Windows

```powershell
# Download from https://releases.llvm.org/
# Or use Chocolatey
choco install llvm

# Verify installation
llvm-config --version
```

### Verify Installation

```bash
# Check LLVM version
llvm-config --version
# Expected: LLVM version 14.0.0 or higher

# Check Clang version
clang --version
# Expected: clang version 14.0.0 or higher

# Check llc (LLVM compiler)
llc --version
# Expected: Registered Targets: x86, x86-64, ARM, AArch64, RISC-V, etc.

# Check opt (optimizer)
opt --version
```

### Building the Examples

Most examples in this book can be compiled using standard C++ compilation:

```bash
# Simple compilation
g++ -std=c++17 example.cpp -o example

# With LLVM libraries
clang++ -std=c++17 example.cpp \
    `llvm-config --cxxflags --ldflags --system-libs --libs core` \
    -o example

# Full compilation with all optimizations
clang++ -std=c++17 -O2 -Wall -Wextra example.cpp \
    `llvm-config --cxxflags --ldflags --system-libs --libs core native` \
    -o example
```

### Quick Test

Create and compile a simple LLVM IR program:

```llvm
; hello.ll
define i32 @main() {
    ret i32 0
}
```

```bash
# Assemble to bitcode
llvm-as hello.ll -o hello.bc

# Compile to native assembly
llc hello.ll -o hello.s

# Assemble and link (on Linux)
clang hello.s -o hello

# Run
./hello
echo $?  # Should print 0
```

---

## How to Use This Book

### Recommended Learning Path

```
Week 1-2    │ Chapter 1: Compiler Overview
            │ Chapter 2: LLVM Architecture
            │
Week 3-4    │ Chapter 3: Lexical & Syntax Analysis
            │   └─► Build a lexer and parser
            │
Week 5-6    │ Chapter 4: Semantic Analysis
            │   └─► Add type checking to your compiler
            │
Week 7-8    │ Chapter 5: LLVM IR Generation
            │   └─► Generate LLVM IR from your AST
            │
Week 9-10   │ Chapter 6: Code Generation
            │   └─► Compile to multiple targets
            │
Week 11-12  │ Chapter 7: Summary & Projects
            │   └─► Complete a full compiler project
```

### Reading Tips

1. **Read sequentially** — Chapters build upon concepts from earlier sections
2. **Run the code** — Don't just read; type out and run every example
3. **Experiment** — Modify examples to test your understanding
4. **Complete exercises** — Each chapter ends with exercises to reinforce learning
5. **Review summaries** — Chapter summaries provide quick reference

### Code Examples Organization

```
Code Examples/
├── Chapter 3/
│   ├── Lexer.h / Lexer.cpp      # Token scanner implementation
│   ├── Parser.h / Parser.cpp    # Recursive descent parser
│   └── main.cpp                 # Example driver program
│
├── Chapter 4/
│   ├── SymbolTable.h            # Symbol table implementation
│   ├── TypeChecker.h           # Type checking logic
│   └── main.cpp
│
├── Chapter 5/
│   ├── LLVMIRGenerator.h       # IR generation
│   ├── LLVMIRGenerator.cpp
│   └── main.cpp
│
└── Chapter 6/
    ├── CodeGen.h               # Code generation
    └── main.cpp
```

---

## Chapter Exercises

Each chapter includes carefully designed exercises:

### Exercise Categories

| Type | Description | Time |
|------|-------------|------|
| **Conceptual** | Theory questions | 15-30 min |
| **Implementation** | Write code | 1-3 hours |
| **Analysis** | Examine existing code | 30-60 min |
| **Research** | Explore advanced topics | 1-2 hours |
| **Project** | Build something substantial | 3-10 hours |

### Sample Exercise Structure

```markdown
### Exercise X.Y: [Topic]

**Objective:** [What you'll accomplish]

**Given:** [Starting code or problem statement]

**Tasks:**
1. [First task]
2. [Second task]
3. [Third task]

**Bonus:** [Optional advanced challenge]

**Expected Output:** [What your solution should produce]
```

---

## Project Structure

```
讓 AI 教你編譯器/
│
├── README.md                      # This file
├── 前言.md                        # Foreword
│
├── 第一章_編譯器概論.md           # Chapter 1: Overview
│
├── 第二章_LLVM架構基礎.md         # Chapter 2: LLVM Architecture
│
├── 第三章_詞法分析與語法分析.md    # Chapter 3: Lexical & Syntax
│   ├── examples/
│   │   ├── lexer/
│   │   ├── parser/
│   │   └── ast/
│   └── exercises/
│
├── 第四章_語意分析與AST.md        # Chapter 4: Semantic Analysis
│   ├── examples/
│   │   ├── symbol_table/
│   │   ├── type_checker/
│   │   └── tac/
│   └── exercises/
│
├── 第五章_LLVM中間表示層(IR).md   # Chapter 5: LLVM IR
│   ├── examples/
│   │   ├── ir_basics/
│   │   ├── ir_generator/
│   │   └── ir_optimizer/
│   └── exercises/
│
├── 第六章_目標程式碼生成.md        # Chapter 6: Code Generation
│   ├── examples/
│   │   ├── codegen/
│   │   ├── register_alloc/
│   │   └── targets/
│   └── exercises/
│
├── 第七章_總結與練習.md           # Chapter 7: Summary
│
└── 附錄_參考資源.md               # Appendix: References
```

---

## Frequently Asked Questions

### General

**Q: Do I need to know LLVM before starting?**
> No! Chapter 2 introduces LLVM from scratch. You'll learn the basics of LLVM's architecture, tools, and C++ APIs as you progress through the book.

**Q: Can I use a language other than C++?**
> The book uses C++ for all implementations, as it's the primary language for LLVM development. However, you can adapt concepts to other languages that can interface with LLVM (Rust, Python via llvmlite, etc.).

**Q: How long does it take to complete the book?**
> With dedicated study, 2-3 hours per chapter, you can complete the book in 10-15 weeks (one semester). For self-paced learning, expect 60-80 hours total.

### Technical

**Q: Why LLVM instead of other frameworks?**
> LLVM provides production-quality infrastructure, is widely used in industry (Clang, Rust, Swift, Julia), has excellent documentation, and offers a modular architecture perfect for learning.

**Q: What if I get stuck on an exercise?**
> Review the relevant chapter sections, check the Appendix for additional resources, and refer to LLVM's official documentation. Don't hesitate to experiment!

**Q: How do I debug my compiler?**
> Use LLVM's verification functions (`verifyFunction`, `verifyModule`), print intermediate representations, and use standard debugging tools like GDB or LLDB.

### Course Usage

**Q: Can this be used for a university course?**
> Yes! The book is designed for semester-long compiler courses. Each chapter provides enough material for 1-2 weeks of study with exercises.

**Q: Are solutions to exercises available?**
> Exercise solutions are not provided to encourage learning through struggle. However, the book provides extensive examples that guide you toward the solution.

---

## Learning Outcomes

After completing this book, you will be able to:

### Knowledge

- [ ] Explain the compilation pipeline and each phase's purpose
- [ ] Describe LLVM's modular architecture
- [ ] Define context-free grammars and parse trees
- [ ] Explain type systems and type checking algorithms
- [ ] Summarize SSA form and its advantages
- [ ] Compare different code generation strategies

### Skills

- [ ] Build a lexical analyzer using finite automata
- [ ] Implement recursive descent parsers
- [ ] Construct and traverse Abstract Syntax Trees
- [ ] Generate LLVM IR from ASTs
- [ ] Apply LLVM optimization passes
- [ ] Compile to multiple target architectures

### Abilities

- [ ] Design and implement a complete compiler
- [ ] Extend LLVM with custom passes
- [ ] Debug compiler components
- [ ] Evaluate compiler design trade-offs
- [ ] Read and understand LLVM IR
- [ ] Build compiler-based tools

---

## Additional Resources

### In This Book

| Resource | Description |
|----------|-------------|
| [Appendix](附錄_參考資源.md) | Extended reference list |
| Chapter Exercises | End-of-chapter problems |
| Code Examples | Working implementations |
| Summaries | Quick reference at chapter end |

### External Resources

| Category | Resources |
|----------|-----------|
| **Books** | Dragon Book, Appel series, LLVM books |
| **Online** | LLVM documentation, Crafting Interpreters |
| **Courses** | Stanford CS143, MIT 6.035 |
| **Community** | LLVM Discord, Stack Overflow |

---

## Contributing and Feedback

This is an educational project created for a university compiler course. We welcome:

- **Bug Reports** — Typographical errors, code issues, unclear explanations
- **Suggestions** — Topics to add, exercises to improve
- **Improvements** — Better explanations, additional examples
- **Translations** — Interested in translating to other languages?

### How to Contribute

1. Fork the repository
2. Create a branch for your changes
3. Make your modifications
4. Submit a pull request with a clear description

---

## License

This work is intended for **educational purposes** in a university compiler course setting. You are welcome to:

- ✅ Use this material for learning
- ✅ Share with classmates
- ✅ Build upon it for projects

Please attribute if you reference this work in your own materials.

---

## Acknowledgments

We thank:

- **The LLVM Project** — For creating an amazing compiler infrastructure
- **The Clang Team** — For the production-quality C/C++ frontend
- **Chris Lattner & Vikram Adve** — For visionary LLVM design
- **OpenCode** — For assistance in drafting and structuring this content
- **University Students** — For feedback and improvements

---

<div align="center">

**Happy Compiling!**

*Last updated: April 2026*

</div>
