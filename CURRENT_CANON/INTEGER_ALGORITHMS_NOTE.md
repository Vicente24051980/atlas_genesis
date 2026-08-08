# Integer Algorithms — Research Note

Status: Research / non-Core

The term integer algorithms covers computational procedures operating over integers and discrete domains.

## 1. Integer programming and discrete optimization

- Branch and Bound: recursively partitions the search space using continuous relaxations and integer bounds.
- Cutting Planes / Gomory: adds linear cuts that remove fractional solutions while retaining feasible integer points.
- Branch and Cut: combines branching and cutting planes and is a standard approach in mathematical optimization solvers.

### Potential ATLAS Ω relevance

Integer or mixed-integer optimization may later be evaluated for capital-allocation decisions subject to explicit constraints (position counts, weights, sector/risk/liquidity limits, etc.). If adopted, it belongs above the frozen CORE-00 as an optimization/allocation capability consuming validated ATLAS outputs. It MUST NOT become a sixth CORE-00 engine during functional freeze.

## 2. Computer graphics / rasterization

- Bresenham line algorithm: integer decision parameter to choose discrete pixels approximating an ideal line.
- Midpoint circle algorithm: finite differences and circle symmetry for integer rasterization.

No canonical ATLAS integration is currently established for this category.

## 3. Number theory and cryptography

- Euclidean algorithm for GCD.
- Binary/fast modular exponentiation in logarithmic exponent steps.
- Karatsuba divide-and-conquer integer multiplication.

These are retained as technical research context. Their presence here does not modify the frozen cryptographic contracts already defined by CORE-00 or TASK-PEA-001.

## Integration boundary

This document records potentially useful techniques; it does not itself promote them into canonical engines, laws, or investment rules.