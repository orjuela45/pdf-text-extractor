import { describe, expect, it, vi } from 'vitest';

import { FakePdfDocument } from '../../test/FakePdfDocument';
import { FakePdfPage } from '../../test/FakePdfPage';
import { RawItemFactory } from '../../test/RawItemFactory';
import { PdfTextExtractor } from './PdfTextExtractor';

const items = new RawItemFactory();

describe('PdfTextExtractor', () => {
  it('walks every page in order and numbers them from zero', async () => {
    const document = new FakePdfDocument([
      new FakePdfPage({ items: [items.create('primera')] }),
      new FakePdfPage({ items: [items.create('segunda')] }),
    ]);

    const model = await new PdfTextExtractor().extract(document);

    expect(model.pageCount).toBe(2);
    expect(model.pages.map((page) => page.index)).toEqual([0, 1]);
    expect(model.pages.map((page) => page.fragments[0]?.text)).toEqual(['primera', 'segunda']);
  });

  it('asks for the unrotated page box and records the rotation separately', async () => {
    const page = new FakePdfPage({ rotate: 90 });
    const document = new FakePdfDocument([page]);

    const model = await new PdfTextExtractor().extract(document);

    expect(page.viewportParameters).toEqual([{ scale: 1, rotation: 0 }]);
    expect(model.pages[0]?.width).toBe(612);
    expect(model.pages[0]?.height).toBe(792);
    expect(model.pages[0]?.rotation).toBe(90);
  });

  it('reports progress once per page, counting up to the total', async () => {
    const onProgress = vi.fn();
    const document = new FakePdfDocument([new FakePdfPage(), new FakePdfPage(), new FakePdfPage()]);

    await new PdfTextExtractor(onProgress).extract(document);

    expect(onProgress.mock.calls).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });

  it('yields pages with no fragments when the PDF has no text layer', async () => {
    const document = new FakePdfDocument([new FakePdfPage()]);

    const model = await new PdfTextExtractor().extract(document);

    expect(model.pages[0]?.fragments).toEqual([]);
  });
});
