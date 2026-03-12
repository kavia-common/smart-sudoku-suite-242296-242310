import { generatePuzzle } from '../sudoku/generator';
import { solveSudoku } from '../sudoku/solver';
import { make9x9 } from '../sudoku/sudokuUtils';

// PUBLIC_INTERFACE
function createEmptyGame() {
    /** Create an empty playable grid (no givens). */
    const grid = make9x9(() => ({ value: null, given: false, notes: [] }));
    return {
        id: newGameId(),
        grid,
        givens: make9x9(() => null),
        solution: null,
        timerSeconds: 0,
        isComplete: false,
    };
}

// PUBLIC_INTERFACE
function createNewGame(difficulty) {
    /** Generate a new Sudoku game at a difficulty level. */
    const { puzzle, solution } = generatePuzzle(difficulty);
    const grid = puzzle.map((row) =>
        row.map((v) => ({
            value: v,
            given: v != null,
            notes: [],
        }))
    );

    return {
        id: newGameId(),
        grid,
        givens: puzzle,
        solution,
        timerSeconds: 0,
        isComplete: false,
    };
}

// PUBLIC_INTERFACE
function restartGame(game) {
    /** Restart to initial givens, clearing all user entries and notes. */
    const givens = game.givens || make9x9(() => null);
    const grid = givens.map((row) =>
        row.map((v) => ({
            value: v,
            given: v != null,
            notes: [],
        }))
    );
    return {
        ...game,
        id: newGameId(),
        grid,
        timerSeconds: 0,
        isComplete: false,
    };
}

// PUBLIC_INTERFACE
function isSolvedCorrectly(cellGrid) {
    /**
     * Determine if a cell grid is completely and correctly solved.
     * @param {{value:number|null}[][]} cellGrid
     */
    const numeric = cellGrid.map((row) => row.map((cell) => cell.value));
    const hasAnyEmpty = numeric.some((row) => row.some((v) => v == null));
    if (hasAnyEmpty) {
        return false;
    }
    // If complete, check validity by attempting a solve and verifying stable.
    const res = solveSudoku(numeric);
    if (!res.solved) {
        return false;
    }
    // Compare res.solution to current grid values.
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (res.solution[r][c] !== numeric[r][c]) {
                return false;
            }
        }
    }
    return true;
}

// PUBLIC_INTERFACE
function exportGameToText(game, difficulty) {
    /** Export game to a compact text format suitable for clipboard sharing. */
    const digits = game.grid.flatMap((row) => row.map((cell) => cell.value)).map((v) => (v == null ? '.' : String(v)));
    const givens = (game.givens || []).flat().map((v) => (v == null ? '.' : String(v)));
    const notes = game.grid.flatMap((row) => row.map((cell) => encodeNotes(cell.notes)));

    const payload = {
        v: 1,
        difficulty,
        digits: digits.join(''),
        givens: givens.join(''),
        notes: notes.join('|'),
        t: Number(game.timerSeconds || 0),
    };

    return `RSUDOKU|v1|difficulty=${payload.difficulty}|t=${payload.t}|givens=${payload.givens}|digits=${payload.digits}|notes=${payload.notes}`;
}

// PUBLIC_INTERFACE
function importGameFromText(text) {
    /** Import game from exportGameToText format. Throws on invalid input. */
    if (!text || typeof text !== 'string') {
        throw new Error('Empty import.');
    }
    if (!text.startsWith('RSUDOKU|v1|')) {
        throw new Error('Unrecognized format.');
    }

    const parts = text.split('|').slice(2); // after RSUDOKU|v1
    const map = {};
    for (const p of parts) {
        const idx = p.indexOf('=');
        if (idx === -1) {
            continue;
        }
        map[p.slice(0, idx)] = p.slice(idx + 1);
    }

    const difficulty = map.difficulty;
    const t = Number(map.t || 0);
    const givensStr = map.givens || '';
    const digitsStr = map.digits || '';
    const notesStr = map.notes || '';

    if (givensStr.length !== 81 || digitsStr.length !== 81) {
        throw new Error('Bad grid length.');
    }

    const givens = decodeGrid(givensStr);
    const digits = decodeGrid(digitsStr);
    const notes = notesStr ? notesStr.split('|') : [];
    if (notes.length && notes.length !== 81) {
        throw new Error('Bad notes length.');
    }

    const grid = [];
    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            const i = r * 9 + c;
            const givenV = givens[r][c];
            const valueV = digits[r][c];
            row.push({
                value: valueV,
                given: givenV != null,
                notes: notes.length ? decodeNotes(notes[i]) : [],
            });
        }
        grid.push(row);
    }

    // Attempt to compute solution from givens/digits (use digits if more filled).
    const base = digits.map((row) => row.slice());
    const res = solveSudoku(base);
    const solution = res.solved ? res.solution : null;

    return {
        difficulty,
        game: {
            id: newGameId(),
            grid,
            givens,
            solution,
            timerSeconds: t,
            isComplete: false,
        },
    };
}

function decodeGrid(str) {
    const out = make9x9(() => null);
    for (let i = 0; i < 81; i++) {
        const ch = str[i];
        const r = Math.floor(i / 9);
        const c = i % 9;
        out[r][c] = ch === '.' ? null : Number(ch);
    }
    return out;
}

function encodeNotes(notes) {
    if (!notes || !notes.length) {
        return '';
    }
    return notes.join('');
}

function decodeNotes(s) {
    if (!s) {
        return [];
    }
    return s
        .split('')
        .map((ch) => Number(ch))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9)
        .sort();
}

function newGameId() {
    try {
        if (window && window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        throw new Error('randomUUID not available');
    } catch (e) {
        return String(Date.now()) + String(Math.random());
    }
}

export {
    createEmptyGame,
    createNewGame,
    exportGameToText,
    importGameFromText,
    isSolvedCorrectly,
    restartGame,
};
