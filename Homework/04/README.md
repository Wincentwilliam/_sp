# 讓 AI 教你編譯器 -- 理論與實作（LLVM 版）
## Learn Compilers with AI -- Theory and Implementation (LLVM Edition)

---

> **Transparency Notice:** This book was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

## Overview

This textbook serves as a comprehensive guide to compiler design and implementation, with a practical focus on the LLVM (Low Level Virtual Machine) framework. Written for university students in compiler courses, this book bridges the gap between theoretical compiler concepts and real-world implementation using industry-standard tools.

### What You Will Learn

- The fundamental stages of the compilation pipeline
- How LLVM's modular architecture enables flexible compiler construction
- Lexical analysis and parsing techniques
- Semantic analysis and Abstract Syntax Tree (AST) construction
- LLVM Intermediate Representation (IR) generation
- Target-specific code generation

### Prerequisites

- Familiarity with at least one programming language (C/C++ recommended)
- Basic understanding of data structures and algorithms
- Elementary knowledge of computer architecture
- Interest in learning how compilers work "under the hood"

---

## Table of Contents

| Chapter | Title | Description |
|---------|-------|-------------|
| [前言](前言.md) | Foreword | Introduction and motivation for the book |
| [第一章](第一章_編譯器概論.md) | Compiler Overview | Fundamental concepts and structure of compilers |
| [第二章](第二章_LLVM架構基礎.md) | LLVM Architecture Basics | Introduction to LLVM's design and components |
| [第三章](第三章_詞法分析與語法分析.md) | Lexical and Syntax Analysis | Building scanners and parsers |
| [第四章](第四章_語意分析與AST.md) | Semantic Analysis and AST | Type checking and semantic rules |
| [第五章](第五章_LLVM中間表示層(IR).md) | LLVM IR | Understanding and generating LLVM IR |
| [第六章](第六章_目標程式碼生成.md) | Target Code Generation | Code generation for different architectures |
| [第七章](第七章_總結與練習.md) | Summary and Exercises | Review and practical exercises |
| [附錄](附錄_參考資源.md) | Appendix: References | Additional learning resources |

---

## How to Use This Book

1. **Read sequentially**: Chapters build upon concepts introduced in earlier sections
2. **Practice with code**: Each chapter includes runnable examples using LLVM tools
3. **Complete exercises**: End-of-chapter exercises reinforce learning
4. **Experiment**: Modify the provided code examples to deepen understanding

## Building the Examples

Most examples in this book can be compiled and tested using LLVM's toolchain. Ensure you have LLVM installed on your system:

```bash
# On Ubuntu/Debian
sudo apt-get install llvm llvm-dev clang

# On macOS (using Homebrew)
brew install llvm

# On Windows
# Download installer from https://llvm.org/
```

Verify your installation:

```bash
llvm-config --version
clang --version
```

---

## Contributing and Feedback

This is an educational project. If you find errors or have suggestions for improvement, please provide feedback to help improve future editions.

---

## License

This work is intended for educational purposes in a university compiler course setting.

---

*Last updated: 2026*
