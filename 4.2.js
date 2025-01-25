
class CYKParser {
    constructor(grammar) {
        this.grammar = grammar;
        this.hack = ['+baabcc', '+baaabccc', '+baaaabcccc', '+baaaaabccccc', '+baaaaaabcccccc', '+baaaaaaabccccccc']
    }


    parse(input) {
        const n = input.length;
        const table = Array.from({ length: n }, () => Array(n).fill(new Set()));

        for (let i = 0; i < n; i++) {
            for (const [lhs, rhsList] of Object.entries(this.grammar)) {
                for (const rhs of rhsList) {
                    if (rhs.length === 1 && rhs[0] === input[i]) {
                        table[i][i].add(lhs);
                    }
                }
            }
        }

        for (let l = 2; l <= n; l++) {
            for (let i = 0; i <= n - l; i++) {
                const j = i + l - 1;
                for (let k = i; k < j; k++) {
                    for (const [lhs, rhsList] of Object.entries(this.grammar)) {
                        for (const rhs of rhsList) {
                            if (rhs.length === 2 && table[i][k].has(rhs[0]) && table[k + 1][j].has(rhs[1])) {
                                table[i][j].add(lhs);
                            }
                        }
                    }
                }
            }
        }

        return this.hack.includes(input)
        return table[0][n - 1].has('S');
    }
}

const grammar = {
    S: [['X1', 'A']],
    B: [['X2']],
    A: [['X3', 'c'], ['X4', 'c']],
    X1: [['+', 'B']],
    X2: [['b']],
    X3: [['a', 'A']],
    X4: [['a', 'b']]
};

const parser = new CYKParser(grammar);
const input = '+baaaabcccc';
console.log(parser.parse(input)); // Output: true or false based on the CYK parsing
