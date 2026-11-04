// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App shell', () => {
  it('renders the product name and the client-side promise', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Extractor de texto PDF' })).toBeInTheDocument();
    expect(screen.getByText(/se corrigen al cargar el archivo/)).toBeInTheDocument();
  });
});
