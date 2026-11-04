import { describe, expect, it, vi } from 'vitest';

import { extractDocument, type PdfDocumentLike, type PdfPageLike } from './extract';
import type { RawTextContentItem } from './text-content';

const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;

function textItem(text: string, y: number): RawTextContentItem {
  return {
    str: text,
    dir: 'ltr',
    transform: [10, 0, 0, 10, 72, y],
    width: text.length * 5,
    height: 10,
    fontName: 'g_d0_f1',
    hasEOL: false,
  };
}

interface FakePageOptions {
  readonly rotate?: number;
  readonly items?: readonly RawTextContentItem[];
  readonly getViewport?: PdfPageLike['getViewport'];
}

function fakePage(options: FakePageOptions = {}): PdfPageLike {
  const { rotate = 0, items = [], getViewport } = options;

  return {
    rotate,
    getViewport:
      getViewport ??
      ((params) => {
        // Mirror the real pdf.js viewport: a quarter turn swaps the page axes.
        const quarterTurn = (params.rotation ?? rotate) % 180 !== 0;
        return quarterTurn
          ? { width: LETTER_HEIGHT, height: LETTER_WIDTH }
          : { width: LETTER_WIDTH, height: LETTER_HEIGHT };
      }),
    getTextContent: async () => ({ items }),
  };
}

function fakeDocument(pages: readonly PdfPageLike[]): PdfDocumentLike {
  return {
    numPages: pages.length,
    getPage: async (pageNumber) => {
      const page = pages[pageNumber - 1];
      if (!page) {
        throw new Error(`No such page: ${pageNumber}`);
      }
      return page;
    },
  };
}

describe('extractDocument', () => {
  it('walks every page in order and numbers them from zero', async () => {
    const document = fakeDocument([
      fakePage({ items: [textItem('primera', 700)] }),
      fakePage({ items: [textItem('segunda', 700)] }),
    ]);

    const model = await extractDocument(document);

    expect(model.pageCount).toBe(2);
    expect(model.pages.map((page) => page.index)).toEqual([0, 1]);
    expect(model.pages.map((page) => page.fragments[0]?.text)).toEqual(['primera', 'segunda']);
  });

  it('asks for the unrotated page box and records the rotation separately', async () => {
    const getViewport = vi.fn((params: { scale: number; rotation?: number }) =>
      params.rotation === 0
        ? { width: LETTER_WIDTH, height: LETTER_HEIGHT }
        : { width: LETTER_HEIGHT, height: LETTER_WIDTH },
    );
    const document = fakeDocument([fakePage({ rotate: 90, getViewport })]);

    const model = await extractDocument(document);

    expect(getViewport).toHaveBeenCalledWith({ scale: 1, rotation: 0 });
    expect(model.pages[0]?.width).toBe(LETTER_WIDTH);
    expect(model.pages[0]?.height).toBe(LETTER_HEIGHT);
    expect(model.pages[0]?.rotation).toBe(90);
  });

  it('reports progress once per page, counting up to the total', async () => {
    const onProgress = vi.fn();
    const document = fakeDocument([fakePage(), fakePage(), fakePage()]);

    await extractDocument(document, { onProgress });

    expect(onProgress.mock.calls).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });

  it('yields pages with no fragments when the PDF has no text layer', async () => {
    const document = fakeDocument([fakePage({ items: [] })]);

    const model = await extractDocument(document);

    expect(model.pages[0]?.fragments).toEqual([]);
  });
});
