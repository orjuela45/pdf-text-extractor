import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { ExtractionPipeline } from './support/ExtractionPipeline';
import { PdfFixtureFactory } from './fixtures/PdfFixtureFactory';

const resolver = createRequire(import.meta.url);
const workerSrc = resolver.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
const pipeline = new ExtractionPipeline(workerSrc);
const fixtures = new PdfFixtureFactory();

describe('compound hyphen across a line break', () => {
  it('keeps the hyphen of a real compound instead of welding it away', async () => {
    const result = await pipeline.run(await fixtures.hyphenCompound());

    expect(result.blockTexts(0)).toEqual(['El acuerdo fue franco-aleman y beneficioso']);
  });

  it('still welds a word that was split by the line break', async () => {
    const result = await pipeline.run(await fixtures.hyphenatedBreak());

    expect(result.blockTexts(0)).toEqual(['extraordinario']);
  });
});
