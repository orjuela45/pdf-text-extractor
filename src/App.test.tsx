// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { COPY_CONFIRMATION_LABEL, COPY_CONFIRMATION_MILLISECONDS } from './ui/constants';
import { usePdfDocument, type UsePdfDocument } from './ui/usePdfDocument';

vi.mock('./ui/usePdfDocument');

const mocked = vi.mocked(usePdfDocument);

const base: UsePdfDocument = {
  status: 'idle',
  progress: { done: 0, total: 0 },
  pages: [],
  report: null,
  error: null,
  document: null,
  file: null,
  sections: [],
  documentOutline: [],
  open: vi.fn(async () => undefined),
  copyBlockAt: vi.fn(async () => ({ text: null, copied: false })),
  copySection: vi.fn(async () => ({ text: null, copied: false })),
  copyAll: vi.fn(async () => ({ text: null, copied: false })),
  copyText: vi.fn(async () => ({ text: null, copied: false })),
  outlineFor: vi.fn(() => []),
  outlineBlock: vi.fn(() => null),
  copyOutlineBlock: vi.fn(async () => ({ text: null, copied: false })),
  copyOutlineBlockInDocument: vi.fn(async () => ({ text: null, copied: false })),
  pageOfBlock: vi.fn(() => 1),
};

const loadedReport = {
  pagesWithoutText: [],
  suspiciousJoins: [],
  stats: {
    pages: 1,
    pagesWithoutText: 0,
    fragments: 3,
    lines: 2,
    blocks: 2,
    sections: 1,
    characters: 20,
  },
};

const loaded: UsePdfDocument = {
  ...base,
  status: 'ready',
  pages: [
    {
      index: 0,
      model: { index: 0, width: 612, height: 792, rotation: 0, fragments: [] },
      blocks: [],
    },
  ],
  report: loadedReport,
  document: {} as NonNullable<UsePdfDocument['document']>,
  sections: [],
};

describe('App shell', () => {
  beforeEach(() => {
    mocked.mockReturnValue(base);
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('does not show any copy confirmation before anything is copied', () => {
    render(<App />);

    expect(screen.queryByText(COPY_CONFIRMATION_LABEL)).not.toBeInTheDocument();
  });

  it('confirms a successful copy in the bar and withdraws it on its own', async () => {
    mocked.mockReturnValue({
      ...loaded,
      copyAll: vi.fn(async () => ({ text: 'Hola', copied: true })),
    });
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copiar todo el documento' }));

    expect(await screen.findByText(COPY_CONFIRMATION_LABEL)).toBeInTheDocument();

    await waitFor(
      () => expect(screen.queryByText(COPY_CONFIRMATION_LABEL)).not.toBeInTheDocument(),
      { timeout: COPY_CONFIRMATION_MILLISECONDS + 1000 },
    );
  });

  it('does not add a green panel to the page body when the copy worked', async () => {
    mocked.mockReturnValue({
      ...loaded,
      copyAll: vi.fn(async () => ({ text: 'Hola', copied: true })),
    });
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copiar todo el documento' }));

    expect(await screen.findByText(COPY_CONFIRMATION_LABEL)).toBeInTheDocument();
    expect(screen.queryByText('Párrafo copiado al portapapeles:')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Texto copiado a mano' })).not.toBeInTheDocument();
  });

  it('warns with a fallback box only when the clipboard refused the copy', async () => {
    mocked.mockReturnValue({
      ...loaded,
      copyAll: vi.fn(async () => ({ text: 'Hola', copied: false })),
    });
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copiar todo el documento' }));

    expect(await screen.findByRole('textbox', { name: 'Texto copiado a mano' })).toHaveValue(
      'Hola',
    );
    expect(
      screen.getByText('No se pudo copiar automáticamente. Copiá el texto desde el cuadro.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(COPY_CONFIRMATION_LABEL)).not.toBeInTheDocument();
  });
});
