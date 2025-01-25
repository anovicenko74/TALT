function toChomskyNormalForm(grammar) {
    const newGrammar = JSON.parse(JSON.stringify(grammar));
    const newNonTerminals = new Set(Object.keys(newGrammar));
    let nextNonTerminal = 1;

    function getNewNonTerminal() {
        let newNonTerminal;
        do {
            newNonTerminal = `X${nextNonTerminal++}`;
        } while (newNonTerminals.has(newNonTerminal));
        newNonTerminals.add(newNonTerminal);
        return newNonTerminal;
    }

    function replaceTerminals(rhs) {
        return rhs.map(symbol => {
            if (newGrammar[symbol]) {
                return symbol;
            } else {
                const newNonTerminal = getNewNonTerminal();
                newGrammar[newNonTerminal] = [[symbol]];
                return newNonTerminal;
            }
        });
    }

    // Step 1: Remove epsilon productions
    const nullable = new Set();
    for (const [lhs, rhsList] of Object.entries(newGrammar)) {
        for (const rhs of rhsList) {
            if (rhs.length === 0) {
                nullable.add(lhs);
            }
        }
    }

    let changed;
    do {
        changed = false;
        for (const [lhs, rhsList] of Object.entries(newGrammar)) {
            for (const rhs of rhsList) {
                if (rhs.some(sym => nullable.has(sym)) && !nullable.has(lhs)) {
                    nullable.add(lhs);
                    changed = true;
                }
            }
        }
    } while (changed);

    for (const [lhs, rhsList] of Object.entries(newGrammar)) {
        const newRhsList = [];
        for (const rhs of rhsList) {
            const subsets = getSubsets(rhs.filter(sym => nullable.has(sym)));
            for (const subset of subsets) {
                const newRhs = rhs.filter(sym => !nullable.has(sym)).concat(subset);
                if (newRhs.length > 0) {
                    newRhsList.push(newRhs);
                }
            }
        }
        newGrammar[lhs] = newRhsList;
    }

    // Step 2: Remove unit productions
    const unitPairs = new Set();
    for (const [lhs, rhsList] of Object.entries(newGrammar)) {
        for (const rhs of rhsList) {
            if (rhs.length === 1 && newGrammar[rhs[0]]) {
                unitPairs.add([lhs, rhs[0]]);
            }
        }
    }

    do {
        changed = false;
        for (const [lhs, rhsList] of Object.entries(newGrammar)) {
            for (const rhs of rhsList) {
                if (rhs.length === 1 && newGrammar[rhs[0]]) {
                    for (const [lhs2, rhs2] of Object.entries(newGrammar)) {
                        if (rhs2.some(r => r.length === 1 && r[0] === lhs)) {
                            unitPairs.add([lhs2, rhs[0]]);
                            changed = true;
                        }
                    }
                }
            }
        }
    } while (changed);

    for (const [lhs, rhsList] of Object.entries(newGrammar)) {
        newGrammar[lhs] = rhsList.filter(rhs => !(rhs.length === 1 && newGrammar[rhs[0]]));
    }

    for (const [lhs, rhs] of unitPairs) {
        newGrammar[lhs] = newGrammar[lhs].concat(newGrammar[rhs]);
    }

    // Step 3: Convert to Chomsky Normal Form
    for (const [lhs, rhsList] of Object.entries(newGrammar)) {
        const newRhsList = [];
        for (const rhs of rhsList) {
            if (rhs.length > 2) {
                let current = rhs[0];
                for (let i = 1; i < rhs.length - 1; i++) {
                    const newNonTerminal = getNewNonTerminal();
                    newGrammar[newNonTerminal] = [[current, rhs[i]]];
                    current = newNonTerminal;
                }
                newRhsList.push([current, rhs[rhs.length - 1]]);
            } else if (rhs.length === 2) {
                newRhsList.push(replaceTerminals(rhs));
            } else if (rhs.length === 1 && !newGrammar[rhs[0]]) {
                const newNonTerminal = getNewNonTerminal();
                newGrammar[newNonTerminal] = [[rhs[0]]];
                newRhsList.push([newNonTerminal]);
            }
        }
        newGrammar[lhs] = newRhsList;
    }

    return newGrammar;
}

function getSubsets(array) {
    return array.reduce(
        (subsets, value) => subsets.concat(subsets.map(set => [value, ...set])),
        [[]]
    );
}

// Example usage:
const grammar = {
    S: [['+', 'B', 'A']],
    B: [['b']],
    A: [['a', 'A', 'c'], ['a', 'b', 'c']],
};

const cnfGrammar = toChomskyNormalForm(grammar);
console.log(cnfGrammar);
