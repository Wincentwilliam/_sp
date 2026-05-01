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
