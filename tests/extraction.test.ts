import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { PdfFixtureFactory } from './fixtures/PdfFixtureFactory';
import { ExtractionPipeline } from './support/ExtractionPipeline';

const require = createRequire(import.meta.url);
const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');

const fixtures = new PdfFixtureFactory();
const pipeline = new ExtractionPipeline(workerSrc);

describe('PDF extraction end to end', () => {
  it('separates words drawn as separate runs with a horizontal gap', async () => {
    const result = await pipeline.run(await fixtures.separatedWords());

    expect(result.fragmentTexts(0)).toEqual(['palabras', ' ', 'pegadas']);
    expect(result.lineTexts(0)).toEqual(['palabras pegadas']);
    expect(result.blockTexts(0)).toEqual(['palabras pegadas']);
  });

  it('keeps two runs glued when there is no gap between them', async () => {
    const result = await pipeline.run(await fixtures.gluedRuns());

    expect(result.fragmentTexts(0)).toEqual(['pala', 'bras']);
    expect(result.lineTexts(0)).toEqual(['palabras']);
    expect(result.blockTexts(0)).toEqual(['palabras']);
  });

  it('expands typographic ligatures and folds a non-breaking space', async () => {
    const result = await pipeline.run(await fixtures.ligatureAndNbsp());

    expect(result.lineTexts(0)).toEqual(['oficina reflejo']);
    expect(result.blockTexts(0)).toEqual(['oficina reflejo']);
  });

  it('keeps an indented first line in its paragraph and splits on a vertical gap', async () => {
    const result = await pipeline.run(await fixtures.paragraphs());

    expect(result.blockTexts(0)).toEqual([
      'Primera linea indentada segunda linea del parrafo',
      'Segundo parrafo',
    ]);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]?.heading).toBeNull();
    expect(result.sections[0]?.level).toBe(0);
  });

  it('nests two font-size headings and a numbered heading into levels', async () => {
    const result = await pipeline.run(await fixtures.headings());

    expect(result.sectionHeadingTexts()).toEqual(['1. Introduccion', 'Metodos']);
    expect(result.sections.map((section) => section.level)).toEqual([1, 2]);
    expect(result.sectionBodyTexts()).toEqual([
      ['Texto de introduccion uno Texto de introduccion dos'],
      ['Texto de metodos uno Texto de metodos dos'],
    ]);
  });

  it('welds a word broken across two lines with a trailing hyphen', async () => {
    const result = await pipeline.run(await fixtures.hyphenatedBreak());

    expect(result.lineTexts(0)).toEqual(['extra-', 'ordinario']);
    expect(result.blockTexts(0)).toEqual(['extraordinario']);
  });

  it('yields zero fragments for a page with no text layer', async () => {
    const result = await pipeline.run(await fixtures.noTextLayer());

    expect(result.document.pageCount).toBe(1);
    expect(result.document.pages[0]?.fragments).toEqual([]);
    expect(result.lineTexts(0)).toEqual([]);
    expect(result.blockTexts(0)).toEqual([]);
  });

  it('extracts every page in order with its own text', async () => {
    const result = await pipeline.run(await fixtures.threePages());

    expect(result.document.pageCount).toBe(3);
    expect(result.lineTexts(0)).toEqual(['primera pagina']);
    expect(result.lineTexts(1)).toEqual(['segunda pagina']);
    expect(result.lineTexts(2)).toEqual(['tercera pagina']);
  });

  it('builds byte-identical fixtures across runs', async () => {
    expect(await fixtures.separatedWords()).toEqual(await fixtures.separatedWords());
    expect(await fixtures.headings()).toEqual(await fixtures.headings());
  });

  it('keeps the rows of a two column table apart instead of merging them', async () => {
    const result = await pipeline.run(await fixtures.twoColumnTable());

    expect(result.blockTexts(0)).toEqual(['Concepto Importe', 'Ingresos 1.250', 'Costes 840']);
  });

  it('detects headings that only differ from the body by the font they use', async () => {
    const result = await pipeline.run(await fixtures.boldHeadings());

    expect(result.sectionHeadingTexts()).toEqual(['Resultados del ejercicio', 'Metodologia']);
    expect(result.sectionBodyTexts()).toEqual([
      ['El texto del parrafo empieza aca y sigue en la linea del cuerpo'],
      ['La segunda seccion del cuerpo con otra linea de parrafo'],
    ]);
  });
});
