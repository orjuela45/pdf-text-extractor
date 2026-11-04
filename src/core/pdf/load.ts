import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// pdf.js parses PDFs off the main thread. Vite resolves this import to a real asset
// URL at build time, and the assignment must happen before the first `getDocument`
// call. Without it pdf.js falls back to resolving a worker from a path that does not
// exist in our bundle.
GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Opens a PDF with pdf.js and returns its document proxy.
 *
 * The proxy is deliberately kept alive: the viewer needs it to render pages to a
 * canvas, and text extraction walks the very same proxy, so a document is parsed
 * exactly once.
 *
 * **The buffer is consumed.** pdf.js transfers `data` to the worker, which detaches
 * the underlying ArrayBuffer. After this call the caller's ArrayBuffer, and every
 * TypedArray view over it, reads as empty. Read the file into a fresh buffer for
 * each open and never hold on to the reference.
 */
export async function loadPdfDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const task = getDocument({ data: new Uint8Array(data) });
  return await task.promise;
}
