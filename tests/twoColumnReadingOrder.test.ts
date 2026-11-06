import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { ExtractionPipeline } from './support/ExtractionPipeline';
import { PdfFixtureFactory } from './fixtures/PdfFixtureFactory';

const resolver = createRequire(import.meta.url);
const workerSrc = resolver.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
const pipeline = new ExtractionPipeline(workerSrc);
const fixtures = new PdfFixtureFactory();

describe('two column reading order', () => {
  it('keeps each column out of the other column lines', async () => {
    const result = await pipeline.run(await fixtures.twoColumns());

    const lines = result.lines[0] ?? [];
    const texts = lines.map((line) => line.fragments.map((fragment) => fragment.text).join(''));

    expect(texts).toContain('columna izquierda uno');
    expect(texts).toContain('columna derecha uno');

    for (const text of texts) {
      expect(text.includes('izquierda') && text.includes('derecha')).toBe(false);
    }
  });

  it('copies only the left column text when the click lands on the left column', async () => {
    const result = await pipeline.run(await fixtures.twoColumns());

    const outcome = result.copyAt(0, { x: 80, y: 695 });

    expect(outcome.found).toBe(true);
    expect(outcome.text).toContain('columna izquierda dos');
    expect(outcome.text).not.toContain('derecha');
  });
});
