import { make9x9 } from './sudokuUtils';

// PUBLIC_INTERFACE
function isGridValid(grid) {
    /**
     * Returns true if no row/col/box contains a duplicate non-null digit.
     * Does not require completeness.
     */
    // rows
    for (let r = 0; r < 9; r++) {
        if (hasDuplicates(grid[r])) {
            return false;
        }
    }

    // cols
    for (let c = 0; c < 9; c++) {
        const col = [];
        for (let r = 0; r < 9; r++) {
            col.push(grid[r][c]);
        }
        if (hasDuplicates(col)) {
            return false;
        }
    }

    // boxes
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const box = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    box.push(grid[r][c]);
                }
            }
            if (hasDuplicates(box)) {
                return false;
            }
        }
    }

    return true;
}

// PUBLIC_INTERFACE
function computeConflicts(cellGrid) {
    /**
     * Computes a 9x9 boolean matrix where true means the cell conflicts with another
     * cell in its row/column/box (only for filled values).
     * @param {{value:number|null}[][]} cellGrid
     * @return {boolean[][]}
     */
    const values = cellGrid.map((row) => row.map((cell) => cell.value));
    const conflicts = make9x9(() => false);

    // Row conflicts
    for (let r = 0; r < 9; r++) {
        markDuplicates(values[r], (c) => {
            conflicts[r][c] = true;
        });
    }

    // Col conflicts
    for (let c = 0; c < 9; c++) {
        const col = [];
        for (let r = 0; r < 9; r++) {
            col.push(values[r][c]);
        }
        markDuplicates(col, (r) => {
            conflicts[r][c] = true;
        });
    }

    // Box conflicts
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const coords = [];
            const box = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    coords.push([r, c]);
                    box.push(values[r][c]);
                }
            }
            const dup = duplicateIndices(box);
            for (const i of dup) {
                const [r, c] = coords[i];
                conflicts[r][c] = true;
            }
        }
    }

    return conflicts;
}

function hasDuplicates(arr) {
    const seen = new Set();
    for (const v of arr) {
        if (v == null) {
            continue;
        }
        if (seen.has(v)) {
            return true;
        }
        seen.add(v);
    }
    return false;
}

function duplicateIndices(arr) {
    const seen = new Map();
    const dups = new Set();
    arr.forEach((v, i) => {
        if (v == null) {
            return;
        }
        if (seen.has(v)) {
            dups.add(i);
            dups.add(seen.get(v));
        } else {
            seen.set(v, i);
        }
    });
    return Array.from(dups);
}

function markDuplicates(arr, markIndexFn) {
    const dup = duplicateIndices(arr);
    for (const idx of dup) {
        markIndexFn(idx);
    }
}

export { computeConflicts, isGridValid };
