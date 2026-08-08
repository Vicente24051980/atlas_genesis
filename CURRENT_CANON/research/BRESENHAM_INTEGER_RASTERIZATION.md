# Bresenham Integer Rasterization

Status: Research / non-Core
Source: user-provided technical note

## Purpose

The Bresenham line algorithm determines which pixels in a discrete screen grid should be colored to optimally approximate a continuous straight line between `(x0, y0)` and `(x1, y1)`.

Its key mathematical advantage is the exclusive use of integer arithmetic: additions, subtractions and multiplication by 2, avoiding divisions and floating-point operations.

## 1. Mathematical foundation

For a continuous line

`y = m*x + b`

with

`m = Δy / Δx`,

and initially assuming the first octant (`0 <= m <= 1`, `x0 < x1`), moving one horizontal step from `(x_k, y_k)` to `x_{k+1} = x_k + 1` gives the ideal continuous value:

`y = m(x_k + 1) + b`

Two candidate pixels exist:

- lower pixel: `(x_k + 1, y_k)`
- upper pixel: `(x_k + 1, y_k + 1)`

### Vertical distances

`d1 = y - y_k = m(x_k + 1) + b - y_k`

`d2 = (y_k + 1) - y = y_k + 1 - m(x_k + 1) - b`

Subtracting:

`d1 - d2 = 2m(x_k + 1) - 2y_k + 2b - 1`

Substituting `m = Δy / Δx`:

`d1 - d2 = 2(Δy/Δx)(x_k + 1) - 2y_k + 2b - 1`

## Integer decision parameter P_k

Multiplying by `Δx` eliminates division and defines the integer decision parameter:

`P_k = Δx(d1 - d2) = 2Δy*x_k - 2Δx*y_k + C`

where

`C = 2Δy + Δx(2b - 1)`.

Decision rule:

- If `P_k < 0`, choose the lower pixel and keep `y_{k+1} = y_k`.
- If `P_k >= 0`, choose the upper pixel and set `y_{k+1} = y_k + 1`.

### Recurrence

`P_{k+1} = P_k + 2Δy - 2Δx(y_{k+1} - y_k)`

Therefore:

- if `P_k < 0`: `P_{k+1} = P_k + 2Δy`
- if `P_k >= 0`: `P_{k+1} = P_k + 2Δy - 2Δx`

Initial value:

`P_0 = 2Δy - Δx`

## 2. Python implementation — all octants

```python
def bresenham_line(x0: int, y0: int, x1: int, y1: int) -> list[tuple[int, int]]:
    """
    Generates the list of integer pixel coordinates composing the line
    using the generalized Bresenham algorithm for all octants.
    """
    pixels = []

    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1

    x, y = x0, y0

    if dy > dx:
        err = 2 * dx - dy
        while True:
            pixels.append((x, y))
            if y == y1:
                break
            if err >= 0:
                x += sx
                err -= 2 * dy
            y += sy
            err += 2 * dx
    else:
        err = 2 * dy - dx
        while True:
            pixels.append((x, y))
            if x == x1:
                break
            if err >= 0:
                y += sy
                err -= 2 * dx
            x += sx
            err += 2 * dy

    return pixels

# Example
points = bresenham_line(2, 3, 12, 8)
print("Pixels to illuminate:", points)
```

## 3. Interactive rasterization simulator

A future simulator may expose the start/end points and show, step by step, the decision parameter `P_k` and the selected pixel on a grid.

## ATLAS integration boundary

This is retained as technical research about exact integer-state transitions and discrete approximation. It does not modify CORE-00, UO 1.1 RC1, the five frozen engines, or any canonical investment rule.

Potential future relevance, if explicitly adopted, would be in deterministic visualization, grid traversal, discrete geometry or integer-only simulation tooling above the frozen Core.