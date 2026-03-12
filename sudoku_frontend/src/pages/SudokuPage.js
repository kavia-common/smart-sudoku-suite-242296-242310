import React, { useEffect, useMemo, useState } from 'react';

import { ControlPanel } from '../components/sudoku/ControlPanel';
import { SudokuGrid } from '../components/sudoku/SudokuGrid';
import { ToastRegion } from '../components/ui/ToastRegion';
import {
    createEmptyGame,
    createNewGame,
    exportGameToText,
    importGameFromText,
    isSolvedCorrectly,
    restartGame,
} from '../domain/game/game';
import { DIFFICULTIES } from '../domain/sudoku/difficulty';
import { computeConflicts } from '../domain/sudoku/validator';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useTimer } from '../hooks/useTimer';
import { loadSavedGame, saveGame } from '../state/persistence';

// PUBLIC_INTERFACE
function SudokuPage() {
    /** Main Sudoku page: game lifecycle, persistence, undo/redo, timer, and interactions. */

    const saved = useMemo(() => loadSavedGame(), []);
    const [difficulty, setDifficulty] = useState(saved?.difficulty || 'easy');

    const initialGame = useMemo(() => {
        if (saved?.game) {
            return saved.game;
        }
        return createEmptyGame();
    }, [saved]);

    const undoRedo = useUndoRedo(initialGame);
    const game = undoRedo.present;

    const [notesMode, setNotesMode] = useState(false);
    const [selected, setSelected] = useState({ r: 0, c: 0 });
    const [toasts, setToasts] = useState([]);

    const timer = useTimer(game.timerSeconds, !game.isComplete);

    const conflicts = useMemo(() => computeConflicts(game.grid), [game.grid]);

    useEffect(() => {
        // Persist the game frequently, but keep it cheap (localStorage).
        saveGame({ game: { ...game, timerSeconds: timer.seconds }, difficulty });
    }, [game, difficulty, timer.seconds]);

    useEffect(() => {
        // Keep timer state in sync when undo/redo changes timerSeconds baseline.
        timer.setSeconds(game.timerSeconds || 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [undoRedo.presentId]);

    function pushToast(kind, message) {
        setToasts((prev) => [...prev, { id: cryptoRandomId(), kind, message }]);
    }

    function removeToast(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    // PUBLIC_INTERFACE
    function handleNewGame() {
        /** Create a new puzzle at the selected difficulty. */
        const next = createNewGame(difficulty);
        undoRedo.reset(next);
        timer.setSeconds(0);
        setSelected({ r: 0, c: 0 });
        pushToast('good', `New ${difficulty} puzzle generated.`);
    }

    // PUBLIC_INTERFACE
    function handleRestart() {
        /** Restart the current puzzle back to its initial givens. */
        const next = restartGame(game);
        undoRedo.reset(next);
        timer.setSeconds(0);
        pushToast('good', 'Puzzle restarted.');
    }

    // PUBLIC_INTERFACE
    function handleSetDifficulty(nextDifficulty) {
        /** Update difficulty selection. Does not auto-regenerate. */
        setDifficulty(nextDifficulty);
    }

    // PUBLIC_INTERFACE
    function handleMoveSelection(nextSel) {
        /** Move current cell selection. */
        setSelected(nextSel);
    }

    // PUBLIC_INTERFACE
    function handleToggleNotesMode() {
        /** Toggle pencil marks (notes) mode. */
        setNotesMode((prev) => !prev);
    }

    // PUBLIC_INTERFACE
    function handleInputNumber(n) {
        /** Input a digit (1-9) into selected cell or toggle a note when notes mode is active. */
        const { r, c } = selected;
        const cell = game.grid[r][c];
        if (!cell) {
            return;
        }
        if (cell.given) {
            pushToast('bad', 'That cell is a given.');
            return;
        }

        if (notesMode) {
            const has = cell.notes.includes(n);
            const nextNotes = has ? cell.notes.filter((x) => x !== n) : [...cell.notes, n].sort();
            undoRedo.set({
                ...game,
                grid: updateCell(game.grid, r, c, { ...cell, notes: nextNotes }),
                isComplete: false,
            });
            return;
        }

        const nextCell = { ...cell, value: n, notes: [] };
        const nextGrid = updateCell(game.grid, r, c, nextCell);
        const done = isSolvedCorrectly(nextGrid);
        const nextGame = {
            ...game,
            grid: nextGrid,
            isComplete: done,
            timerSeconds: timer.seconds,
        };
        undoRedo.set(nextGame);

        if (done) {
            pushToast('good', 'Solved! You completed the puzzle.');
        }
    }

    // PUBLIC_INTERFACE
    function handleClear() {
        /** Clear selected cell (and notes) if editable. */
        const { r, c } = selected;
        const cell = game.grid[r][c];
        if (cell.given) {
            return;
        }
        const nextCell = { ...cell, value: null, notes: [] };
        undoRedo.set({
            ...game,
            grid: updateCell(game.grid, r, c, nextCell),
            isComplete: false,
        });
    }

    // PUBLIC_INTERFACE
    function handleHint() {
        /** Fill the selected cell with its solution value (if available). */
        const { r, c } = selected;
        const cell = game.grid[r][c];
        if (cell.given) {
            pushToast('bad', 'Hint not needed for givens.');
            return;
        }
        if (!game.solution || !game.solution[r] || game.solution[r][c] == null) {
            pushToast('bad', 'No solution available for this puzzle.');
            return;
        }
        const v = game.solution[r][c];
        undoRedo.set({
            ...game,
            grid: updateCell(game.grid, r, c, { ...cell, value: v, notes: [] }),
            isComplete: isSolvedCorrectly(updateCell(game.grid, r, c, { ...cell, value: v, notes: [] })),
        });
        pushToast('good', 'Hint applied.');
    }

    // PUBLIC_INTERFACE
    function handleExport() {
        /** Export current game state to text for sharing. */
        const text = exportGameToText({ ...game, timerSeconds: timer.seconds }, difficulty);
        copyToClipboard(text)
            .then(() => pushToast('good', 'Export copied to clipboard.'))
            .catch(() => pushToast('bad', 'Copy failed. You can manually select and copy from the text field.'));
        return text;
    }

    // PUBLIC_INTERFACE
    function handleImport(text) {
        /** Import game state from exported text. */
        try {
            const imported = importGameFromText(text);
            if (!DIFFICULTIES.includes(imported.difficulty)) {
                throw new Error('Unsupported difficulty.');
            }
            setDifficulty(imported.difficulty);
            undoRedo.reset(imported.game);
            timer.setSeconds(imported.game.timerSeconds || 0);
            setSelected({ r: 0, c: 0 });
            pushToast('good', 'Game imported.');
        } catch (e) {
            pushToast('bad', `Import failed: ${e.message}`);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 className="cardTitle">Sudoku Console</h1>
                <p className="cardSub">
                    Keyboard: arrows move • numbers set • <span className="kbd">N</span> notes •{' '}
                    <span className="kbd">Backspace</span> clear • <span className="kbd">U</span> undo •{' '}
                    <span className="kbd">R</span> redo
                </p>
            </div>

            <div className="cardBody">
                <div className="gridLayout">
                    <div className="sudokuWrap">
                        <SudokuGrid
                            game={game}
                            selected={selected}
                            notesMode={notesMode}
                            conflicts={conflicts}
                            onSelect={handleMoveSelection}
                            onInputNumber={handleInputNumber}
                            onClear={handleClear}
                            onToggleNotesMode={handleToggleNotesMode}
                            onUndo={undoRedo.undo}
                            onRedo={undoRedo.redo}
                        />

                        <div className="statusRow" aria-label="Game status">
                            <div className="pill">Difficulty: {difficulty}</div>
                            <div className="pill">Notes: {notesMode ? 'ON' : 'OFF'}</div>
                            <div className="pill">Time: {formatSeconds(timer.seconds)}</div>
                            <div className="pill">Undo: {undoRedo.canUndo ? 'yes' : 'no'}</div>
                            <div className="pill">Redo: {undoRedo.canRedo ? 'yes' : 'no'}</div>
                        </div>
                    </div>

                    <ControlPanel
                        difficulty={difficulty}
                        onChangeDifficulty={handleSetDifficulty}
                        onNewGame={handleNewGame}
                        onRestart={handleRestart}
                        onHint={handleHint}
                        onToggleNotesMode={handleToggleNotesMode}
                        notesMode={notesMode}
                        canUndo={undoRedo.canUndo}
                        canRedo={undoRedo.canRedo}
                        onUndo={undoRedo.undo}
                        onRedo={undoRedo.redo}
                        onExport={handleExport}
                        onImport={handleImport}
                        onClear={handleClear}
                        isComplete={game.isComplete}
                    />
                </div>
            </div>

            <ToastRegion toasts={toasts} onDismiss={removeToast} />
        </div>
    );
}

function cryptoRandomId() {
    try {
        return window.crypto.randomUUID();
    } catch (e) {
        return String(Date.now()) + String(Math.random());
    }
}

function formatSeconds(sec) {
    const s = Math.max(0, sec || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
}

function updateCell(grid, r, c, nextCell) {
    return grid.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? nextCell : cell)));
}

function copyToClipboard(text) {
    if (navigator?.clipboard?.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('Clipboard API not available'));
}

export { SudokuPage };
