class Grammar:
    def __init__(self):
        self.rules = {}

    def add_rule(self, non_terminal, production):
        if non_terminal not in self.rules:
            self.rules[non_terminal] = []
        self.rules[non_terminal].append(production)

class CYK_Parser:
    def __init__(self, grammar):
        self.grammar = grammar

    def parse(self, string):
        n = len(string)
        table = [[set() for _ in range(n)] for _ in range(n)]
        backtrace = [[{} for _ in range(n)] for _ in range(n)]
       
        for i, symbol in enumerate(string):
            for non_terminal, productions in self.grammar.rules.items():
                for production in productions:
                    if production == symbol:
                        table[i][i].add(non_terminal)
                        backtrace[i][i][non_terminal] = (production, None, None)
       
        for length in range(2, n + 1):
            for start in range(n - length + 1):  
                end = start + length - 1
                for split in range(start, end):
                    for A, productions in self.grammar.rules.items():
                        for production in productions:
                            if len(production) == 2:
                                B, C = production[0], production[1]
                                if B in table[start][split] and C in table[split + 1][end]:
                                    table[start][end].add(A)
                                    backtrace[start][end][A] = (production, (start, split), (split + 1, end))
       
        start_symbol = 'S'
        accepted = start_symbol in table[0][n - 1]
        return accepted, table, backtrace
       
    def print_parse_steps(self, string, table):
        n = len(string)
       
        print("Шаги CYK разбора:")
       
        print("Строка: ", " ".join(string))
       
        for level in range(n):
            row = []
            for start in range(n - level):
                cell = "{" + ", ".join(sorted(table[start][start + level])) + "}"
                row.append(cell)
            print(f"Уровень {level+1}: ", "  ".join(row))

    def generate_parse_trace(self, i, j, symbol, backtrace):
        if symbol not in backtrace[i][j]:
            return []

        rule, left, right = backtrace[i][j][symbol]
        steps = []
        
        if len(rule) == 1:
            steps.append(f"{symbol} -> {rule}")
        else:
            B, C = rule
            steps.append(f"{symbol} -> {B}{C}")
            
            if left is not None:
                steps.extend(self.generate_parse_trace(left[0], left[1], B, backtrace))
            if right is not None:
                steps.extend(self.generate_parse_trace(right[0], right[1], C, backtrace))
        
        return steps


# Создание грамматики
grammar = Grammar()
grammar.add_rule("X", "+")
grammar.add_rule("A", "a")
grammar.add_rule("B", "b")
grammar.add_rule("C", "c")
grammar.add_rule("S", "XT")
grammar.add_rule("T", "BV")
grammar.add_rule("V", "AE")
grammar.add_rule("V", "b")
grammar.add_rule("E", "VC")

string = "+baabccc"
# string = "+baabcc"
parser = CYK_Parser(grammar)
accepted, table, backtrace = parser.parse(string)

parser.print_parse_steps(string, table)
print("Строка принята" if accepted else "Строка не принята")

if accepted:
    print("\nШаги генерации вывода:")
    trace = parser.generate_parse_trace(0, len(string) - 1, 'S', backtrace)
    for step in trace:
        print(step)

