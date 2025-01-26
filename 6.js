function infixToRPN(expression) {
    const precedence = {
        'add': 1,
        'sub': 1,
        'mul': 2,
        'div': 2,
        'mod': 2
    };

    const isOperator = (token) => ['add', 'sub', 'mul', 'div', 'mod'].includes(token);
    const output = [];
    const operators = [];

    const tokens = expression.match(/\d+|add|sub|mul|div|mod|\(|\)/g);

    for (const token of tokens) {
        if (!isNaN(token)) {
            output.push(token);
        } else if (isOperator(token)) {
            while (operators.length && isOperator(operators[operators.length - 1]) &&
                precedence[operators[operators.length - 1]] >= precedence[token]) {
                output.push(operators.pop());
            }
            operators.push(token);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            }
            operators.pop();
        }
    }

    while (operators.length) {
        output.push(operators.pop());
    }

    return output;
}

function evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(Number(token));
        } else {
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
                case 'add':
                    stack.push(a + b);
                    break;
                case 'sub':
                    stack.push(a - b);
                    break;
                case 'mul':
                    stack.push(a * b);
                    break;
                case 'div':
                    stack.push(Math.floor(a / b));
                    break;
                case 'mod':
                    stack.push(a % b);
                    break;
            }
        }
    }

    return stack[0];
}

// Example usage:
const expression = "3 add 5 mul ( 2 sub 8 ) div 2";
const rpn = infixToRPN(expression);
console.log("RPN:", rpn.join(' '));
const result = evaluateRPN(rpn);
console.log("Result:", result);
