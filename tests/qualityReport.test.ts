import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { QualityReporter } from '../src/core/report/QualityReporter';
import { PdfFixtureFactory } from './fixtures/PdfFixtureFactory';
import { ExtractionPipeline } from './support/ExtractionPipeline';

const require = createRequire(import.meta.url);
const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');

const fixtures = new PdfFixtureFactory();
const pipeline = new ExtractionPipeline(workerSrc);
const reporter = new QualityReporter();

describe('quality report end to end', () => {
  it('points at the page that has no text layer', async () => {
    const result = await pipeline.run(await fixtures.noTextLayer());
    const report = reporter.report({
      document: result.document,
      lines: result.lines,
      blocks: result.blocks,
      sections: result.sections,
    });

    expect(report.pagesWithoutText).toEqual([0]);
    expect(report.suspiciousJoins).toEqual([]);
    expect(report.stats).toEqual({
      pages: 1,
      pagesWithoutText: 1,
      fragments: 0,
      lines: 0,
      blocks: 0,
      sections: 0,
      characters: 0,
    });
  });

  it('reports the aggregate shape of a multi-page document', async () => {
    const result = await pipeline.run(await fixtures.threePages());
    const report = reporter.report({
      document: result.document,
      lines: result.lines,
      blocks: result.blocks,
      sections: result.sections,
    });

    expect(report.pagesWithoutText).toEqual([]);
    expect(report.stats).toEqual({
      pages: 3,
      pagesWithoutText: 0,
      fragments: 3,
      lines: 3,
      blocks: 3,
      sections: 1,
      characters: 42,
    });
  });

  it('leaves an ordinary separated-words page free of suspicious joins', async () => {
    const result = await pipeline.run(await fixtures.separatedWords());
    const report = reporter.report({
      document: result.document,
      lines: result.lines,
      blocks: result.blocks,
      sections: result.sections,
    });

    expect(result.fragmentTexts(0)).toEqual(['palabras', ' ', 'pegadas']);
    expect(report.suspiciousJoins).toEqual([]);
  });

  it('surfaces a separator whose advance is narrower than the gap it leaves', async () => {
    const result = await pipeline.run(await fixtures.separatorNarrowerThanGap());
    const report = reporter.report({
      document: result.document,
      lines: result.lines,
      blocks: result.blocks,
      sections: result.sections,
    });

    expect(result.fragmentTexts(0)).toEqual(['pala', ' ', 'bras']);
    expect(result.lineTexts(0)).toEqual(['pala bras']);
    expect(report.suspiciousJoins).toEqual([
      {
        pageIndex: 0,
        lineIndex: 0,
        previousText: ' ',
        nextText: 'bras',
        gap: 4,
        threshold: 9,
        fontSize: 36,
        evaluated: false,
        insertedSeparator: false,
        crossesFontBoundary: true,
      },
    ]);
    expect(report.stats).toEqual({
      pages: 1,
      pagesWithoutText: 0,
      fragments: 3,
      lines: 1,
      blocks: 1,
      sections: 1,
      characters: 9,
    });
  });
});
