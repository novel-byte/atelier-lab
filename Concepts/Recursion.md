---
type: concept
tags: [programming/concept, #demo]
aliases: []
related: []
domain: computer science
status: learning
difficulty: 3
confidence: 3
last_reviewed: 2026-08-01
---

# Recursion

## In one sentence
A function that solves a problem by calling itself on a smaller version of it.

## Smallest example
```js
const fact = n => n <= 1 ? 1 : n * fact(n - 1);
```

## Common mistakes
- Missing base case → stack overflow
- Recomputing subproblems (see: dynamic programming)

## Test myself
1. Trace fact(4) by hand.
