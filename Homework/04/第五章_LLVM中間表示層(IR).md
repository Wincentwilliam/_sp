# 第五章：LLVM 中間表示層 (IR)
## LLVM Intermediate Representation

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

<div align="center">

![Chapter 5](https://img.shields.io/badge/Chapter-5-4CAF50?style=for-the-badge)
![Level](https://img.shields.io/badge/Level-Advanced-2196F3?style=for-the-badge)
![Duration](https://img.shields.io/badge/Duration-2%20weeks-FF9800?style=for-the-badge)

*Mastering LLVM IR Generation*

</div>

---

## Table of Contents

1. [Introduction to LLVM IR](#51-introduction-to-llvm-ir)
2. [LLVM IR Structure](#52-llvm-ir-structure)
3. [LLVM IR Type System](#53-llvm-ir-type-system)
4. [LLVM IR Instructions](#54-llvm-ir-instructions)
5. [SSA Form and Phi Nodes](#55-ssa-form-and-phi-nodes)
6. [Generating LLVM IR from AST](#56-generating-llvm-ir-from-ast)
7. [Working with LLVM IR](#57-working-with-llvm-ir)
8. [Optimization with opt](#58-optimization-with-opt)
9. [Summary](#59-summary)
10. [Exercises](#510-exercises)

---

## 5.1 Introduction to LLVM IR

LLVM IR (Intermediate Representation) is the typed, RISC-like instruction set that serves as the common language between compiler frontends and backends. It is designed to be simultaneously:

- **High-level enough** to express source language constructs
- **Low-level enough** to map efficiently to machine instructions
- **SSA form** for easy optimization
- **Target-independent** for multiple platform support

### 5.1.1 LLVM IR Design Principles

```
┌────────────────────────────────────────────────────────────────────────┐
│                    LLVM IR DESIGN PRINCIPLES                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   1. STRONG TYPING                                                    │
│      • Every value has a well-defined type                              │
│      • Type-safe operations and conversions                             │
│      • Enables aggressive optimization                                   │
│                                                                        │
│   2. SSA FORM (Static Single Assignment)                               │
│      • Each variable assigned exactly once                               │
│      • Phi nodes handle control flow merges                             │
│      • Simplifies data flow analysis                                    │
│                                                                        │
│   3. RISC-LIKE INSTRUCTIONS                                            │
│      • Simple, few instruction types                                    │
│      • Three-address code format                                        │
│      • Unlimited virtual registers                                       │
│                                                                        │
│   4. HIERARCHICAL STRUCTURE                                            │
│      • Module → Function → Basic Block → Instruction                    │
│      • Mirrors program organization                                      │
│      • Enables structured optimization                                   │
│                                                                        │
│   5. PLATFORM INDEPENDENCE                                             │
│      • No target-specific constructs                                    │
│      • Same IR for any source and target                                │
│      • Enables cross-platform optimization                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5.2 LLVM IR Structure

### 5.2.1 Module Organization

```llvm
; ===================================================================
; LLVM IR MODULE STRUCTURE
; ===================================================================

; ┌──────────────────────────────────────────────────────────────────┐
; │                      MODULE HEADER                                │
; │                                                                  │
; │  ; Module name                                                   │
; │  ; Target triple (architecture, vendor, OS)                       │
; │  ; Data layout (endianness, pointer size, etc.)                   │
; │                                                                  │
; │  target datalayout = "e-m:e-i64:64-f80:128-n8:16:32:64-S128"     │
; │  target triple = "x86_64-pc-linux-gnu"                           │
; └──────────────────────────────────────────────────────────────────┘

; ┌──────────────────────────────────────────────────────────────────┐
; │                   GLOBAL VARIABLES                                 │
; │                                                                  │
; │  @global_var = global i32 0                                      │
; │  @constant_str = constant [13 x i8] c"Hello World\00"           │
; │  @external_var = external global i32                              │
; └──────────────────────────────────────────────────────────────────┘

; ┌──────────────────────────────────────────────────────────────────┐
; │                   FUNCTION DEFINITIONS                            │
; │                                                                  │
; │  define i32 @main() {                                            │
; │  entry:                                                          │
; │    ret i32 0                                                     │
; │  }                                                               │
; └──────────────────────────────────────────────────────────────────┘

; ┌──────────────────────────────────────────────────────────────────┐
; │                   FUNCTION DECLARATIONS                           │
; │                                                                  │
; │  declare i32 @printf(i8* %format, ...)                          │
; │  declare void @exit(i32 %status)                                 │
; └──────────────────────────────────────────────────────────────────┘
```

### 5.2.2 Complete Module Example

```llvm
; ===================================================================
; factorial.ll - Complete LLVM IR Module
; ===================================================================

; Module-level declarations
target datalayout = "e-m:e-i64:64-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

; Global variables
@.str_format = private constant [4 x i8] c"%d\0A\00"
@global_init = global i32 42

; ===================================================================
; Function: factorial (int) -> int
; ===================================================================
define i32 @factorial(i32 %n) {
entry:
    ; Compare n <= 1
    %cmp = icmp sle i32 %n, 1
    
    ; Conditional branch
    br i1 %cmp, label %base_case, label %recursive_case

base_case:
    ; Return 1 for base case
    ret i32 1

recursive_case:
    ; Calculate n - 1
    %n_minus_1 = sub i32 %n, 1
    
    ; Recursive call
    %recursive_result = call i32 @factorial(i32 %n_minus_1)
    
    ; Multiply n * factorial(n-1)
    %result = mul i32 %n, %recursive_result
    
    ret i32 %result
}

; ===================================================================
; Function: main () -> int
; ===================================================================
define i32 @main() {
entry:
    ; Call factorial(5)
    %result = call i32 @factorial(i32 5)
    
    ; Print result using printf
    %fmt_ptr = getelementptr inbounds [4 x i8], [4 x i8]* @.str_format, i64 0, i64 0
    %call = call i32 @printf(i8* %fmt_ptr, i32 %result)
    
    ret i32 0
}

; ===================================================================
; Function: factorial_iterative (int) -> int
; ===================================================================
define i32 @factorial_iter(i32 %n) {
entry:
    ; Allocate stack space for accumulator and counter
    %acc_ptr = alloca i32
    %counter_ptr = alloca i32
    
    ; Initialize accumulator to 1
    store i32 1, i32* %acc_ptr
    
    ; Initialize counter to n
    store i32 %n, i32* %counter_ptr
    
    ; Jump to loop condition
    br label %loop_cond

loop_cond:
    ; Load counter
    %counter = load i32, i32* %counter_ptr
    
    ; Check if counter > 0
    %continue = icmp sgt i32 %counter, 0
    br i1 %continue, label %loop_body, label %loop_exit

loop_body:
    ; Load accumulator
    %acc = load i32, i32* %acc_ptr
    
    ; acc = acc * counter
    %new_acc = mul i32 %acc, %counter
    store i32 %new_acc, i32* %acc_ptr
    
    ; counter = counter - 1
    %new_counter = sub i32 %counter, 1
    store i32 %new_counter, i32* %counter_ptr
    
    br label %loop_cond

loop_exit:
    ; Load final result
    %result = load i32, i32* %acc_ptr
    ret i32 %result
}
```

---

## 5.3 LLVM IR Type System

### 5.3.1 Type Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LLVM IR TYPE HIERARCHY                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                              Type                                       │
│                                │                                        │
│         ┌─────────────────────┼─────────────────────┐                │
│         │                     │                     │                    │
│    Primitive             Aggregate             Function                │
│         │                     │                     │                    │
│    ┌────┴────┐           ┌────┴────┐              │                    │
│    │         │           │         │         ┌─────┴─────┐             │
│    ▼         ▼           ▼         ▼         │           │             │
│  void       Integer    Array     Struct   Return     Parameters      │
│  floating   (i1,i8,    [N x T]   {T1,T2}    Type         │             │
│  (f16,f32,  i16,i32,                        │              │             │
│   f64,f128) i64,i128)                      └──────────────┘             │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│  INTEGER TYPES:                                                        │
│  ┌──────┬──────────────────────────────────────────────────────┐     │
│  │  i1  │  1-bit (boolean)                                     │     │
│  │  i8  │  8-bit (byte, char)                                 │     │
│  │  i16 │  16-bit (half word)                                 │     │
│  │  i32 │  32-bit (word, int)                                │     │
│  │  i64 │  64-bit (double word, long)                        │     │
│  └──────┴──────────────────────────────────────────────────────┘     │
│                                                                        │
│  FLOATING-POINT TYPES:                                                │
│  ┌──────────┬────────────────────────────────────────────────┐      │
│  │  half    │  16-bit IEEE 754 half precision                 │      │
│  │  float   │  32-bit IEEE 754 single precision               │      │
│  │  double  │  64-bit IEEE 754 double precision                │      │
│  │  fp128   │  128-bit quadruple precision                    │      │
│  └──────────┴────────────────────────────────────────────────┘      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3.2 Type Examples

```llvm
; Primitive types
i32                      ; 32-bit integer
i64                      ; 64-bit integer
float                    ; 32-bit floating point
double                   ; 64-bit floating point
i8*                      ; Pointer to 8-bit integer

; Array types
[10 x i32]              ; Array of 10 32-bit integers
[3 x [4 x i32]]         ; 2D array: 3x4 matrix
[100 x i8]              ; Byte array (string buffer)

; Structure types
%Point = type { i32, i32 }                    ; Anonymous struct
%Rect = type { %Point, %Point }                ; Using defined types
%Node = type { i32, %Node* }                  ; Self-referential (linked list)

; Vector types (SIMD)
<4 x float>             ; 4-element float vector (SSE)
<8 x i32>              ; 8-element integer vector (AVX)
<16 x i8>              ; 16-element byte vector

; Pointer types
i32*                    ; Pointer to i32
<4 x float>*           ; Pointer to float vector
i8**                   ; Pointer to pointer to i8

; Function types
i32 (i32, i32)         ; Function returning i32, taking two i32s
void (i8*)              ; Function returning void, taking i8*
i32 (i32, ...)          ; Varargs function
```

---

## 5.4 LLVM IR Instructions

### 5.4.1 Instruction Categories

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LLVM IR INSTRUCTION CATEGORIES                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                      BINARY INSTRUCTIONS                       │   │
│   │                                                              │   │
│   │   add  i32  %result, %a, %b        ; Integer addition       │   │
│   │   fadd float %result, %a, %b      ; FP addition            │   │
│   │   sub, mul, sdiv, udiv, srem, urem                         │   │
│   │   fdiv, frem (floating point)                               │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                   BITWISE INSTRUCTIONS                        │   │
│   │                                                              │   │
│   │   and  i32  %result, %a, %b        ; Bitwise AND          │   │
│   │   or   i32  %result, %a, %b        ; Bitwise OR           │   │
│   │   xor  i32  %result, %a, %b        ; Bitwise XOR          │   │
│   │   shl  i32  %result, %a, %b        ; Shift left           │   │
│   │   lshr i32  %result, %a, %b        ; Logical shift right   │   │
│   │   ashr i32  %result, %a, %b        ; Arithmetic shift right│   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                   MEMORY INSTRUCTIONS                         │   │
│   │                                                              │   │
│   │   alloca i32                         ; Stack allocation       │   │
│   │   load i32, i32* %ptr              ; Load from memory       │   │
│   │   store i32 %val, i32* %ptr        ; Store to memory       │   │
│   │   getelementptr i32, i32* %ptr, i32 1 ; Address calculation │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                   CONTROL FLOW INSTRUCTIONS                   │   │
│   │                                                              │   │
│   │   br label %dest                     ; Unconditional branch │   │
│   │   br i1 %cond, label %then, label %else ; Conditional     │   │
│   │   ret i32 %val                        ; Return value        │   │
│   │   ret void                            ; Return void         │   │
│   │   switch i32 %val, label %default [...] ; Multi-way branch │   │
│   │   call i32 @func(i32 %arg)          ; Function call        │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.4.2 Complete Instruction Reference

#### Arithmetic Instructions

```llvm
; Integer arithmetic
%sum = add i32 %a, %b              ; a + b
%dif = sub i32 %a, %b              ; a - b
%prod = mul i32 %a, %b             ; a * b
%quot = sdiv i32 %a, %b            ; Signed division (a / b)
%quot = udiv i32 %a, %b           ; Unsigned division
%rem = srem i32 %a, %b            ; Signed remainder
%rem = urem i32 %a, %b             ; Unsigned remainder

; With overflow flags
%result = add nuw i32 %a, %b       ; No unsigned wrap
%result = add nsw i32 %a, %b       ; No signed wrap
%result = add nuw nsw i32 %a, %b  ; Both flags

; Floating-point arithmetic
%fadd = fadd float %a, %b         ; a + b
%fsub = fsub float %a, %b         ; a - b
%fmul = fmul float %a, %b         ; a * b
%fdiv = fdiv float %a, %b         ; a / b
%frem = frem float %a, %b         ; a % b (FP remainder)
```

#### Comparison Instructions

```llvm
; Integer comparisons (icmp)
%eq = icmp eq i32 %a, %b          ; Equal (==)
%ne = icmp ne i32 %a, %b          ; Not equal (!=)
%ugt = icmp ugt i32 %a, %b       ; Unsigned greater than
%uge = icmp uge i32 %a, %b       ; Unsigned >=
%ult = icmp ult i32 %a, %b       ; Unsigned less than
%ule = icmp ule i32 %a, %b       ; Unsigned <=
%sgt = icmp sgt i32 %a, %b       ; Signed greater than
%sge = icmp sge i32 %a, %b       ; Signed >=
%slt = icmp slt i32 %a, %b        ; Signed less than
%sle = icmp sle i32 %a, %b        ; Signed <=

; Floating-point comparisons (fcmp)
%oeq = fcmp oeq float %a, %b     ; Ordered equal
%one = fcmp one float %a, %b     ; Ordered not equal
%ogt = fcmp ogt float %a, %b     ; Ordered greater than
%oge = fcmp oge float %a, %b    ; Ordered >=
%olt = fcmp olt float %a, %b     ; Ordered less than
%ole = fcmp ole float %a, %b     ; Ordered <=
%uno = fcmp uno float %a, %b     ; Unordered (NaN-aware)
```

#### Memory Instructions

```llvm
; Stack allocation
%ptr = alloca i32                          ; Allocate one i32
%ptr = alloca i32, align 4                ; With alignment
%arr = alloca i32, i32 100                ; Allocate array of 100 i32s
%ptr = alloca i32, i32 %size              ; Variable-size array

; Load and store
%val = load i32, i32* %ptr                ; Load i32 from pointer
%val = load volatile i32, i32* %ptr       ; Volatile (hardware access)
%val = load i32, i32* %ptr, align 4       ; With alignment
store i32 %val, i32* %ptr                 ; Store value to pointer
store volatile i32 %val, i32* %ptr         ; Volatile store
store i32 %val, i32* %ptr, align 4          ; With alignment

; GetElementPtr (GEP) - struct/array indexing
%ptr = getelementptr i32, i32* %arr, i32 %idx        ; arr[idx]
%ptr = getelementptr [10 x i32], [10 x i32]* %arr, i32 0, i32 %idx  ; Array
%ptr = getelementptr %Node, %Node* %node, i32 1      ; node->next
%ptr = getelementptr %Struct, %Struct* %s, i32 0, i32 1 ; s->field1

; Type conversions
%intptr = ptrtoint i32* %ptr to i64        ; Pointer to integer
%ptr = inttoptr i64 %intptr to i32*        ; Integer to pointer
%float = fptrunc double %d to float         ; FP narrowing
%d = fpext float %f to double              ; FP widening
%i = fptosi float %f to i32               ; FP to signed int
%f = sitofp i32 %i to float              ; Signed int to FP
```

---

## 5.5 SSA Form and Phi Nodes

### 5.5.1 The Problem: Control Flow Merges

In SSA form, each variable is assigned exactly once. This creates a challenge when control flow paths merge:

```llvm
; Problem: Which value of %x should we use after the merge?
;
; Without SSA (conceptual, invalid IR):
;     %x = ...        ; First assignment
;     br condition, %then, %else
; then:
;     %x = ...        ; Second assignment - problem!
;     br %merge
; else:
;     %x = ...        ; Third assignment - problem!
;     br %merge
; merge:
;     use %x          ; Which %x?
```

### 5.5.2 Phi Nodes: The Solution

```llvm
; Solution: Phi node selects value based on predecessor
;
; With proper SSA:
entry:
    %cond = icmp ...
    br i1 %cond, label %then, label %else

then:
    %x.then = add i32 %a, 1     ; x = a + 1
    br label %merge

else:
    %x.else = sub i32 %a, 1     ; x = a - 1
    br label %merge

merge:
    ; Phi node: select x based on where we came from
    %x = phi i32 [%x.then, %then], [%x.else, %else]
    ; Now %x has the correct value
    %result = mul i32 %x, 2
```

### 5.5.3 Phi Node Semantics

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PHI NODE SEMANTICS                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   φ(v1, block1, v2, block2, ...)                                     │
│                                                                        │
│   The phi node returns:                                              │
│   • v1 if control came from block1                                   │
│   • v2 if control came from block2                                   │
│   • ...                                                              │
│                                                                        │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │                                                               │   │
│   │                     ┌─────────────┐                          │   │
│   │                     │  entry      │                          │   │
│   │                     └──────┬──────┘                          │   │
│   │                            │                                   │   │
│   │               ┌────────────┼────────────┐                     │   │
│   │               │                         │                     │   │
│   │               ▼                         ▼                     │   │
│   │       ┌───────────────┐         ┌───────────────┐            │   │
│   │       │     then      │         │     else      │            │   │
│   │       │               │         │               │            │   │
│   │       │  %x.then = 1 │         │  %x.else = 2  │            │   │
│   │       └───────┬───────┘         └───────┬───────┘            │   │
│   │               │                         │                     │   │
│   │               └─────────────┬───────────┘                     │   │
│   │                             │                                 │   │
│   │                             ▼                                 │   │
│   │                     ┌─────────────┐                          │   │
│   │                     │   merge     │                          │   │
│   │                     │             │                          │   │
│   │                     │  %x = φ [%x.then, %then],            │   │
│   │                     │         [%x.else, %else]             │   │
│   │                     └─────────────┘                          │   │
│   │                                                               │   │
│   └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5.6 Generating LLVM IR from AST

### 5.6.1 Complete IR Generator

```cpp
// llvm_ir_generator.h
// LLVM IR generation from AST

#ifndef LLVM_IR_GENERATOR_H
#define LLVM_IR_GENERATOR_H

#include "parser.h"
#include <llvm/IR/LLVMContext.h>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>
#include <llvm/IR/Verifier.h>
#include <memory>

class LLVMIRGenerator {
public:
    LLVMIRGenerator();
    std::unique_ptr<llvm::Module> generate(std::unique_ptr<Program>& program);
    
    // Visitor methods
    void visit(Program* node);
    void visit(FunctionDecl* node);
    void visit(VarDecl* node);
    void visit(CompoundStmt* node);
    void visit(IfStmt* node);
    void visit(WhileStmt* node);
    void visit(ForStmt* node);
    void visit(ReturnStmt* node);
    void visit(ExpressionStmt* node);
    
    llvm::Value* visitExpr(Expr* node);
    llvm::Value* visitExpr(IntegerLiteral* node);
    llvm::Value* visitExpr(FloatLiteral* node);
    llvm::Value* visitExpr(Identifier* node);
    llvm::Value* visitExpr(BinaryExpr* node);
    llvm::Value* visitExpr(UnaryExpr* node);
    llvm::Value* visitExpr(CallExpr* node);
    
    llvm::Type* mapType(const std::string& typeName);

private:
    std::unique_ptr<llvm::LLVMContext> context_;
    std::unique_ptr<llvm::Module> module_;
    std::unique_ptr<llvm::IRBuilder<>> builder_;
    
    llvm::Function* currentFunction_;
    std::unordered_map<std::string, llvm::Value*> namedValues_;
    
    llvm::BasicBlock* createBlock(const std::string& name);
    llvm::Value* getVariableValue(const std::string& name);
    void setVariableValue(const std::string& name, llvm::Value* value);
};

#endif // LLVM_IR_GENERATOR_H
```

```cpp
// llvm_ir_generator.cpp
// Implementation of LLVM IR generation

#include "llvm_ir_generator.h"
#include <llvm/IR/Verifier.h>
#include <llvm/Support/raw_ostream.h>
#include <iostream>

using namespace llvm;

LLVMIRGenerator::LLVMIRGenerator() {
    context_ = std::make_unique<LLVMContext>();
    module_ = std::make_unique<Module>("jit_module", *context_);
    builder_ = std::make_unique<IRBuilder<>>(*context_);
}

std::unique_ptr<Module> LLVMIRGenerator::generate(std::unique_ptr<Program>& program) {
    // Process all declarations
    for (auto& decl : program->declarations) {
        if (auto* func = dynamic_cast<FunctionDecl*>(decl.get())) {
            visit(func);
        } else if (auto* var = dynamic_cast<VarDecl*>(decl.get())) {
            visit(var);
        }
    }
    
    // Verify module
    if (verifyModule(*module_, &errs())) {
        errs() << "Module verification failed!\n";
    }
    
    return std::move(module_);
}

Type* LLVMIRGenerator::mapType(const std::string& typeName) {
    if (typeName == "int") return builder_->getInt32Ty();
    if (typeName == "float") return builder_->getFloatTy();
    if (typeName == "double") return builder_->getDoubleTy();
    if (typeName == "char") return builder_->getInt8Ty();
    if (typeName == "void") return builder_->getVoidTy();
    if (typeName == "bool") return builder_->getInt1Ty();
    
    return builder_->getInt32Ty();  // Default
}

void LLVMIRGenerator::visit(Program* node) {
    for (auto& decl : node->declarations) {
        if (auto* func = dynamic_cast<FunctionDecl*>(decl.get())) {
            visit(func);
        } else if (auto* var = dynamic_cast<VarDecl*>(decl.get())) {
            visit(var);
        }
    }
}

void LLVMIRGenerator::visit(FunctionDecl* node) {
    // Create function type
    std::vector<Type*> paramTypes;
    for (auto& param : node->params) {
        paramTypes.push_back(mapType(param.first));
    }
    
    FunctionType* funcType = FunctionType::get(
        mapType(node->returnType),
        paramTypes,
        false
    );
    
    // Create function
    Function* func = Function::Create(
        funcType,
        Function::ExternalLinkage,
        node->name,
        module_.get()
    );
    
    // Name arguments
    auto argIt = func->arg_begin();
    for (auto& param : node->params) {
        argIt->setName(param.second);
        namedValues_[param.second] = argIt;
        ++argIt;
    }
    
    // Save context
    Function* prevFunc = currentFunction_;
    currentFunction_ = func;
    
    // Create entry block
    BasicBlock* entry = BasicBlock::Create(*context_, "entry", func);
    builder_->SetInsertPoint(entry);
    
    // Generate body
    if (node->body) {
        visit(node->body.get());
    }
    
    // If no return, add one
    if (builder_->GetInsertBlock()->getTerminator() == nullptr) {
        if (node->returnType == "void") {
            builder_->CreateRetVoid();
        } else {
            builder_->CreateRet(Constant::getNullValue(mapType(node->returnType)));
        }
    }
    
    // Verify function
    if (verifyFunction(*func, &errs())) {
        errs() << "Function verification failed: " << node->name << "\n";
    }
    
    // Restore context
    currentFunction_ = prevFunc;
    namedValues_.clear();
    
    // Re-add function arguments
    for (auto& param : node->params) {
        namedValues_[param.second] = func->getValueSymbolTable()->lookup(param.second);
    }
}

void LLVMIRGenerator::visit(VarDecl* node) {
    Type* varType = mapType(node->type);
    
    if (node->arraySize > 0) {
        varType = ArrayType::get(varType, node->arraySize);
    }
    
    // Create alloca in entry block
    BasicBlock* entry = &currentFunction_->getEntryBlock();
    builder_->SetInsertPoint(&entry->back());
    
    AllocaInst* alloca = builder_->CreateAlloca(varType, nullptr, node->name);
    setVariableValue(node->name, alloca);
    
    // Initialize to zero
    builder_->CreateStore(Constant::getNullValue(varType), alloca);
}

void LLVMIRGenerator::visit(CompoundStmt* node) {
    for (auto& stmt : node->statements) {
        if (auto* exprStmt = dynamic_cast<ExpressionStmt*>(stmt.get())) {
            visit(exprStmt);
        } else if (auto* ifStmt = dynamic_cast<IfStmt*>(stmt.get())) {
            visit(ifStmt);
        } else if (auto* whileStmt = dynamic_cast<WhileStmt*>(stmt.get())) {
            visit(whileStmt);
        } else if (auto* forStmt = dynamic_cast<ForStmt*>(stmt.get())) {
            visit(forStmt);
        } else if (auto* retStmt = dynamic_cast<ReturnStmt*>(stmt.get())) {
            visit(retStmt);
        }
    }
}

void LLVMIRGenerator::visit(IfStmt* node) {
    // Generate condition
    Value* cond = visitExpr(node->condition.get());
    
    // Create blocks
    BasicBlock* thenBlock = createBlock("if.then");
    BasicBlock* elseBlock = node->elseBranch ? createBlock("if.else") : nullptr;
    BasicBlock* mergeBlock = createBlock("if.end");
    
    // Conditional branch
    if (elseBlock) {
        builder_->CreateCondBr(cond, thenBlock, elseBlock);
    } else {
        builder_->CreateCondBr(cond, thenBlock, mergeBlock);
    }
    
    // Generate then block
    builder_->SetInsertPoint(thenBlock);
    visit(node->thenBranch.get());
    if (!builder_->GetInsertBlock()->getTerminator()) {
        builder_->CreateBr(mergeBlock);
    }
    
    // Generate else block
    if (elseBlock) {
        builder_->SetInsertPoint(elseBlock);
        visit(node->elseBranch.get());
        if (!builder_->GetInsertBlock()->getTerminator()) {
            builder_->CreateBr(mergeBlock);
        }
    }
    
    // Continue at merge block
    builder_->SetInsertPoint(mergeBlock);
}

void LLVMIRGenerator::visit(WhileStmt* node) {
    // Create blocks
    BasicBlock* loopCond = createBlock("while.cond");
    BasicBlock* loopBody = createBlock("while.body");
    BasicBlock* loopEnd = createBlock("while.end");
    
    // Jump to condition
    builder_->CreateBr(loopCond);
    
    // Generate condition
    builder_->SetInsertPoint(loopCond);
    Value* cond = visitExpr(node->condition.get());
    builder_->CreateCondBr(cond, loopBody, loopEnd);
    
    // Generate body
    builder_->SetInsertPoint(loopBody);
    visit(node->body.get());
    if (!builder_->GetInsertBlock()->getTerminator()) {
        builder_->CreateBr(loopCond);
    }
    
    // Continue at end
    builder_->SetInsertPoint(loopEnd);
}

void LLVMIRGenerator::visit(ReturnStmt* node) {
    if (node->expr) {
        Value* retVal = visitExpr(node->expr.get());
        builder_->CreateRet(retVal);
    } else {
        builder_->CreateRetVoid();
    }
}

void LLVMIRGenerator::visit(ExpressionStmt* node) {
    if (node->expr) {
        visitExpr(node->expr.get());
    }
}

// ============================================================================
// EXPRESSION GENERATION
// ============================================================================

Value* LLVMIRGenerator::visitExpr(Expr* node) {
    switch (node->type) {
        case ExprType::INTEGER_LITERAL:
            return visitExpr(static_cast<IntegerLiteral*>(node));
        case ExprType::FLOAT_LITERAL:
            return visitExpr(static_cast<FloatLiteral*>(node));
        case ExprType::IDENTIFIER:
            return visitExpr(static_cast<Identifier*>(node));
        case ExprType::BINARY:
            return visitExpr(static_cast<BinaryExpr*>(node));
        case ExprType::UNARY:
            return visitExpr(static_cast<UnaryExpr*>(node));
        case ExprType::CALL:
            return visitExpr(static_cast<CallExpr*>(node));
        default:
            return builder_->getInt32(0);
    }
}

Value* LLVMIRGenerator::visitExpr(IntegerLiteral* node) {
    return builder_->getInt32(node->value);
}

Value* LLVMIRGenerator::visitExpr(FloatLiteral* node) {
    return ConstantFP::get(*context_, APFloat(node->value));
}

Value* LLVMIRGenerator::visitExpr(Identifier* node) {
    return getVariableValue(node->name);
}

Value* LLVMIRGenerator::visitExpr(BinaryExpr* node) {
    Value* left = visitExpr(node->left.get());
    Value* right = visitExpr(node->right.get());
    
    bool isFloat = left->getType()->isFloatTy() || 
                   right->getType()->isFloatTy();
    
    switch (node->op) {
        case BinaryOp::ADD:
            return isFloat ? builder_->CreateFAdd(left, right, "fadd") 
                          : builder_->CreateAdd(left, right, "add");
        case BinaryOp::SUB:
            return isFloat ? builder_->CreateFSub(left, right, "fsub") 
                          : builder_->CreateSub(left, right, "sub");
        case BinaryOp::MUL:
            return isFloat ? builder_->CreateFMul(left, right, "fmul") 
                          : builder_->CreateMul(left, right, "mul");
        case BinaryOp::DIV:
            return isFloat ? builder_->CreateFDiv(left, right, "fdiv") 
                          : builder_->CreateSDiv(left, right, "sdiv");
        case BinaryOp::MOD:
            return builder_->CreateSRem(left, right, "srem");
        case BinaryOp::LT:
            return isFloat ? builder_->CreateFCmpOLT(left, right, "flt") 
                          : builder_->CreateICmpSLT(left, right, "lt");
        case BinaryOp::GT:
            return isFloat ? builder_->CreateFCmpOGT(left, right, "fgt") 
                          : builder_->CreateICmpSGT(left, right, "gt");
        case BinaryOp::LE:
            return isFloat ? builder_->CreateFCmpOLE(left, right, "fle") 
                          : builder_->CreateICmpSLE(left, right, "le");
        case BinaryOp::GE:
            return isFloat ? builder_->CreateFCmpOGE(left, right, "fge") 
                          : builder_->CreateICmpSGE(left, right, "ge");
        case BinaryOp::EQ:
            return isFloat ? builder_->CreateFCmpOEQ(left, right, "feq") 
                          : builder_->CreateICmpEQ(left, right, "eq");
        case BinaryOp::NE:
            return isFloat ? builder_->CreateFCmpONE(left, right, "fne") 
                          : builder_->CreateICmpNE(left, right, "ne");
        case BinaryOp::AND:
            return builder_->CreateAnd(left, right, "and");
        case BinaryOp::OR:
            return builder_->CreateOr(left, right, "or");
        case BinaryOp::ASSIGN: {
            // Handle assignment
            if (auto* ident = dynamic_cast<Identifier*>(node->left.get())) {
                Value* ptr = getVariableValue(ident->name);
                builder_->CreateStore(right, ptr);
            }
            return right;
        }
        default:
            return left;
    }
}

Value* LLVMIRGenerator::visitExpr(CallExpr* node) {
    Function* callee = module_->getFunction(node->callee);
    if (!callee) {
        errs() << "Unknown function: " << node->callee << "\n";
        return builder_->getInt32(0);
    }
    
    std::vector<Value*> args;
    for (auto& arg : node->args) {
        args.push_back(visitExpr(arg.get()));
    }
    
    return builder_->CreateCall(callee, args, "call");
}

// ============================================================================
// HELPER METHODS
// ============================================================================

BasicBlock* LLVMIRGenerator::createBlock(const std::string& name) {
    return BasicBlock::Create(*context_, name, currentFunction_);
}

Value* LLVMIRGenerator::getVariableValue(const std::string& name) {
    auto it = namedValues_.find(name);
    if (it != namedValues_.end()) {
        // If it's a pointer, load the value
        if (isa<AllocaInst>(it->second)) {
            return builder_->CreateLoad(it->second->getType()->getPointerElementType(),
                                        it->second, name);
        }
        return it->second;
    }
    
    // Check for function arguments
    if (currentFunction_) {
        for (auto& arg : currentFunction_->args()) {
            if (arg.getName() == name) {
                return &arg;
            }
        }
    }
    
    errs() << "Unknown variable: " << name << "\n";
    return builder_->getInt32(0);
}

void LLVMIRGenerator::setVariableValue(const std::string& name, Value* value) {
    namedValues_[name] = value;
}
```

---

## 5.7 Working with LLVM IR

### 5.7.1 LLVM Tool Usage

```bash
# Assemble .ll to .bc
llvm-as hello.ll -o hello.bc

# Disassemble .bc to .ll
llvm-dis hello.bc -o hello.ll

# Link multiple .bc files
llvm-link file1.bc file2.bc -o combined.bc

# Compile IR to native assembly
llc -O2 hello.ll -o hello.s

# Compile IR to object file
llc -O2 -filetype=obj hello.ll -o hello.o

# Execute IR directly (interpreter)
lli hello.bc
```

### 5.7.2 Optimization with opt

```bash
# Standard optimization (-O2 equivalent)
opt -S -O2 hello.ll -o hello_opt.ll

# Run specific passes
opt -S -passes=instcombine hello.ll -o hello_opt.ll
opt -S -passes='gvn,dce' hello.ll -o hello_opt.ll

# View available passes
opt --help | grep -A5 'Passes:'

# Statistics
opt -S -stats hello.ll 2>&1 | head -20
```

---

## 5.8 Optimization with opt

### 5.8.1 Common Optimization Passes

```bash
# Instruction combining
opt -passes=instcombine hello.ll

# Dead code elimination
opt -passes=dce hello.ll

# Dead store elimination
opt -passes=dse hello.ll

# Global value numbering (common subexpression elimination)
opt -passes=gvn hello.ll

# Sparse conditional constant propagation
opt -passes=scp hello.ll

# Function inlining
opt -passes=inline hello.ll

# Loop unrolling
opt -passes=loop-unroll hello.ll

# Loop vectorization
opt -passes=loop-vectorize hello.ll

# Combine multiple passes
opt -passes='default<O2>' hello.ll

# Custom pipeline
opt -passes='mem2reg,instcombine,gvn,dce,simplifycfg' hello.ll
```

### 5.8.2 Optimization Effect Example

```llvm
; Before optimization
define i32 @example(i32 %a, i32 %b) {
entry:
  %t1 = add i32 %a, 0      ; Redundant add
  %t2 = add i32 %t1, 0      ; Redundant add
  %t3 = mul i32 %t2, 1      ; Redundant multiply
  ret i32 %t3
}

; After optimization (opt -O2)
define i32 @example(i32 %a, i32 %b) {
entry:
  ret i32 %a
}
```

---

## 5.9 Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CHAPTER 5 KEY POINTS                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✅ LLVM IR is a typed, SSA-based intermediate representation        │
│                                                                        │
│  ✅ LLVM IR provides rich type system including primitives, arrays,   │
│     structs, vectors, and functions                                   │
│                                                                        │
│  ✅ All LLVM instructions have at most three operands (3-address)   │
│                                                                        │
│  ✅ SSA form simplifies optimization; phi nodes handle CFG merges   │
│                                                                        │
│  ✅ LLVM C++ API enables programmatic IR generation                  │
│                                                                        │
│  ✅ opt tool provides comprehensive optimization passes               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5.10 Exercises

### Exercise 5.1: IR Generation ⭐⭐

**Objective:** Generate LLVM IR for various constructs

**Task:** Write a C++ program that generates LLVM IR for:
1. A recursive factorial function
2. An iterative sum function
3. A function with if-else statements

---

### Exercise 5.2: Manual IR Writing ⭐⭐

**Objective:** Write LLVM IR directly

**Task:** Write the following in LLVM IR:
1. GCD function
2. String length function
3. Fibonacci (recursive)

Compile and run using `llc`.

---

### Exercise 5.3: Optimization Analysis ⭐⭐

**Objective:** Analyze optimization effects

**Task:** Write a function with optimization opportunities and observe:
1. Dead code elimination
2. Constant folding
3. Common subexpression elimination

---

### Exercise 5.4: Phi Node Generation ⭐⭐⭐

**Objective:** Handle control flow merges

**Task:** Generate LLVM IR for:
1. If-else returning values
2. Loop with accumulation
3. Case statement using switches

---

**[Next Chapter: 第六章_目標程式碼生成.md](第六章_目標程式碼生成.md)**

---

*Chapter 5 Complete*
