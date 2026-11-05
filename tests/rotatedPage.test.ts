import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { BlockBuilder } from '../src/core/layout/BlockBuilder';
import { LineBuilder } from '../src/core/layout/LineBuilder';
import { PdfDocumentLoader } from '../src/core/pdf/PdfDocumentLoader';
import { PdfTextExtractor } from '../src/core/pdf/PdfTextExtractor';
import { TextAssembler } from '../src/core/text/TextAssembler';
import { BlockHitTester } from '../src/ui/BlockHitTester';
import { CoordinateMapper } from '../src/ui/CoordinateMapper';
import { PageRenderer } from '../src/ui/PageRenderer';
import { PdfFixtureFactory } from './fixtures/PdfFixtureFactory';

const require = createRequire(import.meta.url);
const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');

const fixtures = new PdfFixtureFactory();

describe('rotated pages', () => {
  it('renders with the page rotation and still copies the right paragraph', async () => {
    const bytes = await fixtures.rotatedPage();
    const document = await new PdfDocumentLoader(workerSrc).load(Uint8Array.from(bytes).buffer);
    const page = await document.getPage(1);

    const model = await new PdfTextExtractor().extract(document);
    const blocks = new BlockBuilder().build(
      new LineBuilder().build(model.pages[0]?.fragments ?? []),
    );
    const block = blocks[0];

    if (block === undefined) {
      throw new Error('Expected a paragraph block on the rotated page');
    }

    const rotated = new PageRenderer().createViewport(page, 1);

    expect(rotated.width).toBe(792);
    expect(rotated.height).toBe(612);

    const center = { x: (block.left + block.right) / 2, y: (block.top + block.bottom) / 2 };
    const [canvasX, canvasY] = rotated.convertToViewportPoint(center.x, center.y);

    const rotatedHit = new BlockHitTester().find(
      blocks,
      new CoordinateMapper(rotated.transform).toUserSpace({ x: canvasX, y: canvasY }),
    );

    expect(rotatedHit).not.toBeNull();
    expect(new TextAssembler().assembleBlock(rotatedHit as (typeof blocks)[number])).toBe(
      'parrafo rotado',
    );

    const unrotated = page.getViewport({ scale: 1, rotation: 0 });
    const unrotatedHit = new BlockHitTester().find(
      blocks,
      new CoordinateMapper(unrotated.transform).toUserSpace({ x: canvasX, y: canvasY }),
    );

    expect(unrotatedHit).toBeNull();
  });
});
