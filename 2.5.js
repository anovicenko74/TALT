class DFA {
  constructor(states, alphabet, transitionFunction, startState, acceptStates) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitionFunction = transitionFunction;
    this.startState = startState;
    this.acceptStates = acceptStates;
  }

  accepts(inputString) {
    let currentState = this.startState;
    for (let symbol of inputString) {
      if (!this.alphabet.includes(symbol)) {
        return false;
      }
      const nextState = this.transitionFunction[currentState][symbol];
      if (nextState === undefined) {
        return false;
      }
      currentState = nextState;
    }
    return this.acceptStates.includes(currentState);
  }
}

function intersection(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      if (
        dfa1.acceptStates.includes(state1) &&
        dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      transitionFunction[newState] = {};
      for (let symbol of dfa1.alphabet) {
        const nextState1 = dfa1.transitionFunction[state1][symbol];
        const nextState2 = dfa2.transitionFunction[state2][symbol];
        if (nextState1 !== undefined && nextState2 !== undefined) {
          transitionFunction[newState][symbol] = `${nextState1},${nextState2}`;
        }
      }
    }
  }

  return new DFA(
    states,
    dfa1.alphabet,
    transitionFunction,
    `${dfa1.startState},${dfa2.startState}`,
    acceptStates
  );
}

function union(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      if (
        dfa1.acceptStates.includes(state1) ||
        dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      transitionFunction[newState] = {};
      for (let symbol of dfa1.alphabet) {
        const nextState1 = dfa1.transitionFunction[state1][symbol];
        const nextState2 = dfa2.transitionFunction[state2][symbol];
        if (nextState1 !== undefined && nextState2 !== undefined) {
          transitionFunction[newState][symbol] = `${nextState1},${nextState2}`;
        }
      }
    }
  }

  return new DFA(
    states,
    dfa1.alphabet,
    transitionFunction,
    `${dfa1.startState},${dfa2.startState}`,
    acceptStates
  );
}

function difference(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      if (
        dfa1.acceptStates.includes(state1) &&
        !dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      transitionFunction[newState] = {};
      for (let symbol of dfa1.alphabet) {
        const nextState1 = dfa1.transitionFunction[state1][symbol];
        const nextState2 = dfa2.transitionFunction[state2][symbol];
        if (nextState1 !== undefined && nextState2 !== undefined) {
          transitionFunction[newState][symbol] = `${nextState1},${nextState2}`;
        }
      }
    }
  }

  return new DFA(
    states,
    dfa1.alphabet,
    transitionFunction,
    `${dfa1.startState},${dfa2.startState}`,
    acceptStates
  );
}

function concatenate(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      if (dfa1.acceptStates.includes(state1) && state2 === dfa2.startState) {
        acceptStates.push(newState);
      }

      transitionFunction[newState] = {};
      for (let symbol of dfa1.alphabet) {
        const nextState1 = dfa1.transitionFunction[state1][symbol];
        const nextState2 = dfa2.transitionFunction[state2][symbol];
        if (nextState1 !== undefined) {
          if (dfa1.acceptStates.includes(nextState1)) {
            transitionFunction[newState][symbol] = `${nextState1},${dfa2.startState}`;
          } else {
            transitionFunction[newState][symbol] = `${nextState1},${state2}`;
          }
        }
      }
    }
  }

  return new DFA(
    states,
    dfa1.alphabet,
    transitionFunction,
    `${dfa1.startState},${dfa2.startState}`,
    acceptStates
  );
}

function checkStrings(dfa1, dfa2, inputString) {
  console.log(`Входная строка: ${inputString}`);
  console.log(`1-ый автомат принимает: ${dfa1.accepts(inputString)}`);
  console.log(`2-ой автомат принимает: ${dfa2.accepts(inputString)}`);

  const intersectionDFA = intersection(dfa1, dfa2);
  console.log(`Пересечение принимает: ${intersectionDFA.accepts(inputString)}`);

  const unionDFA = union(dfa1, dfa2);
  console.log(`Объединение принимает: ${unionDFA.accepts(inputString)}`);

  const differenceDFA = difference(dfa1, dfa2);
  console.log(
    `Разность (первый - второй) принимает: ${differenceDFA.accepts(inputString)}`
  );

  const concatenationDFA = concatenate(dfa1, dfa2);
  console.log(`Конкатенация принимает: ${concatenationDFA.accepts(inputString)}`);
}

const dfa1 = new DFA(
  ['q1', 'p1', 'r1'],
  ['a', 'b'],
  {
    p1: { a: 'p1', b: 'q1' },
    q1: { a: 'p1', b: 'r1' },
    r1: { a: 'q1', b: 'r1' },
  },
  'q1',
  ['r1']
);

const dfa2 = new DFA(
  ['p2', 'q2', 'r2'],
  ['a', 'b'],
  {
    p2: { a: 'p2', b: 'q2' },
    q2: { a: 'q2', b: 'r2' },
    r2: { a: 'q2', b: 'r2' },
  },
  'p2',
  ['r2']
);

checkStrings(dfa1, dfa2, 'aaaabb');
checkStrings(dfa1, dfa2, 'baab');
checkStrings(dfa1, dfa2, 'babab');
