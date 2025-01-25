import sys
import time
import tracemalloc


class Grammar:
    def __init__(self):
        self.rules = {}

    def add_rule(self, non_terminal, production):
        if non_terminal not in self.rules:
            self.rules[non_terminal] = []
        self.rules[non_terminal].append(production)


class OptimizedCYK_Parser:
    def __init__(self, grammar, max_length=1000, memory_limit_mb=500):
        self.grammar = grammar
        self.max_length = max_length
        self.memory_limit_mb = memory_limit_mb

    def parse(self, string):
        n = len(string)
        try:
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

        except Exception as e:
            print(f"CYK: Ошибка - {e}")
            return False, None, None

    def print_parse_steps(self, string, table):
        n = len(string)

        print("Шаги CYK разбора:")

        print("Строка: ", " ".join(string))

        for level in range(n):
            row = []
            for start in range(n - level):
                cell = "{" + ", ".join(sorted(table[start][start + level])) + "}"
                row.append(cell)
            print(f"Уровень {level + 1}: ", "  ".join(row))

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


class OptimizedEarleyParser:
    def __init__(self, grammar, max_length=1000, max_states=10000):
        self.grammar = grammar
        self.max_length = max_length
        self.max_states = max_states

    def parse(self, string):
        n = len(string)
        chart = [[] for _ in range(n + 1)]

        print("Шаги Earley разбора:")
        print("Разбираемая строка:", " ".join(string))

        # Добавляем начальное правило для S
        start_rules = self.grammar.rules['S']
        for start_rule in start_rules:
            initial_rule = ('S', ["."] + list(start_rule))
            chart[0].append((initial_rule, 0))
            print(f"  [Инициализация] Добавлено начальное правило: {initial_rule}")

        try:
            for i in range(n + 1):
                print(f"\n  Итерация {i}:")
                if len(chart[i]) > self.max_states:
                    print("  Превышено максимальное количество состояний")
                    return False

                j = 0
                while j < len(chart[i]):
                    state = chart[i][j]
                    rule, origin = state
                    lhs, rhs = rule
                    dot_index = rhs.index(".")
                    current_symbol = rhs[dot_index + 1] if dot_index < len(rhs) - 1 else None

                    if dot_index < len(rhs) - 1:
                        next_symbol = rhs[dot_index + 1]
                        if next_symbol in self.grammar.rules:

                            self.predict(chart, i, next_symbol)
                        elif i < n and next_symbol == string[i]:

                            self.scan(chart, state, i)
                    else:

                        self.complete(chart, state, i)

                    j += 1

            # Вывод финальной таблицы состояний
            print("\nФинальная таблица состояний:")
            for i, states in enumerate(chart):
                print(f"  chart[{i}]:")
                for state in states:
                    rule, origin = state
                    lhs, rhs = rule
                    print(f"    {lhs} -> {' '.join(rhs)}, Начало: {origin}")

            # Проверка на принятие строки
            for state in chart[n]:
                rule, origin = state
                lhs, rhs = rule
                if lhs == 'S' and rhs[-1] == "." and origin == 0:
                    print("\n  Строка принята!")
                    return True

            print("\n  Строка не принята.")
            return False

        except Exception as e:
            print(f"Earley: Ошибка - {e}")
            return False

    def predict(self, chart, position, non_terminal):
        if non_terminal in self.grammar.rules:
            for production in self.grammar.rules[non_terminal]:
                rule = (non_terminal, ["."] + list(production))
                state = (rule, position)
                if state not in chart[position]:
                    chart[position].append(state)

    def scan(self, chart, state, position):
        rule, origin = state
        lhs, rhs = rule
        dot_index = rhs.index(".")
        if position + 1 < len(chart):
            new_rhs = rhs[:dot_index] + [rhs[dot_index + 1], "."] + rhs[dot_index + 2:]
            new_state = ((lhs, new_rhs), origin)
            chart[position + 1].append(new_state)

    def complete(self, chart, state, position):
        rule, origin = state
        lhs, rhs = rule
        dot_index = rhs.index(".")
        if dot_index == len(rhs) - 1:
            for prev_state in chart[origin]:
                prev_rule, prev_origin = prev_state
                prev_lhs, prev_rhs = prev_rule
                prev_dot_index = prev_rhs.index(".")
                if prev_dot_index < len(prev_rhs) - 1 and prev_rhs[prev_dot_index + 1] == lhs:
                    new_rhs = prev_rhs[:prev_dot_index] + [lhs, "."] + prev_rhs[prev_dot_index + 2:]
                    new_state = ((prev_lhs, new_rhs), prev_origin)
                    if new_state not in chart[position]:
                        chart[position].append(new_state)


def performance_test(string):
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

    string = "+baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"

    # CYK парсер
    start_time = time.time()
    cyk_parser = OptimizedCYK_Parser(grammar)
    accepted_cyk, table, backtrace = cyk_parser.parse(string)
    cyk_time = time.time() - start_time

    if accepted_cyk:
        cyk_parser.print_parse_steps(string, table)
        print("Строка принята (CYK)")

        print("\nШаги генерации вывода:")
        trace = cyk_parser.generate_parse_trace(0, len(string) - 1, 'S', backtrace)
        for step in trace:
            print(step)
    else:
        print("Строка не принята (CYK)")

    # Earley парсер
    start_time = time.time()
    earley_parser = OptimizedEarleyParser(grammar)
    accepted_earley = earley_parser.parse(string)
    earley_time = time.time() - start_time

    print(f"\nПроизводительность для строки длиной {len(string)}:")
    print(f"CYK Accept: {accepted_cyk}, Time: {cyk_time:.4f} сек")
    print(f"Earley Accept: {accepted_earley}, Time: {earley_time:.4f} сек")


# Тестирование
test_strings = [
    "+abbbbbccccc",  # Строка из 12 символов
    "+a" + "b" * 70 + "c" * 70  # Строка между 100 и 150 символов
]

for test_string in test_strings:
    performance_test(test_string)