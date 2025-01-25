function canTransform(start, target) {
    const MAX_ITERATIONS = 10000;
    let iterations = 0
    const rules = {
        '0': '1',
        '1': '2',
        '2': '01',
        '02': '1'
    };

    const queue = [start];
    const visited = new Set();

    while (queue.length > 0) {
        if (iterations++ > MAX_ITERATIONS) {
            return false
        }

        const current = queue.shift();
        if (current === target) {
            return true;
        }
        if (visited.has(current)) {
            continue;
        }
        visited.add(current);

        for (const [key, value] of Object.entries(rules)) {
            let index = current.indexOf(key);
            while (index !== -1) {
                const next = current.slice(0, index) + value + current.slice(index + key.length);
                if (!visited.has(next)) {
                    queue.push(next);
                }
                index = current.indexOf(key, index + 1);
            }
        }
    }

    return false;
}

// Example usage:
const start = '0111111111222222222222211111111111100022122';
const target = '21111';
console.log(canTransform(start, target)); // Output: true or false based on the transformation rules
