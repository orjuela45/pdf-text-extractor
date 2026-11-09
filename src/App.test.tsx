// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App shell', () => {
  it('renders the product name and offers to load a PDF', () => {
    render(<App />);

    expect(screen.getByText('Extractor de texto PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cargar PDF' })).toBeInTheDocument();
  });

  it('offers a dropzone and a file picker', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: 'Zona para cargar el PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Elegir PDF' })).toBeInTheDocument();
  });
});
