/** Difficulty levels supported by the generator. */
const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

const DIFFICULTY_CONFIG = {
    easy: { givens: 40 },
    medium: { givens: 34 },
    hard: { givens: 28 },
    expert: { givens: 24 },
};

// PUBLIC_INTERFACE
function difficultyLabel(d) {
    /** Human-friendly label for a difficulty identifier. */
    return d.charAt(0).toUpperCase() + d.slice(1);
}

export { DIFFICULTIES, DIFFICULTY_CONFIG, difficultyLabel };
