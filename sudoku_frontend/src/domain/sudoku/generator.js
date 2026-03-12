import { DIFFICULTY_CONFIG } from './difficulty';
import { solveSudoku } from './solver';
import { deepCopy2D, make9x9 } from './sudokuUtils';
import { isGridValid } from './validator';

// PUBLIC_INTERFACE
function generatePuzzle(difficulty) {
    /**
     * Generate a Sudoku puzzle and its solution.
     * @param {'easy'|'medium'|'hard'|'expert'} difficulty
     * @return {{puzzle:(number|null)[][], solution:(number|null)[][]}}
     */
    const solved = generateSolvedGrid();
    const puzzle = carvePuzzle(solved, difficulty);

    // Ensure still solvable (defensive; carve uses validation).
    const res = solveSudoku(puzzle);
    if (!res.solved) {
        // Rare fallback: regenerate.
        return generatePuzzle(difficulty);
    }
    return { puzzle, solution: solved };
}

function generateSolvedGrid() {
    // Randomized backtracking fill.
    const grid = make9x9(() => null);
    fill(grid);
    return grid;
}

function fill(grid) {
    const next = findEmpty(grid);
    if (!next) {
        return true;
    }
    const { r, c } = next;
    const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const n of nums) {
        grid[r][c] = n;
        if (isGridValid(grid) && fill(grid)) {
            return true;
        }
        grid[r][c] = null;
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

function carvePuzzle(solution, difficulty) {
    const givensTarget = DIFFICULTY_CONFIG[difficulty]?.givens ?? 34;

    const puzzle = deepCopy2D(solution);
    const indices = shuffled(Array.from({ length: 81 }, (_, i) => i));

    let remaining = 81;
    for (const idx of indices) {
        if (remaining <= givensTarget) {
            break;
        }
        const r = Math.floor(idx / 9);
        const c = idx % 9;

        const old = puzzle[r][c];
        puzzle[r][c] = null;

        // Keep solvable with our solver (not enforcing uniqueness to stay lightweight).
        const attempt = solveSudoku(puzzle);
        if (!attempt.solved) {
            puzzle[r][c] = old;
        } else {
            remaining--;
        }
    }
    return puzzle;
}

function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a;
}

export { generatePuzzle };
