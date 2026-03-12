import { generatePuzzle } from '../generator';
import { solveSudoku } from '../solver';

function countGivens(puzzle) {
    return puzzle.flat().filter((v) => v != null).length;
}

test('generator creates solvable puzzle and solution', () => {
    const { puzzle, solution } = generatePuzzle('easy');

    expect(puzzle).toHaveLength(9);
    expect(solution).toHaveLength(9);

    // Solution should be fully filled.
    expect(solution.flat().every((v) => v != null)).toBe(true);

    // Puzzle should be solvable.
    const res = solveSudoku(puzzle);
    expect(res.solved).toBe(true);
});

test('difficulty affects number of givens (easy >= hard)', () => {
    const easy = generatePuzzle('easy').puzzle;
    const hard = generatePuzzle('hard').puzzle;

    const easyG = countGivens(easy);
    const hardG = countGivens(hard);

    expect(easyG).toBeGreaterThanOrEqual(hardG);
});
