import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import GrandSlamApp from './GrandSlamApp';

describe('GrandSlamApp', () => {
    it('renders correctly', async () => {
        render(<GrandSlamApp />);
        expect(await screen.findByText(/Players/)).toBeInTheDocument();
    });
});