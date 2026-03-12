import { render, screen } from '@testing-library/react';

import App from './App';

test('renders sudoku console title', () => {
    render(<App />);
    expect(screen.getByText(/sudoku console/i)).toBeInTheDocument();
});
