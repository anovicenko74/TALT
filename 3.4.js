class CFG {
  constructor(rules) {
    this.rules = rules;
  }

  generate(symbol) {
    if (!this.rules[symbol]) {
      return symbol;
    }
    const expansion =
      this.rules[symbol][Math.floor(Math.random() * this.rules[symbol].length)];
    return expansion.map(sym => this.generate(sym)).join('');
  }
}

console.log('--- НАЧАЛЬНАЯ ФОРМА ---')
const rules = {
  S: [['T', 'U']],
  T: [['2', '*', '2', '*', '2', "T'"]],
  "T'": [['*', '2', "T'", "U'"], ['']],
  U: [['-', '1', '-', '1']],
  "U'": [['-1']],
};
const cfg = new CFG(rules);
for (let i = 0; i < 10; i++) {
  console.log(cfg.generate('S'));
}

console.log('--- Н/Ф Хомского ---')
const hRules = {
  S: [['T', 'U']],
  T: [['X1', "A"]],
  A: [['X2', "B"]],
  B: [['X1', "C"]],
  C: [['X2', "D"]],
  D: [['X1', "T'"]],
  "T'": [['X2', "A'"], ['']],
  "A'": [['X1', "B'"]],
  "B'": [["T'", "U'"]],
  "U": [["Y2", "Z"]],
  "Z": [["Y1", "U'"]],
  "U'": [["Y2", "Y1"]],
  X1: [["2"]],
  X2: [["*"]],
  Y1: [["1"]],
  Y2: [["-"]],
};
const newCfg = new CFG(hRules);
for (let i = 0; i < 10; i++) {
  console.log(newCfg.generate('S'));
}

console.log('--- Н/Ф Грейбах ---')
const gnfCfg = new CFG(hRules);
for (let i = 0; i < 10; i++) {
  console.log(gnfCfg.generate('S'));
}
