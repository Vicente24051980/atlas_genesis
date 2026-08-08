# Bresenham Simulator — UI/Behavior Reference

Status: Research / non-Core

This document captures the interactive rasterization simulator behavior shown in the supplied mobile reference.

## Visible structure

- Title: `Bresenham's Line Algorithm`.
- Dark mobile UI.
- Reset control in the header.
- Cartesian/grid viewport with integer coordinates.
- Continuous ideal line rendered across the grid.
- Selected raster pixels highlighted on the integer lattice.
- Start and end points visually emphasized.
- Step table below the visualization.

## Step table contract

Columns:

- `Step k`
- `(X, Y)`
- `P_k`
- `Choice`

Representative choices visible in the reference:

- `Straight (X)` when the next step advances only on the dominant X axis.
- `Diagonal` when both X and Y advance.

The table is intended to expose the decision parameter at each iteration instead of showing only the final rasterized line.

## Example visible sequence

The supplied reference begins from approximately `(2, 2)` and progresses toward a point near `(14, 8)`.

Visible rows include:

- k=0, `(2,2)`, `P_k=6`, `Straight (X)`
- k=1, `(3,2)`, `P_k=0`, `Diagonal`
- k=2, `(4,3)`, `P_k=6`, `Straight (X)`

This is a UI reference, not a canonical ATLAS Ω engine contract.

## Intended simulator behavior

1. User selects or adjusts start/end integer coordinates.
2. Simulator computes the Bresenham sequence using integer arithmetic only.
3. Each chosen pixel is highlighted on the grid.
4. Ideal continuous line remains visible for comparison.
5. For each iteration, the simulator records `(x,y)`, decision parameter `P_k`, and branch choice.
6. Reset restores the initial state.

## Atlas integration boundary

This artifact remains under research/education tooling. It MUST NOT alter CORE-00, UO 1.1 RC1, the five-engine pipeline, or the frozen 30-case corpus.