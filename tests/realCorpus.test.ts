import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { ExtractionPipeline } from './support/ExtractionPipeline';

const require = createRequire(import.meta.url);
const workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
const realDir = fileURLToPath(new URL('./fixtures/real/', import.meta.url));
const realPdfs = readdirSync(realDir).filter((name) => name.endsWith('.pdf'));

if (realPdfs.length === 0) {
  it.skip('real PDF corpus: drop PDFs into tests/fixtures/real to run this', () => {
    expect(realPdfs).toEqual([]);
  });
} else {
  describe('real PDF corpus', () => {
    for (const name of realPdfs) {
      it(`extracts ${name} without failing`, async () => {
        const bytes = new Uint8Array(readFileSync(join(realDir, name)));
        const result = await new ExtractionPipeline(workerSrc).run(bytes);

        expect(result.document.pageCount).toBeGreaterThan(0);
        expect(result.document.pages).toHaveLength(result.document.pageCount);
      });
    }
  });
}
