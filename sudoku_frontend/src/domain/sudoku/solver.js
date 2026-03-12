import { deepCopy2D } from './sudokuUtils';
import { isGridValid } from './validator';

// PUBLIC_INTERFACE
function solveSudoku(grid) {
    /**
     * Solve a Sudoku puzzle using backtracking.
     * @param {(number|null)[][]} grid 9x9 grid with null for empty.
     * @return {{solved: boolean, solution: (number|null)[][]}} result
     */
    const working = deepCopy2D(grid);

    // Quick reject: invalid starting grid.
    if (!isGridValid(working)) {
        return { solved: false, solution: deepCopy2D(grid) };
    }

    const solved = backtrack(working);
    return { solved, solution: working };
}

function backtrack(grid) {
    const next = findEmpty(grid);
    if (!next) {
        return true;
    }
    const { r, c } = next;

    for (let n = 1; n <= 9; n++) {
        if (isAllowed(grid, r, c, n)) {
            grid[r][c] = n;
            if (backtrack(grid)) {
                return true;
            }
            grid[r][c] = null;
        }
    }
    return false;
}

function findEmpty(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] == null) {
                return { r, c };
            }
        }
    }
    return null;
}

function isAllowed(grid, r, c, n) {
    for (let i = 0; i < 9; i++) {
        if (grid[r][i] === n) {
            return false;
        }
        if (grid[i][c] === n) {
            return false;
        }
    }

    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            if (grid[rr][cc] === n) {
                return false;
            }
        }
    }
    return true;
}

export { solveSudoku };
