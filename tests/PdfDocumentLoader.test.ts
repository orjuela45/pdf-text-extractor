import { GlobalWorkerOptions } from 'pdfjs-dist';
import { describe, expect, it } from 'vitest';

import { PdfDocumentLoader } from '../src/core/pdf/PdfDocumentLoader';

describe('PdfDocumentLoader', () => {
  it('uses the injected worker source', () => {
    new PdfDocumentLoader('/virtual/pdf.worker.mjs');

    expect(GlobalWorkerOptions.workerSrc).toBe('/virtual/pdf.worker.mjs');
  });

  it('falls back to the bundled worker URL when none is injected', () => {
    new PdfDocumentLoader();

    expect(GlobalWorkerOptions.workerSrc).not.toBe('');
  });
});
