// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PdfViewer } from './PdfViewer';
import type { ViewerPage } from './models/viewer';

const pages: ViewerPage[] = [
  {
    index: 0,
    model: { index: 0, width: 612, height: 792, rotation: 0, fragments: [] },
    blocks: [],
  },
  {
    index: 1,
    model: { index: 1, width: 612, height: 792, rotation: 0, fragments: [] },
    blocks: [],
  },
  {
    index: 2,
    model: { index: 2, width: 612, height: 792, rotation: 0, fragments: [] },
    blocks: [],
  },
];

const document = {} as NonNullable<Parameters<typeof PdfViewer>[0]['document']>;

vi.mock('./PdfPage', () => ({
  PdfPage: ({ page }: { page: ViewerPage }) => <div data-testid="page" data-index={page.index} />,
}));

describe('PdfViewer', () => {
  it('shows only the current page by default', () => {
    render(
      <PdfViewer pages={pages} document={document} scale={1} currentPage={2} onCopyAt={vi.fn()} />,
    );

    const shown = screen.getAllByTestId('page');

    expect(shown).toHaveLength(1);
    expect(shown[0]?.getAttribute('data-index')).toBe('1');
  });

  it('renders every page when the whole document is requested', () => {
    render(
      <PdfViewer
        pages={pages}
        document={document}
        scale={1}
        currentPage={2}
        showAllPages
        onCopyAt={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId('page')).toHaveLength(3);
  });
});
