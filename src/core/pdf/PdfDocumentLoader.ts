import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export class PdfDocumentLoader {
  constructor() {
    GlobalWorkerOptions.workerSrc = workerUrl;
  }

  async load(data: ArrayBuffer): Promise<PDFDocumentProxy> {
    const task = getDocument({ data: new Uint8Array(data) });
    return await task.promise;
  }
}
