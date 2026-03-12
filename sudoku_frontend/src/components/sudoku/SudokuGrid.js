import React, { useEffect, useMemo, useRef } from 'react';

import { isValidDigit } from '../../domain/sudoku/sudokuUtils';

// PUBLIC_INTERFACE
function SudokuGrid({
    game,
    selected,
    notesMode,
    conflicts,
    onSelect,
    onInputNumber,
    onClear,
    onToggleNotesMode,
    onUndo,
    onRedo,
}) {
    /**
     * Interactive 9x9 Sudoku grid with keyboard navigation and accessible semantics.
     */
    const cellRefs = useRef([]);
    const selectedRefIndex = selected.r * 9 + selected.c;

    const selectedValue = useMemo(() => {
        const cell = game.grid[selected.r][selected.c];
        return cell?.value ?? null;
    }, [game.grid, selected]);

    useEffect(() => {
        const el = cellRefs.current[selectedRefIndex];
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
    }, [selectedRefIndex]);

    useEffect(() => {
        // Keyboard interactions at grid level.
        function onKeyDown(e) {
            const key = e.key;

            if (key === 'ArrowUp') {
                e.preventDefault();
                onSelect({ r: (selected.r + 8) % 9, c: selected.c });
                return;
            }
            if (key === 'ArrowDown') {
                e.preventDefault();
                onSelect({ r: (selected.r + 1) % 9, c: selected.c });
                return;
            }
            if (key === 'ArrowLeft') {
                e.preventDefault();
                onSelect({ r: selected.r, c: (selected.c + 8) % 9 });
                return;
            }
            if (key === 'ArrowRight') {
                e.preventDefault();
                onSelect({ r: selected.r, c: (selected.c + 1) % 9 });
                return;
            }

            if (key === 'Backspace' || key === 'Delete' || key === '0') {
                e.preventDefault();
                onClear();
                return;
            }

            if (key === 'n' || key === 'N') {
                e.preventDefault();
                onToggleNotesMode();
                return;
            }

            if (key === 'u' || key === 'U') {
                e.preventDefault();
                onUndo();
                return;
            }

            if (key === 'r' || key === 'R') {
                e.preventDefault();
                onRedo();
                return;
            }

            if (/^[1-9]$/.test(key)) {
                e.preventDefault();
                onInputNumber(Number(key));
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClear, onInputNumber, onRedo, onSelect, onToggleNotesMode, onUndo, selected]);

    return (
        <div>
            <div className="srOnly" aria-live="polite">
                Selected cell {selected.r + 1},{selected.c + 1}. {notesMode ? 'Notes mode.' : 'Value mode.'}{' '}
                {selectedValue ? `Value ${selectedValue}.` : 'Empty.'}
            </div>

            <div className="sudokuGrid" role="grid" aria-label="Sudoku grid">
                {game.grid.flatMap((row, r) =>
                    row.map((cell, c) => {
                        const index = r * 9 + c;
                        const isSelected = selected.r === r && selected.c === c;

                        const thickRight = c === 2 || c === 5;
                        const thickBottom = r === 2 || r === 5;

                        const isPeer =
                            !isSelected &&
                            (selected.r === r ||
                                selected.c === c ||
                                (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
                                    Math.floor(selected.c / 3) === Math.floor(c / 3)));

                        const isSameValue =
                            !isSelected &&
                            selectedValue != null &&
                            cell.value != null &&
                            selectedValue === cell.value;

                        const isConflict = Boolean(conflicts[r][c]);

                        const className = [
                            'cell',
                            thickRight ? 'thickRight' : '',
                            thickBottom ? 'thickBottom' : '',
                            cell.given ? 'given' : '',
                            isSelected ? 'selected' : '',
                            isPeer ? 'peer' : '',
                            isSameValue ? 'sameValue' : '',
                            isConflict ? 'conflict' : '',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        const label = cell.given ? 'given' : 'editable';
                        const valueText = cell.value ? String(cell.value) : 'empty';

                        return (
                            <button
                                key={`${r}-${c}`}
                                ref={(el) => {
                                    cellRefs.current[index] = el;
                                }}
                                type="button"
                                className={className}
                                role="gridcell"
                                aria-label={`Row ${r + 1} column ${c + 1}, ${label}, ${valueText}`}
                                aria-selected={isSelected}
                                onClick={() => onSelect({ r, c })}
                                onDoubleClick={() => {
                                    if (!cell.given) {
                                        onClear();
                                    }
                                }}
                            >
                                {cell.value != null ? (
                                    <span className="cellValue">{cell.value}</span>
                                ) : (
                                    <span aria-hidden="true">
                                        {cell.notes && cell.notes.length ? (
                                            <span className="notes">
                                                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                                                    <span key={n}>{cell.notes.includes(n) ? n : ''}</span>
                                                ))}
                                            </span>
                                        ) : (
                                            ''
                                        )}
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            <div className="helperText" style={{ marginTop: '10px' }}>
                Input: click a cell then type <span className="kbd">1-9</span>. Toggle notes with{' '}
                <span className="kbd">N</span>. Clear with <span className="kbd">Backspace</span>. Givens are locked.
                Conflicts are highlighted in red.
            </div>

            <div className="btnGroup" style={{ justifyContent: 'center', marginTop: '10px' }}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <button
                        key={n}
                        className="btn btnSmall"
                        type="button"
                        onClick={() => {
                            if (isValidDigit(n)) {
                                onInputNumber(n);
                            }
                        }}
                        aria-label={`Input ${n}`}
                    >
                        {n}
                    </button>
                ))}
                <button className="btn btnSmall" type="button" onClick={onClear} aria-label="Clear cell">
                    Clear
                </button>
            </div>
        </div>
    );
}

export { SudokuGrid };
