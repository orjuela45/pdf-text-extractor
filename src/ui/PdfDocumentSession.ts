import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ProgressListener, QualityReport } from '../core/models';
import { PdfDocumentLoader } from '../core/pdf/PdfDocumentLoader';
import { ExtractionSession } from './ExtractionSession';
import type { CopyOutcome, Point, ViewerPage } from './models';

export class PdfDocumentSession {
  private readonly loader: PdfDocumentLoader;
  private readonly extraction: ExtractionSession;
  private document: PDFDocumentProxy | null = null;

  constructor(
    loader: PdfDocumentLoader = new PdfDocumentLoader(),
    extraction: ExtractionSession = new ExtractionSession(),
  ) {
    this.loader = loader;
    this.extraction = extraction;
  }

  async open(data: ArrayBuffer, onProgress?: ProgressListener): Promise<void> {
    const document = await this.loader.load(data);

    await this.extraction.extract(document, onProgress);
    this.document = document;
  }

  get documentProxy(): PDFDocumentProxy | null {
    return this.document;
  }

  get viewerPages(): readonly ViewerPage[] {
    return this.extraction.viewerPages;
  }

  get qualityReport(): QualityReport | null {
    return this.extraction.qualityReport;
  }

  copyBlockAt(pageIndex: number, point: Point): Promise<CopyOutcome> {
    return this.extraction.copyBlockAt(pageIndex, point);
  }
}
