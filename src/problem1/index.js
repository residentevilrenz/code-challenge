function sumToNUsingFormula(n) {
    return (n * (n + 1)) / 2;
}

function sumToNUsingLoop(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;   
    }
    return sum;
}

function sumToNUsingArrayReduce(n) {
    return Array.from({length: n}, (_, i) => i + 1)
        .reduce((acc, val) => acc + val, 0);
}
