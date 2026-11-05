import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export class PdfDocumentLoader {
  private readonly workerSrc: string;

  constructor(workerSrc: string = workerUrl) {
    this.workerSrc = workerSrc;
    GlobalWorkerOptions.workerSrc = this.workerSrc;
  }

  async load(data: ArrayBuffer): Promise<PDFDocumentProxy> {
    const task = getDocument({ data: new Uint8Array(data) });
    return await task.promise;
  }
}
