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

  it('offers a dropzone and a file picker', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: 'Zona para cargar el PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Elegir PDF' })).toBeInTheDocument();
  });
});
