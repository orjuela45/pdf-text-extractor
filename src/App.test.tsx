// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { usePdfDocument, type UsePdfDocument } from './ui/usePdfDocument';

vi.mock('./ui/usePdfDocument');

const mocked = vi.mocked(usePdfDocument);

const base: UsePdfDocument = {
  status: 'idle',
  progress: { done: 0, total: 0 },
  pages: [],
  report: null,
  outline: [],
  error: null,
  document: null,
  file: null,
  sections: [],
  open: vi.fn(async () => undefined),
  copyBlockAt: vi.fn(async () => ({ text: null, copied: false })),
  copySection: vi.fn(async () => ({ text: null, copied: false })),
  copyAll: vi.fn(async () => ({ text: null, copied: false })),
  copyText: vi.fn(async () => ({ text: null, copied: false })),
  sectionBlocks: vi.fn(() => []),
  sectionHeadingBlock: vi.fn(() => null),
  sectionHeadingText: vi.fn(() => null),
};

describe('App shell', () => {
  beforeEach(() => {
    mocked.mockReturnValue(base);
  });

  it('renders the product name and offers to load a PDF', () => {
    render(<App />);

    expect(screen.getByText('Extractor de texto PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cargar PDF' })).toBeInTheDocument();
  });

  it('offers a dropzone and a file picker before a document is chosen', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: 'Zona para cargar el PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Elegir PDF' })).toBeInTheDocument();
  });

  it('hides the drop zone while a document is loading', () => {
    mocked.mockReturnValue({ ...base, status: 'loading' });

    render(<App />);

    expect(
      screen.queryByRole('region', { name: 'Zona para cargar el PDF' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cargar PDF')).toBeInTheDocument();
  });
});
