# 第四章：語意分析與 AST
## Semantic Analysis and AST

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

<div align="center">

![Chapter 4](https://img.shields.io/badge/Chapter-4-4CAF50?style=for-the-badge)
![Level](https://img.shields.io/badge/Level-Intermediate-2196F3?style=for-the-badge)
![Duration](https://img.shields.io/badge/Duration-2%20weeks-FF9800?style=for-the-badge)

*Type Checking and Symbol Management*

</div>

---

## Table of Contents

1. [Introduction to Semantic Analysis](#41-introduction-to-semantic-analysis)
2. [Symbol Tables](#42-symbol-tables)
3. [Type Systems](#43-type-systems)
4. [Type Checking](#44-type-checking)
5. [Semantic Analysis Implementation](#45-semantic-analysis-implementation)
6. [Three-Address Code](#46-three-address-code)
7. [Intermediate Representations](#47-intermediate-representations)
8. [Using Clang for Analysis](#48-using-clang-for-analysis)
9. [Summary](#49-summary)
10. [Exercises](#410-exercises)

---

## 4.1 Introduction to Semantic Analysis

While syntax analysis verifies that the program follows grammar rules, **semantic analysis** ensures that the program makes sense according to the language's semantic rules. This phase catches errors that cannot be detected by syntax alone.

### 4.1.1 What Semantic Analysis Checks

```
┌────────────────────────────────────────────────────────────────────────┐
│                    SEMANTIC ANALYSIS CHECKS                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                                                              │  │
│   │   1. TYPE CHECKING                                           │  │
│   │      • Are operand types compatible?                        │  │
│   │      • Are function arguments correct?                      │  │
│   │      • Example: int x = "hello"; // Error!                  │  │
│   │                                                              │  │
│   │   2. SCOPE ANALYSIS                                          │  │
│   │      • Is every identifier declared?                        │  │
│   │      • Does reference match declaration?                     │  │
│   │      • Example: x = 5; // Error: x not declared!           │  │
│   │                                                              │  │
│   │   3. UNiqueness CHECKS                                       │  │
│   │      • No duplicate declarations in same scope               │  │
│   │      • Example: int x; int x; // Error: redefinition!        │  │
│   │                                                              │  │
│   │   4. FLOW ANALYSIS                                          │  │
│   │      • Does every path return a value?                      │  │
│   │      • Are variables initialized before use?                 │  │
│   │      • Example: int f() {} // Error: missing return!        │  │
│   │                                                              │  │
│   │   5. NAME BINDING                                           │  │
│   │      • What does each identifier refer to?                  │  │
│   │      • Function calls must match definitions                  │  │
│   │                                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1.2 Semantic Analysis Position in Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                 SEMANTIC ANALYSIS IN THE PIPELINE                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Source ──► Lexer ──► Parser ──► Semantic ──► IR ──► Optimizer ──► CodeGen
│   Code                 │          Analyzer                               │
│                        │          │                                       │
│                        ▼          ▼                                       │
│                   ┌─────────┐  ┌─────────┐                              │
│                   │   AST   │  │SymbolTab│                              │
│                   │         │  │ Types   │                              │
│                   │         │  │Scopes   │                              │
│                   └─────────┘  └─────────┘                              │
│                                    │                                     │
│                              Annotated AST                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4.2 Symbol Tables

A **symbol table** is a data structure that tracks all identifiers (variables, functions, types) in the program.

### 4.2.1 Symbol Information

```
┌────────────────────────────────────────────────────────────────────────┐
│                       SYMBOL TABLE STRUCTURE                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐ │
│   │                        SYMBOL TABLE                              │ │
│   │                                                                 │ │
│   │  ┌─────────┬────────┬─────────┬───────┬──────────┬────────────┐ │ │
│   │  │  Name   │  Kind  │  Type   │ Scope │   Line   │ Attributes│ │ │
│   │  ├─────────┼────────┼─────────┼───────┼──────────┼────────────┤ │ │
│   │  │  main   │ Func   │ int()   │ 0     │    1     │ defined   │ │ │
│   │  │  x      │ Var    │ int     │ 1     │    3     │ defined   │ │ │
│   │  │  y      │ Var    │ int     │ 1     │    4     │ defined   │ │ │
│   │  │  fact   │ Func   │int(int) │ 0     │    7     │ defined   │ │ │
│   │  │  n      │ Param  │ int     │ 2     │    7     │ defined   │ │ │
│   │  └─────────┴────────┴─────────┴───────┴──────────┴────────────┘ │ │
│   │                                                                 │ │
│   └────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2.2 Complete Symbol Table Implementation

```cpp
// symbol_table.h
// A comprehensive symbol table implementation

#ifndef SYMBOL_TABLE_H
#define SYMBOL_TABLE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <iostream>

// ============================================================================
// TYPE SYSTEM
// ============================================================================

class Type {
public:
    enum class BaseType {
        VOID,
        CHAR,
        INT,
        FLOAT,
        DOUBLE,
        BOOL,
        ARRAY,
        POINTER,
        FUNCTION
    };
    
    BaseType base;
    std::vector<int> dimensions;           // For arrays
    std::shared_ptr<Type> elementType;    // For arrays/pointers
    std::shared_ptr<Type> returnType;     // For functions
    std::vector<std::shared_ptr<Type>> paramTypes;  // For functions
    
    explicit Type(BaseType b) : base(b) {}
    
    // Factory methods
    static std::shared_ptr<Type> Void() { return std::make_shared<Type>(BaseType::VOID); }
    static std::shared_ptr<Type> Int() { return std::make_shared<Type>(BaseType::INT); }
    static std::shared_ptr<Type> Float() { return std::make_shared<Type>(BaseType::FLOAT); }
    static std::shared_ptr<Type> Double() { return std::make_shared<Type>(BaseType::DOUBLE); }
    static std::shared_ptr<Type> Char() { return std::make_shared<Type>(BaseType::CHAR); }
    static std::shared_ptr<Type> Bool() { return std::make_shared<Type>(BaseType::BOOL); }
    
    static std::shared_ptr<Type> Array(int size, std::shared_ptr<Type> elemType) {
        auto t = std::make_shared<Type>(BaseType::ARRAY);
        t->dimensions.push_back(size);
        t->elementType = elemType;
        return t;
    }
    
    static std::shared_ptr<Type> Pointer(std::shared_ptr<Type> to) {
        auto t = std::make_shared<Type>(BaseType::POINTER);
        t->elementType = to;
        return t;
    }
    
    static std::shared_ptr<Type> Function(std::shared_ptr<Type> retType,
                                          const std::vector<std::shared_ptr<Type>>& params) {
        auto t = std::make_shared<Type>(BaseType::FUNCTION);
        t->returnType = retType;
        t->paramTypes = params;
        return t;
    }
    
    std::string toString() const {
        switch (base) {
            case BaseType::VOID: return "void";
            case BaseType::CHAR: return "char";
            case BaseType::INT: return "int";
            case BaseType::FLOAT: return "float";
            case BaseType::DOUBLE: return "double";
            case BaseType::BOOL: return "bool";
            case BaseType::ARRAY: {
                std::string s = elementType->toString();
                for (int dim : dimensions) {
                    s += "[" + std::to_string(dim) + "]";
                }
                return s;
            }
            case BaseType::POINTER:
                return elementType->toString() + "*";
            case BaseType::FUNCTION: {
                std::string s = returnType->toString() + "(";
                for (size_t i = 0; i < paramTypes.size(); ++i) {
                    if (i > 0) s += ", ";
                    s += paramTypes[i]->toString();
                }
                s += ")";
                return s;
            }
            default: return "?";
        }
    }
    
    bool equals(std::shared_ptr<Type> other) const {
        if (base != other->base) return false;
        
        if (base == BaseType::ARRAY) {
            return dimensions == other->dimensions && 
                   elementType->equals(other->elementType);
        }
        
        if (base == BaseType::POINTER) {
            return elementType->equals(other->elementType);
        }
        
        if (base == BaseType::FUNCTION) {
            if (!returnType->equals(other->returnType)) return false;
            if (paramTypes.size() != other->paramTypes.size()) return false;
            for (size_t i = 0; i < paramTypes.size(); ++i) {
                if (!paramTypes[i]->equals(other->paramTypes[i])) return false;
            }
            return true;
        }
        
        return true;
    }
    
    bool isScalar() const {
        return base != BaseType::ARRAY && base != BaseType::FUNCTION;
    }
    
    bool isArithmetic() const {
        return base == BaseType::INT || base == BaseType::FLOAT ||
               base == BaseType::DOUBLE || base == BaseType::CHAR;
    }
    
    bool isPointer() const {
        return base == BaseType::POINTER;
    }
};

// ============================================================================
// SYMBOL KIND
// ============================================================================

enum class SymbolKind {
    VARIABLE,
    FUNCTION,
    PARAMETER,
    TYPE,
    CONSTANT,
    STRUCT
};

// ============================================================================
// SYMBOL ENTRY
// ============================================================================

class Symbol {
public:
    std::string name;
    SymbolKind kind;
    std::shared_ptr<Type> type;
    int scopeLevel;
    int lineNumber;
    int columnNumber;
    bool isDefined;
    bool isConstant;
    std::string value;  // For constants
    
    Symbol(const std::string& n, SymbolKind k, std::shared_ptr<Type> t,
           int scope, int line, int col = 0)
        : name(n), kind(k), type(t), scopeLevel(scope),
          lineNumber(line), columnNumber(col),
          isDefined(false), isConstant(false) {}
};

// ============================================================================
// SYMBOL TABLE
// ============================================================================

class SymbolTable {
public:
    SymbolTable() : currentScope_(0), errorCount_(0) {
        scopes_.push_back(std::vector<std::string>());
    }
    
    // Scope management
    void enterScope() {
        currentScope_++;
        scopes_.push_back(std::vector<std::string>());
    }
    
    void exitScope() {
        if (currentScope_ > 0) {
            // Remove all symbols defined in this scope
            for (const auto& name : scopes_[currentScope_]) {
                symbols_.erase(name);
            }
            scopes_.pop_back();
            currentScope_--;
        }
    }
    
    int getCurrentScope() const { return currentScope_; }
    
    // Symbol insertion
    bool insert(const std::string& name, std::shared_ptr<Type> type,
                SymbolKind kind, int line, int col = 0) {
        // Check if already defined in current scope
        auto it = symbols_.find(name);
        if (it != symbols_.end() && it->second->scopeLevel == currentScope_) {
            error("Symbol '" + name + "' already defined in this scope");
            return false;
        }
        
        auto symbol = std::make_shared<Symbol>(name, kind, type, 
                                               currentScope_, line, col);
        symbols_[name] = symbol;
        scopes_[currentScope_].push_back(name);
        
        return true;
    }
    
    // Symbol lookup
    std::shared_ptr<Symbol> lookup(const std::string& name) {
        auto it = symbols_.find(name);
        if (it != symbols_.end()) {
            return it->second;
        }
        return nullptr;
    }
    
    std::shared_ptr<Symbol> lookupCurrentScope(const std::string& name) {
        auto it = symbols_.find(name);
        if (it != symbols_.end() && it->second->scopeLevel == currentScope_) {
            return it->second;
        }
        return nullptr;
    }
    
    // Symbol modification
    void markDefined(const std::string& name) {
        auto symbol = lookup(name);
        if (symbol) {
            symbol->isDefined = true;
        }
    }
    
    // Error handling
    void error(const std::string& message) {
        std::cerr << "Semantic Error: " << message << std::endl;
        errorCount_++;
    }
    
    void warning(const std::string& message) {
        std::cerr << "Semantic Warning: " << message << std::endl;
    }
    
    int getErrorCount() const { return errorCount_; }
    
    // Debugging
    void print() const {
        std::cout << "\n=== Symbol Table ===\n";
        for (const auto& pair : symbols_) {
            const auto& sym = pair.second;
            std::cout << "Name: " << sym->name
                      << ", Kind: " << static_cast<int>(sym->kind)
                      << ", Type: " << sym->type->toString()
                      << ", Scope: " << sym->scopeLevel
                      << ", Line: " << sym->lineNumber
                      << (sym->isDefined ? " [defined]" : " [declared]") << "\n";
        }
        std::cout << "===================\n";
    }

private:
    std::unordered_map<std::string, std::shared_ptr<Symbol>> symbols_;
    std::vector<std::vector<std::string>> scopes_;  // For cleanup on exit
    int currentScope_;
    int errorCount_;
};

// ============================================================================
// SCOPE MANAGER
// ============================================================================

class ScopeManager {
public:
    SymbolTable table;
    
    void enterGlobalScope() {
        // Already in global scope by default
    }
    
    void enterFunctionScope() {
        table.enterScope();
    }
    
    void enterBlockScope() {
        table.enterScope();
    }
    
    void exitScope() {
        table.exitScope();
    }
    
    bool declareVariable(const std::string& name, std::shared_ptr<Type> type,
                         int line, int col = 0) {
        if (!table.insert(name, type, SymbolKind::VARIABLE, line, col)) {
            return false;
        }
        table.markDefined(name);
        return true;
    }
    
    bool declareFunction(const std::string& name, std::shared_ptr<Type> type,
                        int line, int col = 0) {
        return table.insert(name, type, SymbolKind::FUNCTION, line, col);
    }
    
    bool declareParameter(const std::string& name, std::shared_ptr<Type> type,
                         int line, int col = 0) {
        return table.insert(name, type, SymbolKind::PARAMETER, line, col);
    }
    
    std::shared_ptr<Symbol> resolveSymbol(const std::string& name) {
        auto symbol = table.lookup(name);
        if (!symbol) {
            table.error("Undefined symbol: '" + name + "'");
        }
        return symbol;
    }
};

#endif // SYMBOL_TABLE_H
```

---

## 4.3 Type Systems

### 4.3.1 Type Categories

```
┌────────────────────────────────────────────────────────────────────────┐
│                       TYPE HIERARCHY                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                              TYPE                                       │
│                                │                                        │
│           ┌───────────────────┼───────────────────┐                    │
│           │                   │                   │                     │
│        Scalar            Aggregate            Function                   │
│           │                   │                   │                     │
│    ┌──────┼──────┐      ┌────┴────┐              │                     │
│    │      │      │      │         │              │                     │
│  Integer Float  Pointer  Array    Struct     ┌───┴───┐               │
│    │      │      │                                       │                     │
│  char int double                                    │                     │
│                      User-Defined                              │                     │
│                         │                                    │                     │
│                       Struct                                │                     │
│                       Union                                   │                     │
│                       Enum                                    │                     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3.2 Type Compatibility Rules

```cpp
// type_system.h
// Type compatibility and coercion rules

class TypeSystem {
public:
    // Check if two types are compatible
    bool areCompatible(std::shared_ptr<Type> t1, std::shared_ptr<Type> t2) {
        // Same type is always compatible
        if (t1->equals(t2)) return true;
        
        // Implicit conversions
        if (t1->base == Type::BaseType::INT && t2->base == Type::BaseType::FLOAT) return true;
        if (t1->base == Type::BaseType::FLOAT && t2->base == Type::BaseType::INT) return true;
        
        // Pointer compatibility
        if (t1->base == Type::BaseType::POINTER && t2->base == Type::BaseType::POINTER) {
            return t1->elementType->equals(t2->elementType);
        }
        
        // Null pointer compatibility
        if (t1->base == Type::BaseType::POINTER && isNullPointer(t2)) return true;
        if (t2->base == Type::BaseType::POINTER && isNullPointer(t1)) return true;
        
        return false;
    }
    
    // Get common type for binary operations
    std::shared_ptr<Type> getCommonType(std::shared_ptr<Type> t1, 
                                         std::shared_ptr<Type> t2) {
        if (t1->equals(t2)) return t1;
        
        // int + float -> float
        if ((t1->base == Type::BaseType::INT && t2->base == Type::BaseType::FLOAT) ||
            (t1->base == Type::BaseType::FLOAT && t2->base == Type::BaseType::INT)) {
            return Type::Float();
        }
        
        // int + double -> double
        if ((t1->base == Type::BaseType::INT && t2->base == Type::BaseType::DOUBLE) ||
            (t1->base == Type::BaseType::DOUBLE && t2->base == Type::BaseType::INT)) {
            return Type::Double();
        }
        
        // float + double -> double
        if ((t1->base == Type::BaseType::FLOAT && t2->base == Type::BaseType::DOUBLE) ||
            (t1->base == Type::BaseType::DOUBLE && t2->base == Type::BaseType::FLOAT)) {
            return Type::Double();
        }
        
        // Default to int
        return Type::Int();
    }
    
    // Check if type can be assigned to another
    bool canAssign(std::shared_ptr<Type> source, std::shared_ptr<Type> target) {
        // Same type
        if (source->equals(target)) return true;
        
        // int to float/double
        if (source->base == Type::BaseType::INT &&
            (target->base == Type::BaseType::FLOAT || target->base == Type::BaseType::DOUBLE)) {
            return true;
        }
        
        // float to double
        if (source->base == Type::BaseType::FLOAT && target->base == Type::BaseType::DOUBLE) {
            return true;
        }
        
        // Pointer to void*
        if (target->base == Type::BaseType::POINTER && 
            target->elementType->base == Type::BaseType::VOID) {
            return true;
        }
        
        return false;
    }
    
    bool isNullPointer(std::shared_ptr<Type> t) {
        // Integer literal 0 is compatible with pointers
        return false;  // Would need expression context
    }
};
```

---

## 4.4 Type Checking

### 4.4.1 Type Checking Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│                    TYPE CHECKING RULES                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   EXPRESSION              OPERANDS              RESULT                  │
│   ──────────────────────────────────────────────────────────────────  │
│   a + b                   arithmetic, arithmetic   common type         │
│   a - b                   arithmetic, arithmetic   common type         │
│   a * b                   arithmetic, arithmetic   common type         │
│   a / b                   arithmetic, arithmetic   common type         │
│   a % b                   integer, integer        int                 │
│   a < b                   arithmetic, arithmetic   int (bool)          │
│   a > b                   arithmetic, arithmetic   int (bool)          │
│   a == b                  compatible, compatible   int (bool)          │
│   a && b                  scalar, scalar         int (bool)          │
│   a || b                  scalar, scalar         int (bool)          │
│   !a                      scalar                  int (bool)          │
│   -a                      arithmetic              same as a             │
│   a[i]                    array, integer          element type         │
│   *a                      pointer                 pointed-to type       │
│   &a                      lvalue                  pointer to a          │
│   f(a1, a2, ...)          function, compatible    return type         │
│                                                                        │
│   STATEMENT              REQUIREMENT                                    │
│   ──────────────────────────────────────────────────────────────────  │
│   x = e                   canAssign(type(e), type(x))                  │
│   return e;               canAssign(type(e), func_return_type)        │
│   if (e) ...             isScalar(type(e))                            │
│   while (e) ...          isScalar(type(e))                            │
│   for (e1; e2; e3) ...  isScalar(type(e2)) if present               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.4.2 Semantic Analyzer Implementation

```cpp
// semantic_analyzer.h
// Semantic analysis for the compiler

#ifndef SEMANTIC_ANALYZER_H
#define SEMANTIC_ANALYZER_H

#include "symbol_table.h"
#include "parser.h"
#include <unordered_map>
#include <memory>

class SemanticAnalyzer {
public:
    SemanticAnalyzer() : currentFunctionReturnType_(nullptr), errorCount_(0) {}
    
    bool analyze(std::unique_ptr<Program>& program);
    
    // Visitor methods
    void visit(Program* node);
    void visit(FunctionDecl* node);
    void visit(VarDecl* node);
    void visit(CompoundStmt* node);
    void visit(IfStmt* node);
    void visit(WhileStmt* node);
    void visit(ForStmt* node);
    void visit(ReturnStmt* node);
    std::shared_ptr<Type> visitExpr(Expr* node);
    std::shared_ptr<Type> visitExpr(IntegerLiteral* node);
    std::shared_ptr<Type> visitExpr(FloatLiteral* node);
    std::shared_ptr<Type> visitExpr(Identifier* node);
    std::shared_ptr<Type> visitExpr(BinaryExpr* node);
    std::shared_ptr<Type> visitExpr(UnaryExpr* node);
    std::shared_ptr<Type> visitExpr(CallExpr* node);
    
    int getErrorCount() const { return errorCount_; }

private:
    ScopeManager scope_;
    std::shared_ptr<Type> currentFunctionReturnType_;
    std::shared_ptr<Type> expectedReturnType_;
    std::unordered_map<std::string, std::shared_ptr<Type>> declaredTypes_;
    TypeSystem typeSystem_;
    int errorCount_;
    
    void error(const std::string& message, int line = 0);
    void warning(const std::string& message, int line = 0);
    std::shared_ptr<Type> mapBuiltinType(const std::string& typeName);
    bool checkReturnPaths(Stmt* stmt);
};

#endif // SEMANTIC_ANALYZER_H
```

```cpp
// semantic_analyzer.cpp
// Implementation of semantic analysis

#include "semantic_analyzer.h"
#include <iostream>

bool SemanticAnalyzer::analyze(std::unique_ptr<Program>& program) {
    scope_.enterGlobalScope();
    
    // Pre-declare built-in functions
    // (Would add printf, malloc, etc. here)
    
    visit(program.get());
    
    scope_.exitScope();
    
    return errorCount_ == 0;
}

void SemanticAnalyzer::visit(Program* node) {
    for (auto& decl : node->declarations) {
        if (auto* func = dynamic_cast<FunctionDecl*>(decl.get())) {
            visit(func);
        } else if (auto* var = dynamic_cast<VarDecl*>(decl.get())) {
            visit(var);
        }
    }
}

void SemanticAnalyzer::visit(FunctionDecl* node) {
    // Determine return type
    expectedReturnType_ = mapBuiltinType(node->returnType);
    
    // Create function type
    std::vector<std::shared_ptr<Type>> paramTypes;
    for (auto& param : node->params) {
        paramTypes.push_back(mapBuiltinType(param.first));
    }
    auto funcType = Type::Function(expectedReturnType_, paramTypes);
    
    // Check for redeclaration
    auto existing = scope_.table.lookup(node->name);
    if (existing && existing->scopeLevel == 0) {
        if (existing->isDefined) {
            error("Function '" + node->name + "' already defined", 0);
        } else {
            // Declaration exists, check signature matches
            if (!funcType->equals(existing->type)) {
                error("Function declaration signature mismatch for '" + node->name + "'", 0);
            }
        }
    } else {
        // New declaration
        if (!scope_.declareFunction(node->name, funcType, 0)) {
            // Error already reported
        }
    }
    
    // Enter function scope
    scope_.enterFunctionScope();
    
    // Add parameters to scope
    for (auto& param : node->params) {
        auto paramType = mapBuiltinType(param.first);
        scope_.declareParameter(param.second, paramType, 0);
    }
    
    // Check function body
    bool hasReturn = false;
    if (node->body) {
        hasReturn = checkReturnPaths(node->body.get());
    }
    
    // Check return statement in non-void functions
    if (expectedReturnType_->base != Type::BaseType::VOID && !hasReturn) {
        warning("Not all control paths return a value", 0);
    }
    
    // Visit body
    if (node->body) {
        visit(node->body.get());
    }
    
    // Mark function as defined
    scope_.table.markDefined(node->name);
    
    scope_.exitScope();
}

void SemanticAnalyzer::visit(VarDecl* node) {
    auto varType = mapBuiltinType(node->type);
    
    if (!varType) {
        error("Unknown type '" + node->type + "'", node);
        return;
    }
    
    if (node->arraySize > 0) {
        varType = Type::Array(node->arraySize, varType);
    }
    
    if (!scope_.declareVariable(node->name, varType, 0)) {
        error("Variable '" + node->name + "' already declared", 0);
    }
}

void SemanticAnalyzer::visit(CompoundStmt* node) {
    scope_.enterBlockScope();
    
    for (auto& stmt : node->statements) {
        if (auto* exprStmt = dynamic_cast<ExpressionStmt*>(stmt.get())) {
            if (exprStmt->expr) {
                visitExpr(exprStmt->expr.get());
            }
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
    
    scope_.exitScope();
}

void SemanticAnalyzer::visit(IfStmt* node) {
    auto condType = visitExpr(node->condition.get());
    
    if (!condType->isScalar()) {
        error("Condition must be scalar type, got " + condType->toString(), 0);
    }
    
    if (node->thenBranch) {
        if (auto* compStmt = dynamic_cast<CompoundStmt*>(node->thenBranch.get())) {
            visit(compStmt);
        }
    }
    
    if (node->elseBranch) {
        if (auto* compStmt = dynamic_cast<CompoundStmt*>(node->elseBranch.get())) {
            visit(compStmt);
        }
    }
}

void SemanticAnalyzer::visit(WhileStmt* node) {
    auto condType = visitExpr(node->condition.get());
    
    if (!condType->isScalar()) {
        error("Loop condition must be scalar type", 0);
    }
}

void SemanticAnalyzer::visit(ForStmt* node) {
    if (node->init) visitExpr(node->init.get());
    if (node->condition) {
        auto condType = visitExpr(node->condition.get());
        if (!condType->isScalar()) {
            error("Loop condition must be scalar type", 0);
        }
    }
    if (node->increment) visitExpr(node->increment.get());
}

void SemanticAnalyzer::visit(ReturnStmt* node) {
    if (node->expr) {
        auto exprType = visitExpr(node->expr.get());
        
        if (expectedReturnType_->base == Type::BaseType::VOID) {
            warning("Return with value in void function", 0);
        } else if (!typeSystem_.canAssign(exprType, expectedReturnType_)) {
            error("Return type mismatch: expected " + expectedReturnType_->toString() +
                  ", got " + exprType->toString(), 0);
        }
    } else {
        if (expectedReturnType_->base != Type::BaseType::VOID) {
            error("Return without value in non-void function", 0);
        }
    }
}

// ============================================================================
// EXPRESSION TYPE CHECKING
// ============================================================================

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(Expr* node) {
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
            return Type::Int();
    }
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(IntegerLiteral* node) {
    return Type::Int();
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(FloatLiteral* node) {
    return Type::Float();
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(Identifier* node) {
    auto symbol = scope_.resolveSymbol(node->name);
    if (symbol) {
        return symbol->type;
    }
    return Type::Int();  // Fallback
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(BinaryExpr* node) {
    auto leftType = visitExpr(node->left.get());
    auto rightType = visitExpr(node->right.get());
    
    switch (node->op) {
        case BinaryOp::ADD:
        case BinaryOp::SUB:
        case BinaryOp::MUL:
        case BinaryOp::DIV:
        case BinaryOp::MOD: {
            if (!leftType->isArithmetic()) {
                error("Left operand must be arithmetic type", 0);
            }
            if (!rightType->isArithmetic()) {
                error("Right operand must be arithmetic type", 0);
            }
            return typeSystem_.getCommonType(leftType, rightType);
        }
        
        case BinaryOp::EQ:
        case BinaryOp::NE:
        case BinaryOp::LT:
        case BinaryOp::GT:
        case BinaryOp::LE:
        case BinaryOp::GE: {
            if (!leftType->isArithmetic() && !leftType->isPointer()) {
                error("Left operand must be arithmetic or pointer type", 0);
            }
            if (!rightType->isArithmetic() && !rightType->isPointer()) {
                error("Right operand must be arithmetic or pointer type", 0);
            }
            return Type::Int();
        }
        
        case BinaryOp::AND:
        case BinaryOp::OR: {
            if (!leftType->isScalar()) {
                error("Left operand must be scalar type", 0);
            }
            if (!rightType->isScalar()) {
                error("Right operand must be scalar type", 0);
            }
            return Type::Int();
        }
        
        case BinaryOp::ASSIGN: {
            if (!typeSystem_.canAssign(rightType, leftType)) {
                error("Assignment type mismatch", 0);
            }
            return leftType;
        }
        
        default:
            return Type::Int();
    }
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(UnaryExpr* node) {
    auto operandType = visitExpr(node->operand.get());
    
    if (node->op == "!" || node->op == "~") {
        if (!operandType->isScalar()) {
            error("Operand must be scalar type", 0);
        }
        return Type::Int();
    }
    
    if (node->op == "-") {
        if (!operandType->isArithmetic()) {
            error("Operand must be arithmetic type", 0);
        }
        return operandType;
    }
    
    if (node->op == "*") {
        if (!operandType->isPointer()) {
            error("Operand must be pointer type", 0);
        }
        return operandType->elementType;
    }
    
    if (node->op == "&") {
        // Would need expression context for proper type
        return Type::Pointer(operandType);
    }
    
    return operandType;
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(CallExpr* node) {
    auto symbol = scope_.resolveSymbol(node->callee);
    if (!symbol) {
        error("Call to undefined function: " + node->callee, 0);
        return Type::Int();
    }
    
    if (symbol->kind != SymbolKind::FUNCTION) {
        error(node->callee + " is not a function", 0);
        return Type::Int();
    }
    
    auto funcType = symbol->type;
    auto& paramTypes = funcType->paramTypes;
    
    // Check argument count
    if (node->args.size() != paramTypes.size()) {
        error("Function " + node->callee + " expects " + 
              std::to_string(paramTypes.size()) + " arguments, but " +
              std::to_string(node->args.size()) + " provided", 0);
    }
    
    // Check argument types
    for (size_t i = 0; i < node->args.size() && i < paramTypes.size(); ++i) {
        auto argType = visitExpr(node->args[i].get());
        if (!typeSystem_.areCompatible(paramTypes[i], argType)) {
            warning("Argument " + std::to_string(i + 1) + " type mismatch", 0);
        }
    }
    
    return funcType->returnType;
}

// ============================================================================
// HELPER METHODS
// ============================================================================

std::shared_ptr<Type> SemanticAnalyzer::mapBuiltinType(const std::string& typeName) {
    if (typeName == "int") return Type::Int();
    if (typeName == "float") return Type::Float();
    if (typeName == "double") return Type::Double();
    if (typeName == "char") return Type::Char();
    if (typeName == "void") return Type::Void();
    if (typeName == "bool") return Type::Bool();
    
    // Check user-defined types
    auto it = declaredTypes_.find(typeName);
    if (it != declaredTypes_.end()) {
        return it->second;
    }
    
    return nullptr;
}

bool SemanticAnalyzer::checkReturnPaths(Stmt* stmt) {
    if (auto* retStmt = dynamic_cast<ReturnStmt*>(stmt)) {
        return true;
    }
    
    if (auto* compStmt = dynamic_cast<CompoundStmt*>(stmt)) {
        for (auto& s : compStmt->statements) {
            if (checkReturnPaths(s.get())) {
                return true;
            }
        }
        return false;
    }
    
    if (auto* ifStmt = dynamic_cast<IfStmt*>(stmt)) {
        if (ifStmt->elseBranch) {
            return checkReturnPaths(ifStmt->thenBranch.get()) &&
                   checkReturnPaths(ifStmt->elseBranch.get());
        }
        return false;
    }
    
    return false;
}

void SemanticAnalyzer::error(const std::string& message, int line) {
    std::cerr << "Error";
    if (line > 0) std::cerr << " at line " << line;
    std::cerr << ": " << message << std::endl;
    errorCount_++;
}

void SemanticAnalyzer::warning(const std::string& message, int line) {
    std::cerr << "Warning";
    if (line > 0) std::cerr << " at line " << line;
    std::cerr << ": " << message << std::endl;
}
```

---

## 4.5 Three-Address Code

### 4.5.1 TAC Concepts

Three-Address Code (TAC) is a simple intermediate representation where each instruction has at most three operands.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    THREE-ADDRESS CODE EXAMPLES                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   SOURCE:  result = a + b * c                                         │
│                                                                        │
│   TAC:                                                                  │
│   t1 = b * c          ; Temporary for multiplication                  │
│   result = a + t1     ; Final assignment                              │
│                                                                        │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│   SOURCE:  if (x > 0) then a = 1 else a = 2                          │
│                                                                        │
│   TAC:                                                                  │
│   if x > 0 goto L1      ; Conditional jump                            │
│   t1 = 2                ; Else branch                                 │
│   goto L2                ; Skip then branch                           │
│   L1: t1 = 1            ; Then branch                                 │
│   L2: a = t1             ; Assignment                                 │
│                                                                        │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│   SOURCE:  while (i < n) { sum += a[i]; i++; }                       │
│                                                                        │
│   TAC:                                                                  │
│   L1: if i < n goto L2   ; Loop condition                            │
│   goto L3                 ; Exit loop                                  │
│   L2: t1 = i * 4          ; Index calculation                         │
│   t2 = a + t1             ; Array element address                     │
│   t3 = *t2                ; Load array element                        │
│   sum = sum + t3          ; Accumulate                                 │
│   i = i + 1               ; Increment                                 │
│   goto L1                 ; Loop back                                  │
│   L3:                     ; Loop exit                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.5.2 TAC Instruction Types

| Category | Format | Example |
|----------|--------|---------|
| **Assignment** | x = y | `t1 = a` |
| **Binary** | x = y op z | `t1 = b * c` |
| **Unary** | x = op y | `t1 = -a` |
| **Copy** | x = &y | `t1 = &a` |
| **Load** | x = *y | `t1 = *p` |
| **Store** | *x = y | `*p = x` |
| **Jump** | goto L | `goto L1` |
| **Conditional** | if x goto L | `if x > 0 goto L1` |
| **Function** | param x, call f, return x | `call f, 1` |
| **Label** | L: | `L1:` |

---

## 4.6 Intermediate Representations

### 4.6.1 IR Comparison

```
┌────────────────────────────────────────────────────────────────────────┐
│                    INTERMEDIATE REPRESENTATIONS                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   HIGH-LEVEL IR                    LOW-LEVEL IR                        │
│   ─────────────                    ─────────────                        │
│                                                                        │
│   • Close to source language       • Close to machine code             │
│   • Abstract operations            • Concrete operations               │
│   • Unlimited registers            • Explicit memory access            │
│   • Complex expressions            • Simple 3-operand form             │
│   • Type information preserved     • Type information may be lost      │
│                                                                        │
│   Examples:                        Examples:                             │
│   • Abstract Syntax Tree           • Three-Address Code                │
│   • High-level TAC                 • LLVM IR                            │
│   • Java Bytecode                  • x86 Assembly                      │
│   • CIL/MSIL                       • Machine code                      │
│                                                                        │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│   LLVM IR Characteristics:                                             │
│   • Typed SSA form                                                    │
│   • RISC-like instruction set                                          │
│   • Unlimited virtual registers                                         │
│   • Platform-independent                                               │
│   • Well-suited for optimization                                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4.7 Using Clang for Analysis

### 4.7.1 Clang Type Queries

```cpp
#include <clang/AST/Type.h>

void analyzeType(clang::QualType QT) {
    // Check base type
    if (QT->isVoidType()) { /* void */ }
    if (QT->isIntegerType()) { /* integer */ }
    if (QT->isFloatingType()) { /* floating point */ }
    
    // Check qualifiers
    if (QT.isConst()) { /* const qualified */ }
    if (QT.isVolatile()) { /* volatile qualified */ }
    
    // Unqualified type
    clang::QualType unqualified = QT.getNonReferenceType().getUnqualifiedType();
    
    // Canonical type
    clang::QualType canonical = QT.getCanonicalType();
}
```

---

## 4.8 Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CHAPTER 4 KEY POINTS                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✅ Semantic analysis catches errors syntax cannot detect               │
│                                                                        │
│  ✅ Symbol tables track all identifiers and their attributes           │
│                                                                        │
│  ✅ Type systems define rules for type compatibility                   │
│                                                                        │
│  ✅ Type checking ensures operations are applied to valid types        │
│                                                                        │
│  ✅ Three-Address Code provides a simple intermediate form            │
│                                                                        │
│  ✅ Semantic analysis prepares the AST for code generation             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4.9 Exercises

### Exercise 4.1: Symbol Table Extension ⭐⭐

**Objective:** Extend the symbol table

**Task:** Add support for:
1. Struct types
2. Function overloading
3. Forward declarations

---

### Exercise 4.2: Type Coercion ⭐⭐

**Objective:** Implement implicit type conversion

**Task:** Implement:
1. int to float conversion
2. float to int truncation
3. Pointer type conversions

---

### Exercise 4.3: TAC Generation ⭐⭐⭐

**Objective:** Generate Three-Address Code from AST

**Task:** Implement a TAC generator that:
1. Visits the AST
2. Generates TAC instructions
3. Handles all expression types

---

### Exercise 4.4: Semantic Analysis ⭐⭐

**Objective:** Complete semantic analyzer

**Task:** Extend the semantic analyzer to check:
1. Uninitialized variables
2. Unreachable code
3. Unused variables

---

### Exercise 4.5: Clang Analysis Tool ⭐⭐

**Objective:** Use Clang APIs

**Task:** Write a Clang tool that finds:
1. All functions with missing return statements
2. All unused variables
3. All type mismatches

---

**[Next Chapter: 第五章_LLVM中間表示層(IR).md](第五章_LLVM中間表示層(IR).md)**

---

*Chapter 4 Complete*
