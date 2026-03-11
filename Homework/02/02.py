import re

# ==========================================================
# 1. LEXER
# ==========================================================
TOKEN_SPEC = [
    ('NUMBER',   r'\d+'),
    ('ID',       r'[a-zA-Z_]\w*'),
    ('ASSIGN',   r'='),
    ('END',      r';'),
    ('OP',       r'==|<=|>=|<|>|[+\-*/]'), # Order matters: match == before =
    ('LPAREN',   r'\('),
    ('RPAREN',   r'\)'),
    ('LBRACE',   r'\{'),
    ('RBRACE',   r'\}'),
    ('SKIP',     r'[ \t\n\r]+'),
]

def tokenize(code):
    tokens = []
    re_tokens = '|'.join('(?P<%s>%s)' % pair for pair in TOKEN_SPEC)
    for mo in re.finditer(re_tokens, code):
        kind = mo.lastgroup
        value = mo.group()
        if kind == 'SKIP': continue
        tokens.append((kind, value))
    return tokens

# ==========================================================
# 2. PARSER
# ==========================================================
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self, offset=0):
        index = self.pos + offset
        return self.tokens[index] if index < len(self.tokens) else (None, None)

    def consume(self, expected_kind=None):
        kind, value = self.peek()
        if expected_kind and kind != expected_kind:
            raise RuntimeError(f"Line unknown: Expected {expected_kind}, got {kind} ('{value}')")
        self.pos += 1
        return value

    def parse_program(self):
        stmts = []
        while self.pos < len(self.tokens):
            stmts.append(self.parse_statement())
        return stmts

    def parse_statement(self):
        kind, val = self.peek()
        if val == "let":
            self.consume(); name = self.consume("ID"); self.consume("ASSIGN")
            expr = self.parse_expression(); self.consume("END")
            return ('LET', name, expr)
        elif val == "print":
            self.consume(); self.consume("LPAREN")
            expr = self.parse_expression(); self.consume("RPAREN"); self.consume("END")
            return ('PRINT', expr)
        elif val == "if":
            self.consume(); self.consume("LPAREN"); cond = self.parse_expression(); self.consume("RPAREN")
            self.consume("LBRACE"); body = []
            while self.peek()[0] != "RBRACE": body.append(self.parse_statement())
            self.consume("RBRACE")
            return ('IF', cond, body)
        elif val == "while":
            self.consume(); self.consume("LPAREN"); cond = self.parse_expression(); self.consume("RPAREN")
            self.consume("LBRACE"); body = []
            while self.peek()[0] != "RBRACE": body.append(self.parse_statement())
            self.consume("RBRACE")
            return ('WHILE', cond, body)
        else:
            name = self.consume("ID"); self.consume("ASSIGN")
            expr = self.parse_expression(); self.consume("END")
            return ('ASSIGN', name, expr)

    def parse_expression(self):
        # Handles +, -, <, >, ==, etc.
        left = self.parse_term()
        while self.peek()[0] == 'OP' and self.peek()[1] in ('+', '-', '<', '>', '==', '<=', '>='):
            op = self.consume('OP')
            right = self.parse_term()
            left = ('BINOP', op, left, right)
        return left

    def parse_term(self):
        # Handles *, /
        left = self.parse_factor()
        while self.peek()[0] == 'OP' and self.peek()[1] in ('*', '/'):
            op = self.consume('OP')
            right = self.parse_factor()
            left = ('BINOP', op, left, right)
        return left

    def parse_factor(self):
        kind, val = self.peek()
        if kind == 'NUMBER': return ('NUM', int(self.consume()))
        if kind == 'ID': return ('VAR', self.consume())
        if kind == 'LPAREN':
            self.consume(); e = self.parse_expression(); self.consume("RPAREN")
            return e
        raise RuntimeError(f"Unexpected token in expression: {kind} ({val})")

# ==========================================================
# 3. COMPILER
# ==========================================================
class Compiler:
    def gen(self, node):
        ntype = node[0]
        if ntype == 'NUM': return [('PUSH', node[1])]
        if ntype == 'VAR': return [('LOAD', node[1])]
        if ntype == 'BINOP': return self.gen(node[2]) + self.gen(node[3]) + [('OP', node[1])]
        if ntype in ('LET', 'ASSIGN'): return self.gen(node[2]) + [('STORE', node[1])]
        if ntype == 'PRINT': return self.gen(node[1]) + [('PRINT',)]
        if ntype == 'IF':
            cond = self.gen(node[1]); body = []
            for s in node[2]: body += self.gen(s)
            return cond + [('JUMP_IF_FALSE', len(body) + 1)] + body
        if ntype == 'WHILE':
            cond = self.gen(node[1]); body = []
            for s in node[2]: body += self.gen(s)
            # Jump if false to exit, otherwise run body and jump back to start
            return cond + [('JUMP_IF_FALSE', len(body) + 2)] + body + [('JUMP', -(len(body) + len(cond) + 1))]
        return []

# ==========================================================
# 4. VIRTUAL MACHINE
# ==========================================================
class VM:
    def run(self, code):
        stack, env, pc = [], {}, 0
        while pc < len(code):
            instr, *args = code[pc]
            if instr == 'PUSH': stack.append(args[0])
            elif instr == 'LOAD': stack.append(env[args[0]])
            elif instr == 'STORE': env[args[0]] = stack.pop()
            elif instr == 'PRINT': print(f"Output: {stack.pop()}")
            elif instr == 'OP':
                b, a = stack.pop(), stack.pop()
                op = args[0]
                if op == '+': stack.append(a + b)
                elif op == '-': stack.append(a - b)
                elif op == '*': stack.append(a * b)
                elif op == '/': stack.append(a // b)
                elif op == '<': stack.append(1 if a < b else 0)
                elif op == '>': stack.append(1 if a > b else 0)
                elif op == '==': stack.append(1 if a == b else 0)
            elif instr == 'JUMP_IF_FALSE':
                if stack.pop() == 0: pc += args[0] - 1
            elif instr == 'JUMP':
                pc += args[0] - 1
            pc += 1

# ==========================================================
# EXECUTION
# ==========================================================
if __name__ == "__main__":
    source_code = """
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
    """
    
    print("Compiling and Running...")
    tokens = tokenize(source_code)
    parser = Parser(tokens)
    ast = parser.parse_program()
    
    compiler = Compiler()
    bytecode = []
    for stmt in ast:
        bytecode += compiler.gen(stmt)
    
    vm = VM()
    vm.run(bytecode)