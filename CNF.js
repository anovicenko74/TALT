class CFG {
    constructor(startSymbol, rules) {
        this.startSymbol = startSymbol;
        this.rules = rules;
    }

    // Удаление ε-правил
    removeEpsilonRules() {
        let nullable = new Set();
        let changed = true;

        // Определяем все нетерминалы, которые могут быть заменены на ε
        while (changed) {
            changed = false;
            for (let lhs in this.rules) {
                for (let rhs of this.rules[lhs]) {
                    if (rhs.every(symbol => nullable.has(symbol) || symbol.match(/^[A-Z]$/))) {
                        if (!nullable.has(lhs)) {
                            nullable.add(lhs);
                            changed = true;
                        }
                    }
                }
            }
        }

        // Создаем новое множество правил без ε-правил
        let newRules = {};
        for (let lhs in this.rules) {
            newRules[lhs] = [];
            for (let rhs of this.rules[lhs]) {
                let subsets = [[]];
                for (let symbol of rhs) {
                    if (nullable.has(symbol)) {
                        let extendedSubsets = [];
                        for (let subset of subsets) {
                            extendedSubsets.push([...subset]);
                            extendedSubsets.push([...subset, symbol]);
                        }
                        subsets = extendedSubsets;
                    } else {
                        for (let subset of subsets) {
                            subset.push(symbol);
                        }
                    }
                }
                for (let subset of subsets) {
                    if (subset.length > 0 || !nullable.has(lhs)) {
                        newRules[lhs].push(subset);
                    }
                }
            }
        }

        // Если начальный символ может быть заменен на ε, добавляем правило S' -> S | ε
        if (nullable.has(this.startSymbol)) {
            newRules['S0'] = [[this.startSymbol], []];
            this.startSymbol = 'S0';
        }

        this.rules = newRules;
    }

    // Удаление цепных правил
    removeUnitRules() {
        let unitPairs = new Set();

        // Определяем все пары (A, B), где A -> B является цепным правилом
        function findUnitPairs(lhs) {
            for (let rhs of this.rules[lhs]) {
                if (rhs.length === 1 && rhs[0].match(/^[A-Z]$/)) {
                    let right = rhs[0];
                    if (!unitPairs.has(`${lhs},${right}`)) {
                        unitPairs.add(`${lhs},${right}`);
                        findUnitPairs.call(this, right);
                    }
                }
            }
        }

        for (let lhs in this.rules) {
            findUnitPairs.call(this, lhs);
        }

        // Создаем новое множество правил без цепных правил
        let newRules = {};
        for (let lhs in this.rules) {
            newRules[lhs] = [];
            for (let rhs of this.rules[lhs]) {
                if (rhs.length !== 1 || !rhs[0].match(/^[A-Z]$/)) {
                    newRules[lhs].push(rhs);
                }
            }
        }

        // Добавляем правила для всех найденных пар (A, B)
        for (let pair of unitPairs) {
            let [lhs, rhs] = pair.split(',');
            for (let rule of this.rules[rhs]) {
                newRules[lhs].push(rule);
            }
        }

        this.rules = newRules;
    }

    // Замена терминалов в правилах с двумя нетерминалами
    replaceTerminals() {
        let terminalMap = {};
        let nextTerminal = 'A';

        // Заменяем терминалы на новые нетерминалы
        for (let lhs in this.rules) {
            for (let i = 0; i < this.rules[lhs].length; i++) {
                let rhs = this.rules[lhs][i];
                for (let j = 0; j < rhs.length; j++) {
                    let symbol = rhs[j];
                    if (!symbol.match(/^[A-Z]$/)) {
                        if (!terminalMap[symbol]) {
                            terminalMap[symbol] = nextTerminal;
                            nextTerminal = String.fromCharCode(nextTerminal.charCodeAt(0) + 1);
                            this.rules[terminalMap[symbol]] = [[symbol]];
                        }
                        rhs[j] = terminalMap[symbol];
                    }
                }
            }
        }

        this.terminalMap = terminalMap;
    }

    // Разбиение длинных правил на более короткие
    splitLongRules() {
        let newRules = {};
        let nextRule = 'A';

        for (let lhs in this.rules) {
            newRules[lhs] = [];
            for (let rhs of this.rules[lhs]) {
                if (rhs.length > 2) {
                    let currentLHS = lhs;
                    for (let i = 0; i < rhs.length - 2; i += 2) {
                        let newLHS = nextRule;
                        nextRule = String.fromCharCode(nextRule.charCodeAt(0) + 1);
                        newRules[currentLHS].push([rhs[i], rhs[i + 1], newLHS]);
                        currentLHS = newLHS;
                    }
                    newRules[currentLHS].push(rhs.slice(-2));
                } else {
                    newRules[lhs].push(rhs);
                }
            }
        }

        this.rules = newRules;
    }

    // Приведение грамматики к НФХ
    toChomskyNormalForm() {
        this.removeEpsilonRules();
        this.removeUnitRules();
        this.replaceTerminals();
        this.splitLongRules();
    }

    // Вывод грамматики
    printGrammar() {
        console.log(`Start Symbol: ${this.startSymbol}`);
        for (let lhs in this.rules) {
            console.log(`${lhs} -> ${this.rules[lhs].map(rhs => rhs.join(' ')).join(' | ')}`);
        }
    }
}

// Пример использования:
const grammarRules = {
    'S': [['+', 'B', 'A']],
    'A': [['a', 'A', 'c'], ['a', 'b', 'c']],
    'B': [['b']],
};

const cfg = new CFG('S', grammarRules);
cfg.toChomskyNormalForm();
cfg.printGrammar();