// PUBLIC_INTERFACE
function isValidDigit(n) {
    /** Returns true if n is an integer between 1 and 9. */
    return Number.isInteger(n) && n >= 1 && n <= 9;
}

// PUBLIC_INTERFACE
function make9x9(valueFactory) {
    /** Create a 9x9 2D array using a factory callback (r,c) => value. */
    const out = [];
    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            row.push(valueFactory(r, c));
        }
        out.push(row);
    }
    return out;
}

// PUBLIC_INTERFACE
function deepCopy2D(grid) {
    /** Deep copy for 9x9 numeric grids (null|number). */
    return grid.map((row) => row.slice());
}

export { deepCopy2D, isValidDigit, make9x9 };
