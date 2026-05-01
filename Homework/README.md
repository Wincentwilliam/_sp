<div align="center">

# Homework Collection README (01-06)

### Complete Documentation for All System Programming & Compiler Assignments

![Homework](https://img.shields.io/badge/Homework-01--06-blue)
![Status](https://img.shields.io/badge/Status-Complete-green)
![Last Updated](https://img.shields.io/badge/Updated-May%202026-orange)

**A comprehensive collection of compiler, system programming, and software engineering assignments**

---

</div>

## Table of Contents

| Homework | Title | Author | Technologies |
|:--------:|-------|--------|--------------|
| [01](#homework-01---p0-compiler-project) | p0 Compiler Project | Built by Opencode AI | C, Compiler Design |
| [02](#homework-02---minilang-compiler--vm) | MiniLang Compiler & VM | Built by Opencode AI | Python, AST, Bytecode |
| [03](#homework-03---health--fitness-ai-assistant) | Health & Fitness AI | Built by Claude Code + OpenCode | React, Node.js, Groq AI |
| [04](#homework-04---llvm-compiler-textbook) | LLVM Compiler Textbook | Student Work | LLVM, C++, Documentation |
| [05](#homework-05---linux-multi-threading-assignment) | Linux Multi-Threading | Built by OpenCode (80%) + Student (20%) | C, pthreads |
| [06](#homework-06---system-programming-demo) | System Programming Demo | Built by Claude Code | C, POSIX APIs |

---

<div align="center">

---

## Homework 01 - p0 Compiler Project

---

</div>

> **Built by: Google AI Studio**

### Project Title
**p0 Compiler Project - While Loop & Function Calls**

### Description
This project is an enhancement of the **p0 compiler**. It introduces control flow handling for `while` loops and provides a detailed implementation analysis of the function call mechanism within the Virtual Machine (VM).

### Project Files
| File | Description |
|------|-------------|
| `01.c` | Complete source code for the compiler (Lexer, Parser, Generator, VM) |
| `test.p0` | Test script written in p0 language to verify new features |
| `readme.md` | Documentation of design principles and usage |

### How to Run

```bash
# Compile the source code
gcc 01.c -o compiler

# Run the compiler with test file
./compiler test.p0
```

### Features Implemented
- Lexical Analysis (Tokenizer)
- Recursive Descent Parser
- Code Generation
- Virtual Machine Execution
- While Loop Control Flow
- Function Call Mechanism

### Architecture Overview

The compiler consists of four main components:

1. **Lexer**: Converts source code into tokens
2. **Parser**: Builds an Abstract Syntax Tree from tokens
3. **Generator**: Produces bytecode from the AST
4. **VM**: Executes the bytecode on a virtual machine

---

<div align="center">

---

## Homework 02 - MiniLang Compiler & VM

---

</div>

> **Built by: Gemini AI**

### Design Goals
MiniLang is a simple imperative language designed to demonstrate the core concepts of a compiler: lexical analysis, parsing into an Abstract Syntax Tree (AST), bytecode generation, and execution via a virtual machine.

### Language Features

| Feature | Description |
|---------|-------------|
| **Variables** | Declaration with `let` and subsequent assignment |
| **Control Flow** | `if` statements and `while` loops for logic |
| **Arithmetic** | Supports `+`, `-`, `*`, `/` |
| **Comparisons** | Supports `<` and `>` for loop/if conditions |
| **Output** | Built-in `print()` function to display values |

### Implementation Details

| Component | Implementation |
|-----------|----------------|
| **Lexer** | Regular expression-based tokenizer |
| **Parser** | Recursive Descent Parser that generates an AST |
| **Compiler** | Translates AST nodes into a linear sequence of Bytecode |
| **Virtual Machine** | Stack-based machine that interprets instructions |
| **Type System** | Strong Typing (Integers) |
| **Memory Management** | Stack-based (no Garbage Collection) |

### Code Example

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

### Project Files
| File | Description |
|------|-------------|
| `02.py` | Python code (Compiler + VM) |
| `EBNF` | Grammar specification file |
| `readme.md` | Design goals and characteristics |

### Bytecode Instructions

The MiniLang VM supports the following bytecode instructions:

| Instruction | Description |
|-------------|-------------|
| PUSH | Push a value onto the stack |
| LOAD | Load a variable onto the stack |
| STORE | Store a value in a variable |
| OP | Perform arithmetic operation |
| JUMP | Unconditional jump |
| JUMP_IF_FALSE | Conditional jump |
| PRINT | Print top of stack |

---

<div align="center">

---

## Homework 03 - Health & Fitness AI Assistant

---

</div>

> **Built by: Gemini AI, Claude Code and OpenCode**

### Description
A comprehensive, AI-powered health and fitness web application that provides personalized meal plans, exercise recommendations, nutritional analysis, and smart scheduling.

### Features

#### Authentication
- User registration with username, email, phone number, and password
- Secure login with JWT tokens
- Password hashing with bcrypt (12 rounds)
- Automatic token refresh

#### Onboarding / Profile Setup
- Multi-step wizard to collect user health data
- Weight, height, age, gender, and activity level input
- Automatic BMR and daily calorie calculation using Mifflin-St Jeor equation
- Feature gating: Calendar and AI features unlock only after profile completion

#### AI Integration (Groq API)
- **Meal Planning**: Generate personalized breakfast, lunch, dinner, and snack recommendations
- **Exercise Recommendations**: Get workout suggestions based on your profile and goals
- **Nutrition Search**: Look up any food for detailed nutritional breakdown including:
  - Calories and macros
  - Vitamins and minerals
  - Health Score (0-100)
  - Goal compatibility assessment

#### Smart Scheduling
- Calendar interface for planning meals and workouts
- Add, edit, complete, and delete schedule entries
- Visual indicators for days with scheduled items
- Type-coded entries (meal, workout, reminder)

### Tech Stack

#### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Supabase (PostgreSQL) | Database |
| Groq SDK (Llama 3.3 70B) | AI Integration |
| bcryptjs, jsonwebtoken | Security |
| helmet, express-rate-limit | Security headers and rate limiting |
| express-validator | Input validation |

#### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router v6 | Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| Lucide React | Icons |
| react-calendar | Calendar component |

### Project Structure

```
homework-03/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase, Groq configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # JWT auth, validation
│   │   ├── routes/          # Express routes
│   │   ├── services/        # AI service
│   │   └── utils/           # BMR calculator, password hashing
│   ├── schema.sql           # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth, Profile contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── App.jsx          # Main app with routing
│   └── package.json
└── README.md
```

### Setup Instructions

```bash
# Backend Setup
cd backend
npm install
copy .env.example .env

# Frontend Setup
cd ../frontend
npm install
copy .env.example .env

# Run Backend (Terminal 1)
cd backend
npm run dev

# Run Frontend (Terminal 2)
cd frontend
npm run dev
```

Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:5173

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |

#### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| GET | `/api/profile/health` | Get health profile |
| POST | `/api/profile/health` | Save health profile |

#### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/meal-plan` | Generate meal plan |
| POST | `/api/ai/exercises` | Get exercise recommendations |
| POST | `/api/ai/nutrition-search` | Search food nutrition |
| POST | `/api/ai/analyze-meal` | Analyze a meal |

#### Schedule
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule` | Get schedule entries |
| POST | `/api/schedule` | Create entry |
| PUT | `/api/schedule/:id` | Update entry |
| PATCH | `/api/schedule/:id/complete` | Mark complete |
| DELETE | `/api/schedule/:id` | Delete entry |

### Health Calculations

#### BMR (Mifflin-St Jeor Equation)
| Gender | Formula |
|--------|---------|
| Male | `10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5` |
| Female | `10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161` |
| Other | Average of male and female formulas |

#### Daily Calories
`Daily Calories = BMR x Activity Multiplier + Goal Adjustment`

| Activity Level | Multiplier |
|---------------|------------|
| Sedentary | 1.2 |
| Light | 1.375 |
| Moderate | 1.55 |
| Active | 1.725 |
| Very Active | 1.9 |

| Goal | Adjustment |
|------|------------|
| Lose | -500 kcal |
| Maintain | 0 kcal |
| Gain | +500 kcal |

### Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT authentication with short-lived tokens (15 min)
- Refresh token rotation (7 days)
- Rate limiting (100 req/15min, 10 auth req/15min)
- Helmet security headers
- CORS configuration
- Input validation with express-validator
- Row Level Security (RLS) in Supabase

---

<div align="center">

---

## Homework 04 - LLVM Compiler Textbook

---

</div>

> **Built by: OpenCode (Student Documentation Work)**

### Title
**讓 AI 教你編譯器 -- 理論與實作（LLVM 版）**
*Learn Compilers with AI -- Theory and Implementation (LLVM Edition)*

### Overview
A comprehensive textbook bridging theory and practice in modern compiler design, with a practical focus on the **LLVM (Low Level Virtual Machine)** framework.

### What Makes This Book Unique?

| Feature | Description |
|---------|-------------|
| **Theory + Practice** | Every concept comes with working code implementations |
| **LLVM-Focused** | Uses production-grade LLVM infrastructure |
| **Hands-On Exercises** | End-of-chapter exercises reinforce every concept |
| **Complete Pipeline** | From source code to executable, every phase covered |
| **Multiple Languages** | Examples in C, C++, and LLVM IR |

### Chapter Contents

| Chapter | Title | Key Topics |
|:-------:|-------|-----------|
| 前言 | Foreword | Motivation & book overview |
| 第一章 | Compiler Overview | Compilation pipeline, architecture patterns |
| 第二章 | LLVM Architecture | Toolchain, C++ API, pass infrastructure |
| 第三章 | Lexical & Syntax Analysis | Tokenization, CFGs, recursive descent |
| 第四章 | Semantic Analysis | Type checking, symbol tables, TAC |
| 第五章 | LLVM IR | SSA, instructions, IR generation |
| 第六章 | Code Generation | Instruction selection, register alloc |
| 第七章 | Summary & Exercises | Review & practice |

### Compilation Pipeline

```
+------------------+
|   SOURCE CODE    |
|    (.c, .cpp)    |
+--------+---------+
         |
         v
+------------------+
|  LEXICAL ANAL.   |
|   (Scanner)      |
+--------+---------+
         |
         v
+------------------+
|  SYNTAX ANAL.    |
|    (Parser)      |
+--------+---------+
         |
         v
+------------------+
|  SEMANTIC ANAL.  |
|  (Type Check)    |
+--------+---------+
         |
         v
+------------------+
|    LLVM IR       |
|  (Intermediate)  |
+--------+---------+
         |
         v
+------------------+
|   OPTIMIZATION   |
|    (Passes)      |
+--------+---------+
         |
         v
+------------------+
|  TARGET CODE     |
|  (x86, ARM, etc) |
+--------+---------+
         |
         v
+------------------+
|   EXECUTABLE     |
|  (Machine Code)  |
+------------------+
```

### Prerequisites

| Topic | Level | Notes |
|-------|-------|-------|
| Programming | Intermediate | C/C++ |
| Data Structures | Basic | Trees, graphs, hash tables |
| Algorithms | Basic | Recursion, traversal |
| Computer Architecture | Elementary | Registers, memory, stack |

### Required Tools
- **LLVM**: Version 14.0 or higher
- **Clang**: Version 14.0 or higher
- **C++ Compiler**: C++14 or higher
- **Make/CMake**: Latest version

### Installation Instructions

#### Ubuntu / Debian
```bash
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh 14
sudo apt-get install llvm-14 llvm-14-dev clang-14 lldb-14 lld-14
```

#### macOS
```bash
brew install llvm
```

#### Windows
```powershell
choco install llvm
```

---

<div align="center">

---

## Homework 05 - Linux Multi-Threading Assignment

---

</div>

> **Built by: OpenCode (80%) + Student (20%)**

> **Note:** This README.md is 80% built by OpenCode and 20% by myself (洪偉升).

### Description
This assignment demonstrates Linux multi-threading concepts including threads, race conditions, mutexes, and deadlock prevention.

### Theoretical Concepts

#### 1. Thread
A **thread** is the smallest unit of execution within a process. In Linux, threads share the same address space but maintain their own stack, program counter, and registers.

Key characteristics:
- Shares memory space with other threads in the same process
- Has its own stack for local variables
- Maintains individual register state
- Has its own program counter

#### 2. Race Condition
A **race condition** occurs when multiple threads access shared data concurrently, and the outcome depends on thread execution timing.

Example scenario:
```
Thread A: counter = counter + 1
Thread B: counter = counter + 1
Expected result: counter increases by 2
Actual result: counter may only increase by 1 due to interleaved operations
```

#### 3. Mutex (Mutual Exclusion)
A **mutex** is a synchronization primitive ensuring only one thread can access a resource at a time.

Operations:
- `pthread_mutex_lock()`: Acquire the mutex
- `pthread_mutex_unlock()`: Release the mutex
- `pthread_mutex_init()`: Initialize a mutex

#### 4. Deadlock
A **deadlock** is a state where threads are permanently blocked, each waiting for resources held by another.

**Four Coffman Conditions (all must be present for deadlock):**
1. **Mutual Exclusion**: At least one resource is non-sharable
2. **Hold and Wait**: Threads hold resources while waiting for others
3. **No Preemption**: Resources cannot be forcibly taken from threads
4. **Circular Wait**: A circular chain of threads exists, each waiting for a resource held by the next

### Coding Implementations

| File | Description |
|------|-------------|
| `bank_simulation.c` | Demonstrates race condition and mutex solution |
| `producer_consumer.c` | Bounded buffer with condition variables |
| `dining_philosophers.c` | Deadlock prevention using resource hierarchy |

### Compilation

```bash
gcc -pthread -o bank_simulation bank_simulation.c
gcc -pthread -o producer_consumer producer_consumer.c
gcc -pthread -o dining_philosophers dining_philosophers.c
```

### Run

```bash
./bank_simulation
./producer_consumer
./dining_philosophers
```

### Expected Output

#### Bank Simulation
```
Initial balance: 50000
Expected final balance: 50000
Actual final balance: 50000
Status: PASS - No race condition!
```

#### Producer-Consumer
```
Producer 1 produced: 1
Consumer 1 consumed: 1
... (no buffer overflow/underflow)
```

#### Dining Philosophers
```
Philosopher 0 picks up chopstick 0
Philosopher 0 picks up chopstick 1
Philosopher 0 is EATING
... (all finish - no deadlock)
```

---

<div align="center">

---

## Homework 06 - System Programming Demo

---

<div align="center">

# Master Demonstration Program for System Programming

![C Language](https://img.shields.io/badge/Language-C-00599C?logo=c&logoColor=white)
![POSIX](https://img.shields.io/badge/POSIX-Compliant-3A96D9?logo=linux&logoColor=white)
![License](https://img.shields.io/badge/License-Educational-9B59B6)

**A comprehensive demonstration of Unix process management and file descriptor manipulation**

---

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">

**Author:** Created by Claude Code (System Programming Assistant)  
**Course:** System Programming Assignment  
**Date:** May 2026  
**Status:** Fully Functional & Tested

</div>

</div>

---

## Table of Contents

- Overview
- Features Demonstrated
- Program Structure
- Compilation and Execution
- Why dup2() is Essential Before execvp()
- Code Quality Features
- File Descriptions
- Technical Details

---

## Overview

This program is a comprehensive demonstration of Unix process management and file descriptor manipulation. It showcases all core system programming concepts in a single, cohesive execution flow, making it ideal for educational purposes in a System Programming course.

The program demonstrates:
- fork() - Process creation
- execvp() - Process execution
- open() - File opening/creation
- close() - File descriptor closing
- read() - Reading from file descriptors
- write() - Writing to file descriptors
- dup2() - File descriptor redirection
- wait() - Parent-child synchronization

---

## Features Demonstrated

### System Calls Covered

| System Call | Purpose | Demonstrated In |
|-------------|---------|-----------------|
| fork() | Process creation | Phases 2 & 3 |
| execvp() | Process execution | Phases 2 & 3 |
| open() | File opening/creation | Phases 1, 2, 3, 5 |
| close() | File descriptor closing | All phases |
| read() | Reading from file descriptors | Phase 5 |
| write() | Writing to file descriptors | All phases |
| dup2() | File descriptor redirection | Phases 2 & 3 |
| wait() | Parent-child synchronization | Phases 2 & 3 |

### File Descriptors Used

| File Descriptor | Name | Usage in This Program |
|-----------------|------|----------------------|
| 0 (stdin) | Standard Input | Redirected for the cat command in Phase 3 |
| 1 (stdout) | Standard Output | Redirected for the ls command in Phase 2 |
| 2 (stderr) | Standard Error | Used exclusively for error messages and logs |

---

## Program Structure

### Phase 1: File I/O & Creation
- Creates input.txt using open() and write()
- Demonstrates basic file operations and permissions
- Logs all operations with PID prefix for traceability

### Phase 2: Output Redirection (ls command)
- Forks a child process
- Uses dup2() to redirect stdout (fd 1) to output_log.txt
- Executes ls -l via execvp()
- Parent waits for child completion and reports exit status

### Phase 3: Input Redirection (cat command)
- Forks another child process
- Uses dup2() to redirect stdin (fd 0) from input.txt
- Executes cat via execvp()
- Parent waits for child completion and reports exit status

### Phase 4: Parent Monitoring
- Summary of all monitored child processes
- Reports exit statuses of all children

### Phase 5: Cleanup & Final Output
- Closes all file descriptors
- Displays final output_log.txt content
- Provides comprehensive demonstration summary

---

## Compilation and Execution

### Compilation Command (Linux/WSL)

```bash
gcc -Wall -Wextra -o master_demo master_demo.c
```

### Execution Command

```bash
./master_demo
```

### Expected Output

The program produces a trace-like output showing:
- All system call operations with PID prefixes
- File creation and modification logs
- Child process creation and monitoring
- Final output from the ls -l command (captured via redirection)

---

## Why dup2() is Essential Before execvp()

### The Core Problem

When execvp() is called, it completely replaces the current process image:
- The new program starts with a fresh memory space
- File descriptors are preserved (inherited), but their meaning must be set up beforehand
- execvp() does NOT provide a mechanism to redirect I/O

### How dup2() Solves This

```c
// Setup: Create a file descriptor for our target file
int fd = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);

// Critical: Redirect stdout (fd 1) to our file
dup2(fd, STDOUT_FILENO);

// Now execvp() - the new program (ls) will write to our file
execvp("ls", args);
```

### Step-by-Step Explanation

1. **open()**: Creates a file descriptor pointing to output.txt
2. **dup2(fd, 1)**: Makes stdout (fd 1) point to the same file
3. **execvp()**: Replaces the process, but preserves open file descriptors
4. **Result**: When ls writes to stdout, it goes to output.txt

### Why Not Just Modify the New Program?

You cannot modify ls (or any system command) to write to a different file. The redirection must happen at the system call level before execvp(), so the new program inherits the modified file descriptor table.

### Alternative Approaches (and Why They Don't Work)

| Approach | Why It Fails |
|----------|--------------|
| Writing ls > output.txt in shell | This uses shell redirection, not the program itself |
| Opening file after execvp() | Too late - the program has already started |
| Environment variables | ls doesn't check for custom output paths |

### dup2() Atomicity

dup2() is atomic - it closes the new file descriptor if it's already open before duplicating. This prevents race conditions where file descriptors might leak.

---

## Code Quality Features

| Feature | Description |
|---------|-------------|
| Extensive Comments | Every function and system call is documented |
| Error Handling | All system calls check for errors (-1 return) with perror() |
| PID Prefixing | All output shows which process generated it for debugging |
| Clean Resource Management | All file descriptors are properly closed |
| Standard Compliance | Uses POSIX-compliant headers and functions |
| Professional Output | Clean, consistent formatting for professors to read |

---

## File Descriptions

| File | Description |
|------|-------------|
| master_demo.c | Main source code with all 8 system call demonstrations |
| input.txt | Created by Phase 1, used for stdin redirection |
| output_log.txt | Created by Phase 2, contains ls -l output |
| README.md | This documentation file |

---

## Test Output Example

```
[PID: 1234] ========================================
[PID: 1234]   MASTER DEMONSTRATION PROGRAM STARTED
[PID: 1234] ========================================
[PID: 1234]
[PID: 1234] === PHASE 1: File I/O & Creation ===
[PID: 1234] Created input.txt with file descriptor: 3
[PID: 1234] Wrote 153 bytes to input.txt
[PID: 1234] Closed input.txt (fd 3)
[PID: 1234] === PHASE 1 COMPLETE ===
...
[PID: 1234] All concepts demonstrated:
[PID: 1234] [OK] fork() - Process creation (2 children spawned)
[PID: 1234] [OK] execvp() - Process execution (ls and cat executed)
[PID: 1234] [OK] open() - File operations (input.txt, output_log.txt)
[PID: 1234] [OK] close() - File descriptor closing (all closed)
[PID: 1234] [OK] read() - Reading from file descriptors
[PID: 1234] [OK] write() - Writing to file descriptors and stdout
[PID: 1234] [OK] dup2() - File descriptor redirection (stdout, stdin)
[PID: 1234] [OK] wait() - Parent-child synchronization
```

---

## System Requirements

- Unix/Linux environment (or WSL on Windows)
- GCC compiler
- Standard C library with POSIX extensions

---

<div align="center" style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">

## Built with Precision for Educational Excellence

**Created by:** Claude Code (System Programming Assistant)  
**Purpose:** System Programming Course Assignment  
**Status:** Production Ready

</div>

## Summary

---

</div>

This collection represents six comprehensive homework assignments covering:

| # | Topic | Language | Key Concepts |
|---|-------|----------|--------------|
| 01 | p0 Compiler | C | Lexer, Parser, VM, While Loops |
| 02 | MiniLang Compiler | Python | AST, Bytecode, Stack VM |
| 03 | Health & Fitness AI | React + Node.js | JWT, Groq AI, Supabase |
| 04 | LLVM Textbook | C++ | Compiler Theory, LLVM IR |
| 05 | Multi-Threading | C | pthreads, Mutex, Deadlock |
| 06 | System Programming | C | fork, execvp, dup2, POSIX |

### Technologies Used

```
Languages:     C, Python, JavaScript, C++
Frontend:      React, Tailwind CSS, Vite
Backend:       Node.js, Express.js
Database:      Supabase (PostgreSQL)
AI:            Groq SDK (Llama 3.3 70B)
Systems:       LLVM, POSIX/pthreads
```

---