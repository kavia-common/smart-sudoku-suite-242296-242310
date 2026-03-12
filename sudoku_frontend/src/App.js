import React from 'react';

import { AppLayout } from './components/layout/AppLayout';
import { SudokuPage } from './pages/SudokuPage';

// PUBLIC_INTERFACE
function App() {
    /** Root React component. Renders the main application layout and Sudoku page. */
    return (
        <AppLayout>
            <SudokuPage />
        </AppLayout>
    );
}

export default App;
