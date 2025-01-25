class DFA {
  constructor(states, alphabet, transitionFunction, startState, acceptStates) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitionFunction = transitionFunction;
    this.startState = startState;
    this.acceptStates = acceptStates;
  }

  // Функция для проверки строки
  accepts(inputString) {
    let currentState = this.startState;
    for (let symbol of inputString) {
      if (!this.alphabet.includes(symbol)) {
        return false; // Невалидный символ
      }
      const nextState = this.transitionFunction[currentState][symbol];
      if (nextState === undefined) {
        return false; // Переход не определен
      }
      currentState = nextState;
    }
    return this.acceptStates.includes(currentState);
  }
}

// Функция для построения пересечения двух автоматов
function intersection(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  // Создаем все состояния как пары состояний из обоих автоматов
  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      // Если оба состояния принимающие, то новое состояние тоже принимающее
      if (
        dfa1.acceptStates.includes(state1) &&
        dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      // Создаем функцию переходов для нового состояния
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

// Функция для построения объединения двух автоматов
function union(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  // Создаем все состояния как пары состояний из обоих автоматов
  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      // Если хотя бы одно из состояний принимающее, то новое состояние тоже принимающее
      if (
        dfa1.acceptStates.includes(state1) ||
        dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      // Создаем функцию переходов для нового состояния
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

// Функция для построения разности двух автоматов (исключение)
function difference(dfa1, dfa2) {
  const states = [];
  const acceptStates = [];
  const transitionFunction = {};

  // Создаем все состояния как пары состояний из обоих автоматов
  for (let state1 of dfa1.states) {
    for (let state2 of dfa2.states) {
      const newState = `${state1},${state2}`;
      states.push(newState);

      // Если первое состояние принимающее, а второе нет, то новое состояние принимающее
      if (
        dfa1.acceptStates.includes(state1) &&
        !dfa2.acceptStates.includes(state2)
      ) {
        acceptStates.push(newState);
      }

      // Создаем функцию переходов для нового состояния
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

// Функция для проверки строки всеми автоматами и их комбинациями
function checkStrings(dfa1, dfa2, inputString) {
  console.log(`Input string: ${inputString}`);
  console.log(`DFA1 accepts: ${dfa1.accepts(inputString)}`);
  console.log(`DFA2 accepts: ${dfa2.accepts(inputString)}`);

  const intersectionDFA = intersection(dfa1, dfa2);
  console.log(`Intersection accepts: ${intersectionDFA.accepts(inputString)}`);

  const unionDFA = union(dfa1, dfa2);
  console.log(`Union accepts: ${unionDFA.accepts(inputString)}`);

  const differenceDFA = difference(dfa1, dfa2);
  console.log(
    `Difference (DFA1 - DFA2) accepts: ${differenceDFA.accepts(inputString)}`
  );
}

// Пример использования
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

checkStrings(dfa1, dfa2, 'b');
