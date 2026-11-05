import type { PageViewport } from 'pdfjs-dist';
import { describe, expect, it } from 'vitest';

import { PageRenderer } from './PageRenderer';

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

describe('PageRenderer', () => {
  it('asks the page for its own viewport without overriding the rotation', () => {
    const page = new RecordingPage();

    const viewport = new PageRenderer().createViewport(page, 2);

    expect(page.parameters).toEqual([{ scale: 2 }]);
    expect(viewport.transform).toEqual([0, 1, 1, 0, 0, 0]);
  });
});
