# 第四章：語意分析與 AST (Semantic Analysis and AST)

---

> **Transparency Notice:** This chapter was drafted and structured with the assistance of OpenCode, an AI programming and writing assistant, to ensure technical accuracy and educational clarity.

---

## 4.1 Introduction to Semantic Analysis

While syntax analysis verifies that the program follows the grammar rules, **semantic analysis** ensures that the program makes sense according to the language's semantic rules. This includes:

- **Type checking**: Ensuring operations are applied to compatible types
- **Scope analysis**: Resolving variable references correctly
- **Symbol table management**: Tracking declarations
- **Runtime semantics**: Memory layout, calling conventions

```
Source Code → Tokens → AST → Semantic Analysis → Annotated AST → IR
```

## 4.2 Symbol Tables

A **symbol table** is a data structure that tracks information about identifiers (variables, functions, types) in the program.

### 4.2.1 Symbol Information

Each symbol entry typically stores:

| Field | Description |
|-------|-------------|
| `name` | Identifier name |
| `kind` | Variable, function, type, parameter |
| `type` | Data type of the symbol |
| `scope` | The scope where it's defined |
| `line` | Source line number |
| `attributes` | Additional properties (const, static, etc.) |

### 4.2.2 Symbol Table Implementation

```cpp
// SymbolTable.h
#ifndef SYMBOLTABLE_H
#define SYMBOLTABLE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

enum class SymbolKind {
    VARIABLE,
    FUNCTION,
    PARAMETER,
    TYPE,
    CONSTANT
};

class Type {
public:
    enum class BaseType {
        INT,
        FLOAT,
        DOUBLE,
        VOID,
        CHAR,
        BOOL,
        ARRAY,
        POINTER,
        FUNCTION
    };
    
    BaseType base;
    std::vector<int> dimensions;  // For arrays
    std::shared_ptr<Type> pointedType;  // For pointers
    std::vector<std::shared_ptr<Type>> paramTypes;  // For functions
    std::shared_ptr<Type> returnType;  // For functions
    
    Type(BaseType b) : base(b) {}
    
    static std::shared_ptr<Type> Int() { return std::make_shared<Type>(BaseType::INT); }
    static std::shared_ptr<Type> Float() { return std::make_shared<Type>(BaseType::FLOAT); }
    static std::shared_ptr<Type> Void() { return std::make_shared<Type>(BaseType::VOID); }
    
    static std::shared_ptr<Type> Array(int size, std::shared_ptr<Type> elementType) {
        auto t = std::make_shared<Type>(BaseType::ARRAY);
        t->dimensions.push_back(size);
        t->pointedType = elementType;
        return t;
    }
    
    static std::shared_ptr<Type> Pointer(std::shared_ptr<Type> to) {
        auto t = std::make_shared<Type>(BaseType::POINTER);
        t->pointedType = to;
        return t;
    }
    
    static std::shared_ptr<Type> Function(
        std::shared_ptr<Type> returnType,
        const std::vector<std::shared_ptr<Type>>& paramTypes) {
        auto t = std::make_shared<Type>(BaseType::FUNCTION);
        t->returnType = returnType;
        t->paramTypes = paramTypes;
        return t;
    }
    
    std::string toString() const {
        switch (base) {
            case BaseType::INT: return "int";
            case BaseType::FLOAT: return "float";
            case BaseType::DOUBLE: return "double";
            case BaseType::VOID: return "void";
            case BaseType::CHAR: return "char";
            case BaseType::BOOL: return "bool";
            case BaseType::ARRAY:
                return pointedType->toString() + "[" + 
                       std::to_string(dimensions[0]) + "]";
            case BaseType::POINTER:
                return pointedType->toString() + "*";
            case BaseType::FUNCTION:
                std::string s = returnType->toString() + "(";
                for (size_t i = 0; i < paramTypes.size(); ++i) {
                    if (i > 0) s += ", ";
                    s += paramTypes[i]->toString();
                }
                return s + ")";
            default: return "unknown";
        }
    }
    
    bool equals(std::shared_ptr<Type> other) const {
        if (base != other->base) return false;
        
        if (base == BaseType::ARRAY) {
            if (dimensions != other->dimensions) return false;
            return pointedType->equals(other->pointedType);
        }
        
        if (base == BaseType::POINTER) {
            return pointedType->equals(other->pointedType);
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
};

struct Symbol {
    std::string name;
    SymbolKind kind;
    std::shared_ptr<Type> type;
    int scopeLevel;
    int lineNumber;
    bool isDefined;
    
    Symbol(const std::string& n, SymbolKind k, std::shared_ptr<Type> t, 
           int scope, int line)
        : name(n), kind(k), type(t), scopeLevel(scope), 
          lineNumber(line), isDefined(false) {}
};

class SymbolTable {
public:
    SymbolTable() : currentScope(0) {
        scopes.push_back(std::vector<std::string>());  // Global scope
    }
    
    void enterScope() {
        currentScope++;
        scopes.push_back(std::vector<std::string>());
    }
    
    void exitScope() {
        if (currentScope > 0) {
            // Remove all symbols in this scope
            for (const auto& name : scopes[currentScope]) {
                symbols.erase(name);
            }
            scopes.pop_back();
            currentScope--;
        }
    }
    
    bool insert(const std::string& name, std::shared_ptr<Type> type,
                SymbolKind kind, int line) {
        // Check if already defined in current scope
        auto it = symbols.find(name);
        if (it != symbols.end() && it->second->scopeLevel == currentScope) {
            return false;  // Already defined in this scope
        }
        
        auto symbol = std::make_shared<Symbol>(name, kind, type, currentScope, line);
        symbols[name] = symbol;
        scopes[currentScope].push_back(name);
        
        return true;
    }
    
    std::shared_ptr<Symbol> lookup(const std::string& name) {
        auto it = symbols.find(name);
        if (it != symbols.end()) {
            return it->second;
        }
        return nullptr;
    }
    
    std::shared_ptr<Symbol> lookupCurrentScope(const std::string& name) {
        auto it = symbols.find(name);
        if (it != symbols.end() && it->second->scopeLevel == currentScope) {
            return it->second;
        }
        return nullptr;
    }
    
    void markDefined(const std::string& name) {
        auto symbol = lookup(name);
        if (symbol) {
            symbol->isDefined = true;
        }
    }
    
    int getCurrentScope() const { return currentScope; }

private:
    std::unordered_map<std::string, std::shared_ptr<Symbol>> symbols;
    std::vector<std::vector<std::string>> scopes;  // Scope stack
    int currentScope;
};
```

### 4.2.3 Scope Management

```cpp
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
    
    void declareVariable(const std::string& name, std::shared_ptr<Type> type, int line) {
        if (!table.insert(name, type, SymbolKind::VARIABLE, line)) {
            error("Variable '" + name + "' already declared in this scope");
        }
    }
    
    void declareFunction(const std::string& name, std::shared_ptr<Type> type, int line) {
        if (!table.insert(name, type, SymbolKind::FUNCTION, line)) {
            error("Function '" + name + "' already declared");
        }
    }
    
    std::shared_ptr<Symbol> resolveSymbol(const std::string& name) {
        auto symbol = table.lookup(name);
        if (!symbol) {
            error("Undefined symbol: '" + name + "'");
        }
        return symbol;
    }
    
private:
    void error(const std::string& message) {
        std::cerr << "Semantic error: " << message << std::endl;
    }
};
```

## 4.3 Type Systems

A **type system** is a set of rules that assigns types to expressions and ensures type safety.

### 4.3.1 Type Categories

| Category | Examples |
|----------|----------|
| **Primitive** | int, float, char, void |
| **Derived** | arrays, pointers, functions |
| **User-defined** | structs, classes, enums |
| **Composite** | unions, records |

### 4.3.2 Type Compatibility

Type compatibility rules determine when types can be used together:

```cpp
// Implicit conversions (allowed)
int i = 42;           // int literal to int
float f = 3.14;       // double literal to float
int* p = 0;           // null pointer

// Explicit casts (allowed with cast)
int x = (int)3.14;   // Truncates to 3

// Type errors
int* p = "hello";    // ERROR: incompatible pointer types
int x = "hello";     // ERROR: cannot convert string to int
```

### 4.3.3 Type Checking Rules

```cpp
class TypeChecker {
public:
    bool areCompatible(std::shared_ptr<Type> t1, std::shared_ptr<Type> t2) {
        // Same type
        if (t1->equals(t2)) return true;
        
        // Implicit conversions
        if (t1->base == Type::BaseType::INT && 
            t2->base == Type::BaseType::FLOAT) return true;
        
        if (t1->base == Type::BaseType::FLOAT && 
            t2->base == Type::BaseType::INT) return true;
        
        // Array decay to pointer
        if (t1->base == Type::BaseType::POINTER &&
            t2->base == Type::BaseType::ARRAY) return true;
        
        return false;
    }
    
    std::shared_ptr<Type> getCommonType(std::shared_ptr<Type> t1, 
                                         std::shared_ptr<Type> t2) {
        if (t1->equals(t2)) return t1;
        
        // int + float -> float
        if ((t1->base == Type::BaseType::INT && t2->base == Type::BaseType::FLOAT) ||
            (t1->base == Type::BaseType::FLOAT && t2->base == Type::BaseType::INT)) {
            return Type::Float();
        }
        
        return Type::Int();  // Default
    }
    
    bool is ArithmeticType(std::shared_ptr<Type> t) {
        return t->base == Type::BaseType::INT ||
               t->base == Type::BaseType::FLOAT ||
               t->base == Type::BaseType::DOUBLE ||
               t->base == Type::BaseType::CHAR;
    }
    
    bool isScalarType(std::shared_ptr<Type> t) {
        return isArithmeticType(t) || 
               t->base == Type::BaseType::POINTER;
    }
    
    bool isVoidType(std::shared_ptr<Type> t) {
        return t->base == Type::BaseType::VOID;
    }
};
```

## 4.4 Semantic Analysis Pass

Now let's implement a semantic analyzer that traverses the AST and performs type checking and scope analysis.

### 4.4.1 Semantic Analyzer Header

```cpp
// SemanticAnalyzer.h
#ifndef SEMANTICANALYZER_H
#define SEMANTICANALYZER_H

#include "AST.h"
#include "SymbolTable.h"
#include <unordered_map>
#include <memory>

class SemanticAnalyzer : public ASTVisitor {
public:
    SemanticAnalyzer();
    void analyze(std::unique_ptr<Program>& program);
    
    // Visitor methods
    void visit(Program* node) override;
    void visit(FunctionDeclaration* node) override;
    void visit(VarDeclaration* node) override;
    void visit(CompoundStmt* node) override;
    void visit(SelectionStmt* node) override;
    void visit(IterationStmt* node) override;
    void visit(ReturnStmt* node) override;
    void visit(ExpressionStmt* node) override;
    std::shared_ptr<Type> visitExpr(Expr* node);
    std::shared_ptr<Type> visitExpr(IntegerLiteral* node);
    std::shared_ptr<Type> visitExpr(FloatLiteral* node);
    std::shared_ptr<Type> visitExpr(Identifier* node);
    std::shared_ptr<Type> visitExpr(BinaryExpr* node);
    std::shared_ptr<Type> visitExpr(CallExpr* node);

private:
    ScopeManager scopeManager;
    std::shared_ptr<Type> currentFunctionReturnType;
    std::shared_ptr<Type> expectedReturnType;
    bool inReturnContext;
    
    void error(const std::string& message, int line);
    void warning(const std::string& message, int line);
};

#endif // SEMANTICANALYZER_H
```

### 4.4.2 Semantic Analyzer Implementation

```cpp
// SemanticAnalyzer.cpp
#include "SemanticAnalyzer.h"
#include <iostream>

SemanticAnalyzer::SemanticAnalyzer() : currentFunctionReturnType(nullptr),
                                      expectedReturnType(nullptr),
                                      inReturnContext(false) {}

void SemanticAnalyzer::analyze(std::unique_ptr<Program>& program) {
    scopeManager.enterGlobalScope();
    program->accept(this);
    scopeManager.exitScope();
}

void SemanticAnalyzer::visit(Program* node) {
    for (auto& decl : node->declarations) {
        decl->accept(this);
    }
}

void SemanticAnalyzer::visit(FunctionDeclaration* node) {
    // Determine return type
    if (node->returnType == "int") {
        expectedReturnType = Type::Int();
    } else if (node->returnType == "float") {
        expectedReturnType = Type::Float();
    } else if (node->returnType == "void") {
        expectedReturnType = Type::Void();
    }
    
    // Create function type
    std::vector<std::shared_ptr<Type>> paramTypes;
    for (auto& param : node->params) {
        std::shared_ptr<Type> paramType;
        if (param.first == "int") {
            paramType = Type::Int();
        } else if (param.first == "float") {
            paramType = Type::Float();
        } else {
            paramType = Type::Void();
        }
        paramTypes.push_back(paramType);
    }
    
    auto funcType = Type::Function(expectedReturnType, paramTypes);
    
    // Declare function
    scopeManager.declareFunction(node->name, funcType, 0);
    
    // Enter function scope
    scopeManager.enterFunctionScope();
    
    // Add parameters to scope
    for (auto& param : node->params) {
        std::shared_ptr<Type> paramType;
        if (param.first == "int") {
            paramType = Type::Int();
        } else if (param.first == "float") {
            paramType = Type::Float();
        }
        scopeManager.declareVariable(param.second, paramType, 0);
    }
    
    // Visit function body
    if (node->body) {
        node->body->accept(this);
    }
    
    // Check for missing return in non-void functions
    if (expectedReturnType->base != Type::BaseType::VOID) {
        // In a real implementation, we'd track whether any return statement
        // was actually executed
    }
    
    scopeManager.exitScope();
}

void SemanticAnalyzer::visit(VarDeclaration* node) {
    std::shared_ptr<Type> varType;
    
    if (node->type == "int") {
        varType = Type::Int();
    } else if (node->type == "float") {
        varType = Type::Float();
    } else if (node->type == "void") {
        error("Variable cannot have void type", node->line);
        return;
    }
    
    scopeManager.declareVariable(node->name, varType, node->line);
}

void SemanticAnalyzer::visit(CompoundStmt* node) {
    scopeManager.enterBlockScope();
    
    for (auto& decl : node->declarations) {
        decl->accept(this);
    }
    
    for (auto& stmt : node->statements) {
        stmt->accept(this);
    }
    
    scopeManager.exitScope();
}

void SemanticAnalyzer::visit(SelectionStmt* node) {
    // Check condition type
    auto condType = visitExpr(node->condition.get());
    if (!typeChecker.isScalarType(condType)) {
        error("Condition must be scalar type, got " + condType->toString(), 0);
    }
    
    // Visit branches
    if (node->thenBranch) {
        node->thenBranch->accept(this);
    }
    
    if (node->elseBranch) {
        node->elseBranch->accept(this);
    }
}

void SemanticAnalyzer::visit(IterationStmt* node) {
    // Check condition type
    auto condType = visitExpr(node->condition.get());
    if (!typeChecker.isScalarType(condType)) {
        error("Loop condition must be scalar type", 0);
    }
    
    // Visit body
    if (node->body) {
        node->body->accept(this);
    }
}

void SemanticAnalyzer::visit(ReturnStmt* node) {
    if (node->expr) {
        auto exprType = visitExpr(node->expr.get());
        
        if (expectedReturnType->base == Type::BaseType::VOID) {
            warning("Return with value in void function", 0);
        } else if (!typeChecker.areCompatible(expectedReturnType, exprType)) {
            error("Return type mismatch: expected " + 
                  expectedReturnType->toString() + ", got " +
                  exprType->toString(), 0);
        }
    } else {
        if (expectedReturnType->base != Type::BaseType::VOID) {
            error("Return without value in non-void function", 0);
        }
    }
}

void SemanticAnalyzer::visit(ExpressionStmt* node) {
    if (node->expr) {
        visitExpr(node->expr.get());
    }
}

// Expression type checking
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
    auto symbol = scopeManager.resolveSymbol(node->name);
    if (symbol) {
        return symbol->type;
    }
    return Type::Int();  // Fallback
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(BinaryExpr* node) {
    auto leftType = visitExpr(node->left.get());
    auto rightType = visitExpr(node->right.get());
    
    switch (node->op) {
        case OpType::ADD:
        case OpType::SUB:
        case OpType::MUL:
        case OpType::DIV:
        case OpType::MOD: {
            if (!typeChecker.isArithmeticType(leftType)) {
                error("Left operand of arithmetic operator must be arithmetic type", 0);
            }
            if (!typeChecker.isArithmeticType(rightType)) {
                error("Right operand of arithmetic operator must be arithmetic type", 0);
            }
            return typeChecker.getCommonType(leftType, rightType);
        }
        
        case OpType::LT:
        case OpType::GT:
        case OpType::LE:
        case OpType::GE:
        case OpType::EQ:
        case OpType::NE: {
            if (!typeChecker.isArithmeticType(leftType) || 
                !typeChecker.isArithmeticType(rightType)) {
                error("Operands of comparison must be arithmetic types", 0);
            }
            return Type::Int();  // Comparison returns int (boolean)
        }
        
        case OpType::ASSIGN: {
            if (!typeChecker.areCompatible(leftType, rightType)) {
                error("Assignment type mismatch", 0);
            }
            return leftType;
        }
        
        default:
            return Type::Int();
    }
}

std::shared_ptr<Type> SemanticAnalyzer::visitExpr(CallExpr* node) {
    auto symbol = scopeManager.resolveSymbol(node->callee);
    if (!symbol) {
        error("Call to undefined function: " + node->callee, 0);
        return Type::Int();
    }
    
    if (symbol->kind != SymbolKind::FUNCTION) {
        error(node->callee + " is not a function", 0);
        return Type::Int();
    }
    
    auto funcType = std::static_pointer_cast<Type>(symbol->type);
    auto& paramTypes = funcType->paramTypes;
    
    // Check argument count
    if (node->args.size() != paramTypes.size()) {
        error("Argument count mismatch in call to " + node->callee, 0);
    }
    
    // Check argument types
    for (size_t i = 0; i < node->args.size() && i < paramTypes.size(); ++i) {
        auto argType = visitExpr(node->args[i].get());
        if (!typeChecker.areCompatible(paramTypes[i], argType)) {
            warning("Argument " + std::to_string(i + 1) + " type mismatch", 0);
        }
    }
    
    return funcType->returnType;
}

void SemanticAnalyzer::error(const std::string& message, int line) {
    std::cerr << "Error";
    if (line > 0) std::cerr << " at line " << line;
    std::cerr << ": " << message << std::endl;
    errorCount++;
}

void SemanticAnalyzer::warning(const std::string& message, int line) {
    std::cerr << "Warning";
    if (line > 0) std::cerr << " at line " << line;
    std::cerr << ": " << message << std::endl;
    warningCount++;
}
```

## 4.5 Attribute Grammars

**Attribute grammars** extend context-free grammars with attributes that carry semantic information during parsing.

### 4.5.1 Synthesized vs. Inherited Attributes

| Attribute Type | Direction | Example |
|----------------|-----------|---------|
| **Synthesized** | Bottom-up | Expression type computed from operands |
| **Inherited** | Top-down | Variable type passed to subexpressions |

### 4.5.2 Annotated Grammar Example

```
Type E → E1 + T   { E.type = getCommonType(E1.type, T.type) }
Type T → T1 * F   { T.type = getCommonType(T1.type, F.type) }
Type F → ( E )    { F.type = E.type }
Type F → num      { F.type = int }
```

## 4.6 Intermediate Code Generation

Semantic analysis often combines with intermediate code generation. The semantic analyzer annotates the AST and produces an intermediate representation.

### 4.6.1 Three-Address Code (TAC)

Three-address code is a simple IR where each instruction has at most three operands:

```assembly
t1 = 3 + 4      ; Temporary result
t2 = t1 * 5     ; Another temporary
t3 = a - b      ; Binary operation
if t3 > 0 goto L1  ; Conditional jump
L1:             ; Label
```

### 4.6.2 TAC Generator

```cpp
// TACGenerator.h
#ifndef TACGENERATOR_H
#define TACGENERATOR_H

#include <string>
#include <vector>
#include <memory>
#include <sstream>

enum class TacOp {
    ADD, SUB, MUL, DIV, MOD,
    NEG, ASSIGN,
    LT, GT, LE, GE, EQ, NE,
    AND, OR, NOT,
    GOTO, IF_GOTO,
    PARAM, CALL, RETURN,
    LABEL,
    LOAD, STORE,
    INDEX
};

struct TacInstruction {
    TacOp op;
    std::string arg1, arg2, result;
    std::string label;  // For labeled instructions
    
    std::string toString() const {
        std::ostringstream oss;
        if (!label.empty()) {
            oss << label << ": ";
        }
        
        switch (op) {
            case TacOp::ADD: case TacOp::SUB: case TacOp::MUL: 
            case TacOp::DIV: case TacOp::MOD:
            case TacOp::LT: case TacOp::GT: case TacOp::LE: 
            case TacOp::GE: case TacOp::EQ: case TacOp::NE:
                oss << result << " = " << arg1 << " " << opToString(op) << " " << arg2;
                break;
            case TacOp::NEG:
                oss << result << " = -" << arg1;
                break;
            case TacOp::ASSIGN:
                oss << result << " = " << arg1;
                break;
            case TacOp::GOTO:
                oss << "goto " << result;
                break;
            case TacOp::IF_GOTO:
                oss << "if " << arg1 << " goto " << result;
                break;
            case TacOp::LABEL:
                oss << "label " << result;
                break;
            case TacOp::PARAM:
                oss << "param " << arg1;
                break;
            case TacOp::CALL:
                oss << result << " = call " << arg1 << ", " << arg2;
                break;
            case TacOp::RETURN:
                if (!arg1.empty())
                    oss << "return " << arg1;
                else
                    oss << "return";
                break;
            case TacOp::LOAD:
                oss << result << " = load " << arg1;
                break;
            case TacOp::STORE:
                oss << "store " << arg1 << " -> " << result;
                break;
            default:
                oss << opToString(op) << " " << arg1 << ", " << arg2 << ", " << result;
        }
        return oss.str();
    }
    
    static std::string opToString(TacOp op) {
        switch (op) {
            case TacOp::ADD: return "+";
            case TacOp::SUB: return "-";
            case TacOp::MUL: return "*";
            case TacOp::DIV: return "/";
            case TacOp::MOD: return "%";
            case TacOp::LT: return "<";
            case TacOp::GT: return ">";
            case TacOp::LE: return "<=";
            case TacOp::GE: return ">=";
            case TacOp::EQ: return "==";
            case TacOp::NE: return "!=";
            case TacOp::AND: return "&&";
            case TacOp::OR: return "||";
            case TacOp::NOT: return "!";
            default: return "?";
        }
    }
};

class TACGenerator {
public:
    TACGenerator() : tempCount(0), labelCount(0) {}
    
    std::string newTemp() {
        return "t" + std::to_string(tempCount++);
    }
    
    std::string newLabel() {
        return "L" + std::to_string(labelCount++);
    }
    
    void emit(TacOp op, const std::string& result = "", 
              const std::string& arg1 = "", const std::string& arg2 = "",
              const std::string& label = "") {
        instructions.push_back({op, arg1, arg2, result, label});
    }
    
    std::string emitBinary(TacOp op, const std::string& arg1, const std::string& arg2) {
        std::string temp = newTemp();
        emit(op, temp, arg1, arg2);
        return temp;
    }
    
    void printAll() const {
        for (const auto& inst : instructions) {
            std::cout << inst.toString() << std::endl;
        }
    }

private:
    std::vector<TacInstruction> instructions;
    int tempCount;
    int labelCount;
};

#endif // TACGENERATOR_H
```

### 4.6.3 TAC Generation from AST

```cpp
// TACCodeGen.h
#include "TACGenerator.h"
#include "AST.h"

class TACCodeGen : public ASTVisitor {
public:
    TACCodeGen() : generator(std::make_unique<TACGenerator>()) {}
    
    std::unique_ptr<TACGenerator> generator;
    std::string currentResult;  // Holds the result of expression evaluation

private:
    // TAC instruction generation
    std::string emitExpr(Expr* expr);
    std::string emitIntegerLiteral(IntegerLiteral* node);
    std::string emitFloatLiteral(FloatLiteral* node);
    std::string emitIdentifier(Identifier* node);
    std::string emitBinaryExpr(BinaryExpr* node);
    std::string emitCallExpr(CallExpr* node);
    
    // Statement generation
    void emitStmt(Stmt* stmt);
    void emitCompoundStmt(CompoundStmt* node);
    void emitSelectionStmt(SelectionStmt* node);
    void emitIterationStmt(IterationStmt* node);
    void emitReturnStmt(ReturnStmt* node);
    
    // Declaration generation
    void emitDecl(Decl* decl);
    void emitFunctionDecl(FunctionDeclaration* node);
    void emitVarDecl(VarDeclaration* node);
};

std::string TACCodeGen::emitIntegerLiteral(IntegerLiteral* node) {
    return std::to_string(node->value);
}

std::string TACCodeGen::emitFloatLiteral(FloatLiteral* node) {
    std::ostringstream oss;
    oss << node->value;
    return oss.str();
}

std::string TACCodeGen::emitIdentifier(Identifier* node) {
    return node->name;
}

std::string TACCodeGen::emitBinaryExpr(BinaryExpr* node) {
    std::string leftVal = emitExpr(node->left.get());
    std::string rightVal = emitExpr(node->right.get());
    
    TacOp tacOp;
    switch (node->op) {
        case OpType::ADD: tacOp = TacOp::ADD; break;
        case OpType::SUB: tacOp = TacOp::SUB; break;
        case OpType::MUL: tacOp = TacOp::MUL; break;
        case OpType::DIV: tacOp = TacOp::DIV; break;
        case OpType::MOD: tacOp = TacOp::MOD; break;
        case OpType::LT: tacOp = TacOp::LT; break;
        case OpType::GT: tacOp = TacOp::GT; break;
        case OpType::LE: tacOp = TacOp::LE; break;
        case OpType::GE: tacOp = TacOp::GE; break;
        case OpType::EQ: tacOp = TacOp::EQ; break;
        case OpType::NE: tacOp = TacOp::NE; break;
        case OpType::ASSIGN: {
            generator->emit(TacOp::ASSIGN, leftVal, rightVal);
            return leftVal;
        }
        default: tacOp = TacOp::ADD;
    }
    
    return generator->emitBinary(tacOp, leftVal, rightVal);
}

std::string TACCodeGen::emitExpr(Expr* expr) {
    switch (expr->type) {
        case ExprType::INTEGER_LITERAL:
            return emitIntegerLiteral(static_cast<IntegerLiteral*>(expr));
        case ExprType::FLOAT_LITERAL:
            return emitFloatLiteral(static_cast<FloatLiteral*>(expr));
        case ExprType::IDENTIFIER:
            return emitIdentifier(static_cast<Identifier*>(expr));
        case ExprType::BINARY:
            return emitBinaryExpr(static_cast<BinaryExpr*>(expr));
        case ExprType::CALL:
            return emitCallExpr(static_cast<CallExpr*>(expr));
        default:
            return generator->newTemp();
    }
}

void TACCodeGen::emitSelectionStmt(SelectionStmt* node) {
    std::string condVal = emitExpr(node->condition.get());
    std::string elseLabel = generator->newLabel();
    std::string endLabel = generator->newLabel();
    
    // If not condition, jump to else
    generator->emit(TacOp::IF_GOTO, condVal, "", elseLabel);
    
    // Then branch
    emitStmt(node->thenBranch.get());
    generator->emit(TacOp::GOTO, endLabel);
    
    // Else label and branch
    generator->emit(TacOp::LABEL, elseLabel);
    if (node->elseBranch) {
        emitStmt(node->elseBranch.get());
    }
    
    generator->emit(TacOp::LABEL, endLabel);
}

void TACCodeGen::emitIterationStmt(IterationStmt* node) {
    std::string startLabel = generator->newLabel();
    std::string endLabel = generator->newLabel();
    
    generator->emit(TacOp::LABEL, startLabel);
    
    std::string condVal = emitExpr(node->condition.get());
    generator->emit(TacOp::IF_GOTO, condVal, "", endLabel);
    
    emitStmt(node->body.get());
    generator->emit(TacOp::GOTO, startLabel);
    
    generator->emit(TacOp::LABEL, endLabel);
}

void TACCodeGen::emitReturnStmt(ReturnStmt* node) {
    if (node->expr) {
        std::string retVal = emitExpr(node->expr.get());
        generator->emit(TacOp::RETURN, "", retVal);
    } else {
        generator->emit(TacOp::RETURN);
    }
}
```

## 4.7 Using Clang for Semantic Analysis

Clang provides rich APIs for semantic analysis and AST manipulation.

### 4.7.1 Type Queries

```cpp
#include <clang/AST/Type.h>

void analyzeTypes(FunctionDecl *FD) {
    for (auto *Param : FD->parameters()) {
        QualType QT = Param->getType();
        
        // Check if pointer
        if (QT->isPointerType()) {
            std::cout << Param->getNameAsString() << " is a pointer\n";
        }
        
        // Check if array
        if (QT->isArrayType()) {
            std::cout << Param->getNameAsString() << " is an array\n";
        }
        
        // Get canonical type
        QualType Canonical = QT.getCanonicalType();
        
        // Get unqualified type (remove const/volatile)
        QualType Unqualified = QT.getNonReferenceType().getUnqualifiedType();
    }
}
```

### 4.7.2 Decl/Ref Lookups

```cpp
#include <clang/AST/Expr.h>

class DeclFinder : public RecursiveASTVisitor<DeclFinder> {
public:
    bool VisitDeclRefExpr(DeclRefExpr *Expr) {
        std::cout << "Found reference to: " 
                  << Expr->getDecl()->getNameAsString() << "\n";
        return true;
    }
};
```

## Summary

This chapter covered the essential concepts of semantic analysis:

1. **Symbol Tables**: Tracking declarations and resolving identifiers
2. **Scope Management**: Hierarchical scope handling with proper entry/exit
3. **Type Systems**: Type representations and compatibility rules
4. **Type Checking**: Verifying type safety of operations
5. **Semantic Analysis Pass**: Traversing AST with context awareness
6. **Three-Address Code**: Simple intermediate representation
7. **Clang APIs**: Production-quality semantic analysis tools

The semantic analyzer transforms the AST into an annotated version with resolved types and symbols, preparing it for code generation.

---

## Exercises

### Exercise 4.1: Symbol Table Implementation
Extend the symbol table to support:
1. Multiple symbol kinds (variable, function, parameter, type)
2. Forward declarations
3. Conflict detection

### Exercise 4.2: Type Coercion
Implement implicit type coercion rules:
- int + float → float
- float = int → implicit conversion
- Array indexing checks

### Exercise 4.3: Error Recovery
Improve error reporting:
1. Add line and column information to errors
2. Suggest similar identifiers when a lookup fails
3. Implement partial error recovery

### Exercise 4.4: TAC Generation
Extend the TAC generator to support:
1. Function call conventions
2. Local variable allocation
3. Short-circuit evaluation for && and ||

### Exercise 4.5: Clang Semantic Analysis
Write a Clang tool that:
1. Finds all functions that don't have a return statement
2. Reports functions with empty bodies
3. Identifies unused variables

### Exercise 4.6: Control Flow Analysis
Implement basic control flow analysis:
1. Build a control flow graph (CFG)
2. Identify basic blocks
3. Detect unreachable code

### Exercise 4.7: Constant Folding
Implement constant folding in the semantic analyzer:
- Replace `2 + 3` with `5`
- Evaluate `if (1)` to always true branch
- Fold constant array initializers

---

**[Next Chapter: 第五章_LLVM中間表示層(IR).md](第五章_LLVM中間表示層(IR).md)**

---

## References

1. Aho, A. V., et al. *Compilers: Principles, Techniques, and Tools* (2nd ed.). Addison-Wesley.

2. LLVM Language Reference: https://llvm.org/docs/LangRef.html

3. Clang AST Documentation: https://clang.llvm.org/docs/IntroductionToTheClangAST.html

4. Dragon Book: Chapter on Semantic Analysis

5. LLVM Programmer's Manual: https://llvm.org/docs/ProgrammersManual.html
