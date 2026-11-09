// @vitest-environment jsdom
import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import { describe, expect, it } from 'vitest';

import { PageRenderer } from './PageRenderer';

const pdfjsRefusal = 'Cannot use the same canvas during multiple render() operations.';

class RecordingPage {
  readonly parameters: { scale: number; rotation?: number }[] = [];

  getViewport(parameters: { scale: number }): PageViewport {
    this.parameters.push(parameters);

    return {
      width: 612,
      height: 792,
      scale: parameters.scale,
      rotation: 90,
      transform: [0, 1, 1, 0, 0, 0],
      rawDims: { pageWidth: 612, pageHeight: 792, pageX: 0, pageY: 0 },
    } as unknown as PageViewport;
  }
}

class GuardedPage extends RecordingPage {
  private readonly rendering = new Set<HTMLCanvasElement>();

  override getViewport(parameters: { scale: number }): PageViewport {
    return {
      width: 100 * parameters.scale,
      height: 200 * parameters.scale,
      transform: [parameters.scale, 0, 0, -parameters.scale, 0, 200 * parameters.scale],
    } as unknown as PageViewport;
  }

  render({ canvas }: { canvas: HTMLCanvasElement }): {
    promise: Promise<void>;
    cancel: () => void;
  } {
    if (this.rendering.has(canvas)) {
      return { promise: Promise.reject(new Error(pdfjsRefusal)), cancel: () => undefined };
    }

    this.rendering.add(canvas);

    return {
      promise: new Promise<void>((resolve) => {
        setTimeout(() => {
          this.rendering.delete(canvas);
          resolve();
        }, 5);
      }),
      cancel: () => undefined,
    };
  }
}

const asPdf = (page: unknown) => ({ getPage: async () => page }) as unknown as PDFDocumentProxy;

describe('PageRenderer', () => {
  it('asks the page for its own viewport without overriding the rotation', () => {
    const page = new RecordingPage();

    const viewport = new PageRenderer().createViewport(page, 2);

    expect(page.parameters).toEqual([{ scale: 2 }]);
    expect(viewport.transform).toEqual([0, 1, 1, 0, 0, 0]);
  });

  it('renders a page and copies it onto the visible canvas', async () => {
    const canvas = globalThis.document.createElement('canvas');

    const rendered = await new PageRenderer().render(asPdf(new GuardedPage()), 1, 2, canvas);

    expect(rendered.width).toBe(200);
    expect(canvas.width).toBe(200);
    expect(canvas.style.width).toBe('200px');
  });

  it('lets two overlapping renders on one visible canvas both finish instead of pdf.js refusing', async () => {
    const canvas = globalThis.document.createElement('canvas');
    const pdf = asPdf(new GuardedPage());

    const results = await Promise.all([
      new PageRenderer().render(pdf, 1, 1, canvas),
      new PageRenderer().render(pdf, 1, 1, canvas),
    ]);

    expect(results).toHaveLength(2);
    expect(results[0]?.height).toBe(200);
  });
});
