import React, { useMemo, useState } from 'react';

import { DIFFICULTIES, difficultyLabel } from '../../domain/sudoku/difficulty';

// PUBLIC_INTERFACE
function ControlPanel({
    difficulty,
    onChangeDifficulty,
    onNewGame,
    onRestart,
    onHint,
    onToggleNotesMode,
    notesMode,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onExport,
    onImport,
    onClear,
    isComplete,
}) {
    /** Side panel controls and import/export. */

    const [importText, setImportText] = useState('');
    const [exportText, setExportText] = useState('');

    const difficultyOptions = useMemo(
        () =>
            DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                    {difficultyLabel(d)}
                </option>
            )),
        []
    );

    return (
        <aside className="card" style={{ padding: '14px' }} aria-label="Controls panel">
            <div>
                <label className="label" htmlFor="difficulty">
                    Difficulty
                </label>
                <select
                    id="difficulty"
                    className="select"
                    value={difficulty}
                    onChange={(e) => onChangeDifficulty(e.target.value)}
                >
                    {difficultyOptions}
                </select>
                <div className="helperText" style={{ marginTop: '8px' }}>
                    Tip: choose a difficulty then press <strong>New Game</strong>.
                </div>
            </div>

            <hr className="hr" />

            <div className="btnGroup">
                <button className="btn btnPrimary" type="button" onClick={onNewGame} aria-label="Generate new game">
                    New Game
                </button>
                <button className="btn" type="button" onClick={onHint} aria-label="Hint">
                    Hint
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={onToggleNotesMode}
                    aria-pressed={notesMode}
                    aria-label="Toggle notes mode"
                >
                    Notes: {notesMode ? 'ON' : 'OFF'}
                </button>
                <button className="btn" type="button" onClick={onClear} aria-label="Clear cell">
                    Clear
                </button>
            </div>

            <hr className="hr" />

            <div className="btnGroup">
                <button className="btn" type="button" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                    Undo
                </button>
                <button className="btn" type="button" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                    Redo
                </button>
                <button className="btn btnDanger" type="button" onClick={onRestart} aria-label="Restart puzzle">
                    Restart
                </button>
            </div>

            <div className="helperText" style={{ marginTop: '10px' }}>
                {isComplete ? (
                    <span>
                        Status: <strong style={{ color: 'var(--good)' }}>Complete</strong>
                    </span>
                ) : (
                    <span>
                        Status: <strong>In progress</strong>
                    </span>
                )}
            </div>

            <hr className="hr" />

            <div>
                <div className="label">Export / Import</div>

                <div className="btnGroup" style={{ marginBottom: '10px' }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => {
                            const text = onExport();
                            setExportText(text);
                        }}
                        aria-label="Export game"
                    >
                        Export
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => {
                            onImport(importText.trim());
                        }}
                        aria-label="Import game"
                    >
                        Import
                    </button>
                </div>

                <label className="label" htmlFor="exportText">
                    Export text (auto-copied when possible)
                </label>
                <textarea
                    id="exportText"
                    className="inputText"
                    style={{ minHeight: '88px', resize: 'vertical' }}
                    value={exportText}
                    onChange={(e) => setExportText(e.target.value)}
                />

                <div style={{ height: '10px' }} />

                <label className="label" htmlFor="importText">
                    Paste export text here
                </label>
                <textarea
                    id="importText"
                    className="inputText"
                    style={{ minHeight: '88px', resize: 'vertical' }}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="RSUDOKU|v1|difficulty=easy|..."
                />
                <div className="helperText" style={{ marginTop: '8px' }}>
                    Import replaces your current game. This works offline.
                </div>
            </div>
        </aside>
    );
}

export { ControlPanel };
