import type { PdfDocumentModel, PageModel } from '../model';
import { toFragments, type RawTextContentItem } from './text-content';

/** Structural subset of the pdf.js `PDFPageProxy` this module needs. */
export interface PdfPageLike {
  readonly rotate: number;
  getViewport(params: { scale: number; rotation?: number }): {
    readonly width: number;
    readonly height: number;
  };
  getTextContent(params?: {
    includeMarkedContent?: boolean;
    disableNormalization?: boolean;
  }): Promise<{ readonly items: readonly RawTextContentItem[] }>;
}

/** Structural subset of the pdf.js `PDFDocumentProxy` this module needs. */
export interface PdfDocumentLike {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<PdfPageLike>;
}

export interface ExtractOptions {
  /** Called once per extracted page, with the 1-based count and the total. */
  readonly onProgress?: (done: number, total: number) => void;
}

async function extractPage(document: PdfDocumentLike, pageNumber: number): Promise<PageModel> {
  const page = await document.getPage(pageNumber);
  // Ask for the unrotated box so the page dimensions live in the same coordinate
  // space as the fragments, which `core` never rotates.
  const viewport = page.getViewport({ scale: 1, rotation: 0 });
  const textContent = await page.getTextContent();

  return {
    index: pageNumber - 1,
    width: viewport.width,
    height: viewport.height,
    rotation: page.rotate,
    fragments: toFragments(textContent.items),
  };
}

/**
 * Turns a pdf.js document into the plain, serializable domain model.
 *
 * Pages are read sequentially. pdf.js resolves `getPage` from a worker, so firing
 * every page at once on a long document costs memory without saving wall time, and
 * sequential reads are what make the progress callback meaningful.
 *
 * Note that this is the one place that reads the text layer, so it is also the one
 * place that decides what pdf.js is allowed to normalize. Text normalization is
 * left at the pdf.js default (on), because its ligature and glyph-name mapping is
 * better informed than ours; anything it leaves behind is handled downstream.
 */
export async function extractDocument(
  document: PdfDocumentLike,
  options: ExtractOptions = {},
): Promise<PdfDocumentModel> {
  const total = document.numPages;
  const pages: PageModel[] = [];

  for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
    pages.push(await extractPage(document, pageNumber));
    options.onProgress?.(pageNumber, total);
  }

  return { pageCount: total, pages };
}
