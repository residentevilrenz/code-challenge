// Complexity: O(1)

function sumToNUsingFormula(n: number): number {
  return (n * (n + 1)) / 2;
}

// Complexity: O(n)
function sumToNUsingLoop(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      sum += i;
    }
    return sum;
}

// Complexity: O(n)
function sumToNUsingArrayReduce(n: number): number {
    return Array.from({length: n}, (_, i) => i + 1)
        .reduce((acc, val) => acc + val, 0 );
}