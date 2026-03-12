import { solveSudoku } from '../solver';

test('solver solves a known valid puzzle', () => {
    // A standard Sudoku puzzle (null means empty).
    const puzzle = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9],
    ];

    const res = solveSudoku(puzzle);
    expect(res.solved).toBe(true);

    // Ensure all cells filled.
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            expect(res.solution[r][c]).not.toBeNull();
        }
    }
});

test('solver rejects an invalid puzzle with conflicts', () => {
    const invalid = [
        [5, 5, null, null, 7, null, null, null, null], // duplicate 5 in row
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9],
    ];
    const res = solveSudoku(invalid);
    expect(res.solved).toBe(false);
});
