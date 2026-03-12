const STORAGE_KEY = 'retroSudoku.savedGame.v1';
const THEME_KEY = 'retroSudoku.theme.v1';

// PUBLIC_INTERFACE
function saveGame(payload) {
    /** Save current game payload to localStorage. */
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        // Ignore quota/private browsing issues.
    }
}

// PUBLIC_INTERFACE
function loadSavedGame() {
    /** Load saved game payload from localStorage; returns null if missing/corrupt. */
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

// PUBLIC_INTERFACE
function clearSavedGame() {
    /** Clear saved game payload from localStorage. */
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // ignore
    }
}

// PUBLIC_INTERFACE
function getStoredTheme() {
    /** Read theme from localStorage. */
    try {
        return localStorage.getItem(THEME_KEY);
    } catch (e) {
        return null;
    }
}

// PUBLIC_INTERFACE
function setStoredTheme(theme) {
    /** Persist theme to localStorage. */
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        // ignore
    }
}

export { clearSavedGame, getStoredTheme, loadSavedGame, saveGame, setStoredTheme };
