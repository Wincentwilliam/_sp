# 第五章：LLVM 中間表示層 (IR) (LLVM Intermediate Representation)

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

## 5.1 Understanding LLVM IR

LLVM IR (Intermediate Representation) is the core of the LLVM project. It is a typed, RISC-like instruction set that serves as the common language between compiler frontends and backends.

### 5.1.1 IR Design Goals

| Goal | Description |
|------|-------------|
| **Low-level** | Close to machine operations |
| **Typed** | Every value has a well-defined type |
| **SSA form** | Static Single Assignment for easy optimization |
| **Hierarchy** | Structured control flow with basic blocks |
| **Extensible** | Metadata and attributes |

### 5.1.2 IR Characteristics

```llvm
; LLVM IR Example
; factorial.ll

; Global variable
@global_var = global i32 0

; Function declaration
declare i32 @printf(i8* %format, ...)

; Function definition with metadata
define i32 @factorial(i32 %n) #0 {
entry:
  %cmp = icmp sle i32 %n, 1
  br i1 %cmp, label %return_base, label %recurse

return_base:
  ret i32 1

recurse:
  %dec = sub i32 %n, 1
  %rec_result = call i32 @factorial(i32 %dec)
  %result = mul i32 %n, %rec_result
  ret i32 %result
}

; Function with attributes
define i32 @main() #0 {
entry:
  %result = call i32 @factorial(i32 5)
  ret i32 %result
}

attributes #0 = { nounwind "frame-pointer"="none" }
```

## 5.2 LLVM IR Type System

### 5.2.1 Primitive Types

| Type | Width | Description |
|------|-------|-------------|
| `void` | 0 | No value |
| `i1` | 1 bit | Boolean |
| `i8` | 8 bits | Byte |
| `i16` | 16 bits | Half word |
| `i32` | 32 bits | Word |
| `i64` | 64 bits | Double word |
| `half` | 16 bits | Half precision float |
| `float` | 32 bits | Single precision float |
| `double` | 64 bits | Double precision float |
| `fp128` | 128 bits | Quad precision float |
| `x86_fp80` | 80 bits | x86 extended precision |
| `ppc_fp128` | 128 bits | PowerPC 128-bit |

### 5.2.2 Aggregate Types

```llvm
; Array type
[10 x i32]          ; Array of 10 32-bit integers
[3 x [4 x i32]]     ; 2D array: 3 rows of 4 integers

; Vector type (SIMD)
<4 x float>         ; 4-element float vector
<8 x i32>          ; 8-element integer vector

; Structure type
%struct.Point = type { i32, i32 }           ; Anonymous struct
%Point = type { i32, i32 }
%Node = type { i32, %Node* }                ; Self-referential (linked list)

; Pointer type
i32*                 ; Pointer to i32
<4 x float>*         ; Pointer to float vector
%struct.Node**       ; Pointer to pointer to Node
```

### 5.2.3 Function Types

```llvm
; (return_type)(arg1_type, arg2_type, ...)
i32 (i32, i32)              ; Function returning i32, taking two i32s
i32 (i32*)                  ; Function returning i32, taking pointer to i32
void (i8*)                  ; Function returning void
i32 (...)                   ; Varargs function
```

## 5.3 LLVM IR Instructions

### 5.3.1 Binary Instructions

```llvm
; Arithmetic operations
%sum = add i32 %a, %b           ; Addition
%dif = sub i32 %a, %b           ; Subtraction
%prod = mul i32 %a, %b          ; Multiplication
%quot = sdiv i32 %a, %b         ; Signed division
%rem = srem i32 %a, %b          ; Signed remainder
%and = and i32 %a, %b           ; Bitwise AND
%or = or i32 %a, %b             ; Bitwise OR
%xor = xor i32 %a, %b           ; Bitwise XOR
%shl = shl i32 %a, %b           ; Shift left
%lshr = lshr i32 %a, %b        ; Logical shift right
%ashr = ashr i32 %a, %b        ; Arithmetic shift right

; Floating-point arithmetic
%fadd = fadd float %a, %b      ; FP addition
%fsub = fsub float %a, %b      ; FP subtraction
%fmul = fmul float %a, %b      ; FP multiplication
%fdiv = fdiv float %a, %b      ; FP division
%frem = frem float %a, %b      ; FP remainder
```

### 5.3.2 Comparison Instructions

```llvm
; Integer comparisons
%eq = icmp eq i32 %a, %b        ; Equal
%ne = icmp ne i32 %a, %b       ; Not equal
%ugt = icmp ugt i32 %a, %b     ; Unsigned greater than
%uge = icmp uge i32 %a, %b     ; Unsigned greater or equal
%ult = icmp ult i32 %a, %b     ; Unsigned less than
%ule = icmp ule i32 %a, %b     ; Unsigned less or equal
%sgt = icmp sgt i32 %a, %b     ; Signed greater than
%sge = icmp sge i32 %a, %b     ; Signed greater or equal
%slt = icmp slt i32 %a, %b     ; Signed less than
%sle = icmp sle i32 %a, %b     ; Signed less or equal

; Floating-point comparisons
%foeq = fcmp oeq float %a, %b  ; Ordered equal
%fogt = fcmp ogt float %a, %b ; Ordered greater than
%fone = fcmp one float %a, %b  ; Ordered not equal
%funo = fcmp uno float %a, %b ; Unordered (NaN involved)
```

### 5.3.3 Memory Instructions

```llvm
; Alloca - stack allocation
%ptr = alloca i32              ; Allocate one i32 on stack
%arr = alloca i32, i32 10      ; Allocate array of 10 i32s

; Load and Store
%val = load i32, i32* %ptr      ; Load i32 from pointer
store i32 %val, i32* %ptr       ; Store i32 to pointer

; GetElementPtr - indexing into aggregates
%node = load %Node*, %Node** @head
%next = getelementptr %Node, %Node* %node, i32 1   ; Point to next
%field = getelementptr %Node, %Node* %node, i32 0, i32 1  ; Second field

; Bitcast
%intptr = ptrtoint i32* %ptr to i64
%newptr = inttoptr i64 %intptr to i32*
```

### 5.3.4 Control Flow Instructions

```llvm
; Unconditional branch
br label %dest

; Conditional branch
%cmp = icmp ne i32 %a, 0
br i1 %cmp, label %then, label %else

; Indirect branch
switch i32 %val, label %default [
  i32 0, label %zero
  i32 1, label %one
  i32 2, label %two
]

; Function call
%result = call i32 @function(i32 %arg1, i32 %arg2)
call void @printf(i8* getelementptr([6 x i8], [6 x i8]* @.str, i32 0, i32 0))

; Return
ret i32 %val
ret void

; Invoke (with exception handling)
%result = invoke i32 @might_throw(i32 %arg)
        to label %normal continuation
        unwind label %exception
```

## 5.4 SSA Form and Phi Nodes

LLVM IR uses Static Single Assignment (SSA) form, where each variable is assigned exactly once.

### 5.4.1 Why SSA?

Without SSA, a simple if-else would cause problems:

```llvm
; WITHOUT SSA (invalid LLVM IR)
entry:
  %x = ...
  br condition, label %then, label %else

then:
  %x = add i32 %x, 1    ; Reassignment of x!
  br label %merge

else:
  %x = sub i32 %x, 1    ; Another reassignment!
  br label %merge

merge:
  ; Which x should we use here?
  use i32 %x
```

### 5.4.2 Phi Nodes

Phi nodes select a value based on the control flow predecessor:

```llvm
; WITH SSA (correct LLVM IR)
entry:
  %x = ...
  br label %then

then:
  %x.then = add i32 %x, 1
  br label %merge

else:
  %x.else = sub i32 %x, 1
  br label %merge

merge:
  %x = phi i32 [%x.then, %then], [%x.else, %else]
  ; Now %x has the correct value based on where we came from
  use i32 %x
```

### 5.4.3 Phi Node Semantics

```
phi [value1, block1], [value2, block2], ...

The value chosen is the one corresponding to the block
from which control flow reached this point.
```

## 5.5 Generating LLVM IR from AST

Now let's build a complete LLVM IR generator from our AST.

### 5.5.1 IR Generator Header

```cpp
// LLVMIRGenerator.h
#ifndef LLVMIRGENERATOR_H
#define LLVMIRGENERATOR_H

#include "AST.h"
#include "SymbolTable.h"
#include <llvm/IR/LLVMContext.h>
#include <llvm/IR/IRBuilder.h>
#include <llvm/IR/Module.h>
#include <memory>

class LLVMIRGenerator {
public:
    LLVMIRGenerator();
    std::unique_ptr<llvm::Module> generate(std::unique_ptr<Program>& program);
    
    // Type mapping
    llvm::Type* mapType(const std::string& typeStr);
    
private:
    std::unique_ptr<llvm::LLVMContext> context;
    std::unique_ptr<llvm::Module> module;
    std::unique_ptr<llvm::IRBuilder<>> builder;
    SymbolTable symbolTable;
    
    // Current function context
    llvm::Function* currentFunction;
    
    // Value mapping (AST -> LLVM values)
    std::unordered_map<std::string, llvm::Value*> namedValues;
    
    // Generate functions
    llvm::Function* generateFunction(FunctionDeclaration* node);
    void generateVarDecl(VarDeclaration* node);
    void generateCompoundStmt(CompoundStmt* node);
    void generateSelectionStmt(SelectionStmt* node);
    void generateIterationStmt(IterationStmt* node);
    void generateReturnStmt(ReturnStmt* node);
    void generateExpressionStmt(ExpressionStmt* node);
    
    // Expression generation
    llvm::Value* generateExpr(Expr* node);
    llvm::Value* generateIntegerLiteral(IntegerLiteral* node);
    llvm::Value* generateFloatLiteral(FloatLiteral* node);
    llvm::Value* generateIdentifier(Identifier* node);
    llvm::Value* generateBinaryExpr(BinaryExpr* node);
    llvm::Value* generateCallExpr(CallExpr* node);
    
    // Helper
    llvm::BasicBlock* createBasicBlock(const std::string& name);
};

#endif // LLVMIRGENERATOR_H
```

### 5.5.2 IR Generator Implementation

```cpp
// LLVMIRGenerator.cpp
#include "LLVMIRGenerator.h"
#include <llvm/IR/Verifier.h>
#include <llvm/Support/raw_ostream.h>

using namespace llvm;

LLVMIRGenerator::LLVMIRGenerator() {
    context = std::make_unique<LLVMContext>();
    module = std::make_unique<Module>("my_module", *context);
    builder = std::make_unique<IRBuilder<>>(*context);
}

std::unique_ptr<Module> LLVMIRGenerator::generate(std::unique_ptr<Program>& program) {
    // Process all declarations
    for (auto& decl : program->declarations) {
        if (auto* func = dynamic_cast<FunctionDeclaration*>(decl.get())) {
            generateFunction(func);
        } else if (auto* var = dynamic_cast<VarDeclaration*>(decl.get())) {
            generateVarDecl(var);
        }
    }
    
    // Verify module
    if (verifyModule(*module, &errs())) {
        errs() << "Module verification failed!\n";
    }
    
    return std::move(module);
}

Type* LLVMIRGenerator::mapType(const std::string& typeStr) {
    if (typeStr == "int") return builder->getInt32Ty();
    if (typeStr == "float") return builder->getFloatTy();
    if (typeStr == "void") return builder->getVoidTy();
    if (typeStr == "char") return builder->getInt8Ty();
    if (typeStr == "double") return builder->getDoubleTy();
    
    return builder->getInt32Ty();  // Default
}

Function* LLVMIRGenerator::generateFunction(FunctionDeclaration* node) {
    // Create function type
    std::vector<Type*> paramTypes;
    for (auto& param : node->params) {
        paramTypes.push_back(mapType(param.first));
    }
    
    FunctionType* funcType = FunctionType::get(
        mapType(node->returnType),
        paramTypes,
        false  // Not vararg
    );
    
    // Create function
    Function* func = Function::Create(
        funcType,
        Function::ExternalLinkage,
        node->name,
        module.get()
    );
    
    // Set names for arguments
    auto argIt = func->arg_begin();
    for (auto& param : node->params) {
        argIt->setName(param.second);
        ++argIt;
    }
    
    // Save current context
    Function* oldFunction = currentFunction;
    currentFunction = func;
    
    // Create entry block
    BasicBlock* entry = BasicBlock::Create(*context, "entry", func);
    builder->SetInsertPoint(entry);
    
    // Clear named values and add function arguments
    namedValues.clear();
    argIt = func->arg_begin();
    for (auto& param : node->params) {
        namedValues[param.second] = argIt;
        ++argIt;
    }
    
    // Generate body
    if (node->body) {
        generateCompoundStmt(node->body.get());
    }
    
    // Verify function
    if (verifyFunction(*func, &errs())) {
        errs() << "Function verification failed: " << node->name << "\n";
    }
    
    // Restore context
    currentFunction = oldFunction;
    
    return func;
}

void LLVMIRGenerator::generateVarDecl(VarDeclaration* node) {
    Type* varType = mapType(node->type);
    
    // For simplicity, we create global variables
    GlobalVariable* gv = new GlobalVariable(
        *module,
        varType,
        false,  // Not constant
        GlobalValue::ExternalLinkage,
        nullptr,  // No initializer
        node->name
    );
    
    // Also add to symbol table
    symbolTable.insert(node->name, std::make_shared<Symbol>(
        node->name, SymbolKind::VARIABLE, mapType(node->type), 0, 0
    ), 0);
}

void LLVMIRGenerator::generateCompoundStmt(CompoundStmt* node) {
    // Handle declarations
    for (auto& decl : node->declarations) {
        if (auto* varDecl = dynamic_cast<VarDeclaration*>(decl.get())) {
            generateVarDecl(varDecl);
        }
    }
    
    // Handle statements
    for (auto& stmt : node->statements) {
        if (auto* exprStmt = dynamic_cast<ExpressionStmt*>(stmt.get())) {
            generateExpressionStmt(exprStmt);
        } else if (auto* selStmt = dynamic_cast<SelectionStmt*>(stmt.get())) {
            generateSelectionStmt(selStmt);
        } else if (auto* iterStmt = dynamic_cast<IterationStmt*>(stmt.get())) {
            generateIterationStmt(iterStmt);
        } else if (auto* retStmt = dynamic_cast<ReturnStmt*>(stmt.get())) {
            generateReturnStmt(retStmt);
        }
    }
}

void LLVMIRGenerator::generateSelectionStmt(SelectionStmt* node) {
    Function* func = builder->GetInsertBlock()->getParent();
    
    // Create blocks
    BasicBlock* thenBlock = createBasicBlock("if.then");
    BasicBlock* elseBlock = node->elseBranch ? createBasicBlock("if.else") : nullptr;
    BasicBlock* mergeBlock = createBasicBlock("if.end");
    
    // Generate condition
    Value* cond = generateExpr(node->condition.get());
    
    // Branch based on condition
    if (elseBlock) {
        builder->CreateCondBr(cond, thenBlock, elseBlock);
    } else {
        builder->CreateCondBr(cond, thenBlock, mergeBlock);
    }
    
    // Generate then block
    builder->SetInsertPoint(thenBlock);
    generateStmt(node->thenBranch.get());
    builder->CreateBr(mergeBlock);
    
    // Generate else block
    if (elseBlock) {
        builder->SetInsertPoint(elseBlock);
        generateStmt(node->elseBranch.get());
        builder->CreateBr(mergeBlock);
    }
    
    // Continue at merge block
    builder->SetInsertPoint(mergeBlock);
}

void LLVMIRGenerator::generateIterationStmt(IterationStmt* node) {
    Function* func = builder->GetInsertBlock()->getParent();
    
    // Create blocks
    BasicBlock* loopBlock = createBasicBlock("while.loop");
    BasicBlock* bodyBlock = createBasicBlock("while.body");
    BasicBlock* endBlock = createBasicBlock("while.end");
    
    // Branch to loop condition
    builder->CreateBr(loopBlock);
    
    // Generate condition
    builder->SetInsertPoint(loopBlock);
    Value* cond = generateExpr(node->condition.get());
    builder->CreateCondBr(cond, bodyBlock, endBlock);
    
    // Generate body
    builder->SetInsertPoint(bodyBlock);
    generateStmt(node->body.get());
    builder->CreateBr(loopBlock);
    
    // Continue at end block
    builder->SetInsertPoint(endBlock);
}

void LLVMIRGenerator::generateReturnStmt(ReturnStmt* node) {
    if (node->expr) {
        Value* retVal = generateExpr(node->expr.get());
        builder->CreateRet(retVal);
    } else {
        builder->CreateRetVoid();
    }
}

void LLVMIRGenerator::generateExpressionStmt(ExpressionStmt* node) {
    if (node->expr) {
        generateExpr(node->expr.get());
    }
}

Value* LLVMIRGenerator::generateIntegerLiteral(IntegerLiteral* node) {
    return builder->getInt32(node->value);
}

Value* LLVMIRGenerator::generateFloatLiteral(FloatLiteral* node) {
    return ConstantFP::get(*context, APFloat(node->value));
}

Value* LLVMIRGenerator::generateIdentifier(Identifier* node) {
    // Look up in named values
    auto it = namedValues.find(node->name);
    if (it != namedValues.end()) {
        return it->second;
    }
    
    // Look up global variable
    GlobalVariable* gv = module->getGlobalVariable(node->name);
    if (gv) {
        return builder->CreateLoad(gv->getValueType(), gv, node->name);
    }
    
    errs() << "Unknown variable: " << node->name << "\n";
    return builder->getInt32(0);
}

Value* LLVMIRGenerator::generateBinaryExpr(BinaryExpr* node) {
    Value* left = generateExpr(node->left.get());
    Value* right = generateExpr(node->right.get());
    
    switch (node->op) {
        case OpType::ADD:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateAdd(left, right, "addtmp");
            } else {
                return builder->CreateFAdd(left, right, "addtmp");
            }
            
        case OpType::SUB:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateSub(left, right, "subtmp");
            } else {
                return builder->CreateFSub(left, right, "subtmp");
            }
            
        case OpType::MUL:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateMul(left, right, "multmp");
            } else {
                return builder->CreateFMul(left, right, "multmp");
            }
            
        case OpType::DIV:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateSDiv(left, right, "divtmp");
            } else {
                return builder->CreateFDiv(left, right, "divtmp");
            }
            
        case OpType::LT:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateICmpSLT(left, right, "cmptmp");
            } else {
                return builder->CreateFCmpOLT(left, right, "cmptmp");
            }
            
        case OpType::GT:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateICmpSGT(left, right, "cmptmp");
            } else {
                return builder->CreateFCmpOGT(left, right, "cmptmp");
            }
            
        case OpType::EQ:
            if (left->getType()->isIntegerTy()) {
                return builder->CreateICmpEQ(left, right, "cmptmp");
            } else {
                return builder->CreateFCmpOEQ(left, right, "cmptmp");
            }
            
        case OpType::ASSIGN:
            // Handle assignment
            if (auto* ident = dynamic_cast<Identifier*>(node->left.get())) {
                auto it = namedValues.find(ident->name);
                if (it != namedValues.end()) {
                    builder->CreateStore(right, it->second);
                    return right;
                }
            }
            return right;
            
        default:
            errs() << "Unsupported binary operator\n";
            return left;
    }
}

Value* LLVMIRGenerator::generateCallExpr(CallExpr* node) {
    Function* callee = module->getFunction(node->callee);
    if (!callee) {
        errs() << "Unknown function: " << node->callee << "\n";
        return builder->getInt32(0);
    }
    
    std::vector<Value*> args;
    for (auto& arg : node->args) {
        args.push_back(generateExpr(arg.get()));
    }
    
    return builder->CreateCall(callee, args, "calltmp");
}

Value* LLVMIRGenerator::generateExpr(Expr* node) {
    switch (node->type) {
        case ExprType::INTEGER_LITERAL:
            return generateIntegerLiteral(static_cast<IntegerLiteral*>(node));
        case ExprType::FLOAT_LITERAL:
            return generateFloatLiteral(static_cast<FloatLiteral*>(node));
        case ExprType::IDENTIFIER:
            return generateIdentifier(static_cast<Identifier*>(node));
        case ExprType::BINARY:
            return generateBinaryExpr(static_cast<BinaryExpr*>(node));
        case ExprType::CALL:
            return generateCallExpr(static_cast<CallExpr*>(node));
        default:
            return builder->getInt32(0);
    }
}

BasicBlock* LLVMIRGenerator::createBasicBlock(const std::string& name) {
    return BasicBlock::Create(*context, name, currentFunction);
}

void LLVMIRGenerator::generateStmt(Stmt* stmt) {
    if (auto* exprStmt = dynamic_cast<ExpressionStmt*>(stmt)) {
        generateExpressionStmt(exprStmt);
    } else if (auto* compStmt = dynamic_cast<CompoundStmt*>(stmt)) {
        generateCompoundStmt(compStmt);
    } else if (auto* selStmt = dynamic_cast<SelectionStmt*>(stmt)) {
        generateSelectionStmt(selStmt);
    } else if (auto* iterStmt = dynamic_cast<IterationStmt*>(stmt)) {
        generateIterationStmt(iterStmt);
    } else if (auto* retStmt = dynamic_cast<ReturnStmt*>(stmt)) {
        generateReturnStmt(retStmt);
    }
}
```

## 5.6 Working with LLVM IR

### 5.6.1 Viewing Generated IR

```bash
# After generating IR programmatically, print to file
module->print(outs(), nullptr);

# Parse IR from file
clang -S -emit-llvm -O2 source.c -o source.ll
cat source.ll
```

### 5.6.2 Optimization with opt

```bash
# Run optimization passes
opt -S -O2 module.ll -o optimized.ll

# Run specific passes
opt -S -passes=instcombine module.ll -o simplified.ll
opt -S -passes='gvn,mem2reg,dce' module.ll -o optimized.ll

# View available passes
opt --help

# Print optimization remarks
opt -S -O2 -Rpass=.* module.ll -o /dev/null
```

### 5.6.3 Bitcode Operations

```bash
# Assemble .ll to .bc
llvm-as module.ll -o module.bc

# Disassemble .bc to .ll
llvm-dis module.bc -o module.ll

# Link multiple .bc files
llvm-link module1.bc module2.bc -o combined.bc
```

## 5.7 Advanced IR Features

### 5.7.1 Intrinsic Functions

LLVM provides built-in intrinsic functions:

```llvm
; Memory intrinsics
%ptr = call i8* @llvm.memset.p0i8.i64(i8* %dest, i8 0, i64 %size, i1 false)
call i8* @llvm.memcpy.p0i8.p0i8.i64(i8* %dst, i8* %src, i64 %size, i1 false)

; Conversion intrinsics
%float_val = call float @llvm.convert.to.fp32(i32 %int_val)

; Debug intrinsics
call void @llvm.dbg.declare(metadata %Point* %ptr, metadata !DIExpression())
```

### 5.7.2 Metadata

```llvm
; Debug information
!0 = distinct !DICompileUnit(file: !1, language: DW_LANG_C99, ...)
!1 = !{!"test.c"}

; Optimization remarks
!2 = !{!"function", !"main", !1}
call void @llvm.experimental.die(i8* getelementptr...) #0, !dbg !2

; Custom metadata
!my.markers = !{!3, !4}
!3 = !{!"branch_weight", i32 1000}
!4 = !{!"branch_weight", i32 1}
```

### 5.7.3 Inline Assembly

```llvm
; Inline assembly in LLVM IR
%result = call i64 @llvm.inline.asm(
    i64 asm sideeffect "addq %rbx, $0", "=r,r",
    i64 %a, i64 %b
)
```

## 5.8 Building a Complete Compiler Frontend

Let's put together a complete frontend pipeline:

```cpp
// main.cpp - Complete frontend pipeline
#include <iostream>
#include <fstream>
#include <sstream>
#include "Lexer.h"
#include "Parser.h"
#include "SemanticAnalyzer.h"
#include "LLVMIRGenerator.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <source-file>" << std::endl;
        return 1;
    }
    
    // Read source file
    std::ifstream file(argv[1]);
    if (!file.is_open()) {
        std::cerr << "Cannot open file: " << argv[1] << std::endl;
        return 1;
    }
    
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string source = buffer.str();
    
    // Stage 1: Lexical Analysis
    std::cout << "=== Stage 1: Lexical Analysis ===" << std::endl;
    Lexer lexer(source);
    std::vector<Token> tokens = lexer.tokenize();
    std::cout << "Produced " << tokens.size() << " tokens" << std::endl;
    
    // Stage 2: Syntax Analysis
    std::cout << "\n=== Stage 2: Syntax Analysis ===" << std::endl;
    Parser parser(tokens);
    std::unique_ptr<Program> ast = parser.parse();
    std::cout << "Parsing completed" << std::endl;
    
    // Stage 3: Semantic Analysis
    std::cout << "\n=== Stage 3: Semantic Analysis ===" << std::endl;
    SemanticAnalyzer analyzer;
    analyzer.analyze(ast);
    std::cout << "Semantic analysis completed" << std::endl;
    
    // Stage 4: IR Generation
    std::cout << "\n=== Stage 4: IR Generation ===" << std::endl;
    LLVMIRGenerator irGenerator;
    std::unique_ptr<llvm::Module> module = irGenerator.generate(ast);
    
    // Print generated IR
    std::cout << "\n=== Generated LLVM IR ===" << std::endl;
    module->print(llvm::outs(), nullptr);
    
    // Write IR to file
    std::string outputName = std::string(argv[1]) + ".ll";
    std::error_code ec;
    llvm::raw_fd_ostream out(outputName, ec);
    module->print(out, nullptr);
    std::cout << "\nIR written to: " << outputName << std::endl;
    
    return 0;
}
```

## Summary

This chapter covered LLVM IR in depth:

1. **IR Design**: Typed, RISC-like, SSA-based intermediate representation
2. **Type System**: Primitive and aggregate types
3. **Instructions**: Binary, comparison, memory, and control flow operations
4. **SSA and Phi Nodes**: Handling control flow merges
5. **IR Generation**: Building LLVM IR from AST
6. **LLVM C++ API**: Using Module, IRBuilder, and other core classes
7. **Advanced Features**: Intrinsics, metadata, inline assembly

LLVM IR serves as the universal representation between language frontends and optimization/code generation backends.

---

## Exercises

### Exercise 5.1: LLVM IR Exploration
Write several C functions and compile them to LLVM IR at different optimization levels. Observe how the IR changes:
1. -O0 (no optimization)
2. -O1 (basic optimization)
3. -O2 (standard optimization)
4. -O3 (aggressive optimization)

### Exercise 5.2: Manual IR Writing
Write the following functions directly in LLVM IR:
1. A function that computes the GCD of two integers
2. A function that finds the maximum element in an array
3. A recursive Fibonacci function

Compile and run your IR using `llc`.

### Exercise 5.3: Extend the IR Generator
Extend the LLVMIRGenerator to support:
1. Local variable allocation (stack slots)
2. Floating-point literals
3. Comparison operators (==, !=, <=, >=)

### Exercise 5.4: Control Flow
Generate LLVM IR for:
1. A for loop
2. A do-while loop
3. A switch statement
4. Break and continue statements

### Exercise 5.5: Function Calls
Implement function call generation:
1. Support calling functions with multiple arguments
2. Handle function return values
3. Support external function declarations (libc functions)

### Exercise 5.6: Optimization Analysis
Use LLVM tools to analyze optimizations:
1. Run `opt -debug-pass=Structure` to see pass structure
2. Use `opt -stats` to count transformations
3. Use `opt -print-after-all` to see IR at each pass

### Exercise 5.7: SSA Construction
Research SSA construction algorithms. Implement phi node insertion for the IR generator when handling if-else statements.

---

**[Next Chapter: 第六章_目標程式碼生成.md](第六章_目標程式碼生成.md)**

---

## References

1. LLVM Language Reference Manual: https://llvm.org/docs/LangRef.html

2. LLVM Programmer's Manual: https://llvm.org/docs/ProgrammersManual.html

3. Lattner, C. (2002). LLVM: An Infrastructure for Multi-Stage Optimization. *Master's Thesis*.

4. Appel, A. W. (1998). *Modern Compiler Implementation in ML*. Cambridge University Press.

5. Cypher, R., & Ferrante, J. (1993). On the Linear-Generation of Three-Address Code. *Software Practice and Experience*.
