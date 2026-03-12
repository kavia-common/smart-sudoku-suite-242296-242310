import React, { useEffect, useMemo, useState } from 'react';

import { getStoredTheme, setStoredTheme } from '../../state/persistence';

// PUBLIC_INTERFACE
function AppLayout({ children }) {
    /**
     * App shell layout that hosts the topbar, theme toggle, and main content.
     * @param {{children: React.ReactNode}} props
     */
    const initialTheme = useMemo(() => getStoredTheme() || 'dark', []);
    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        setStoredTheme(theme);
    }, [theme]);

    // PUBLIC_INTERFACE
    function toggleTheme() {
        /** Toggle between light/dark theme modes. */
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }

    return (
        <div className="appShell">
            <div className="topbar">
                <div className="topbarInner">
                    <div className="brand" aria-label="App title">
                        <div className="brandTitle">
                            Retro<span>Sudoku</span>
                        </div>
                        <div className="badge">offline • accessible • fast</div>
                    </div>

                    <div className="toolbar">
                        <button
                            className="btn btnSmall"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            type="button"
                        >
                            {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="container">{children}</main>
        </div>
    );
}

export { AppLayout };
