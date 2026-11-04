import type { PdfDocumentLike, PdfPageLike } from '../core/models';

export class FakePdfDocument implements PdfDocumentLike {
  readonly numPages: number;

  private readonly pages: readonly PdfPageLike[];

  constructor(pages: readonly PdfPageLike[] = []) {
    this.pages = pages;
    this.numPages = pages.length;
  }

  async getPage(pageNumber: number): Promise<PdfPageLike> {
    const page = this.pages[pageNumber - 1];

    if (!page) {
      throw new Error(`No such page: ${pageNumber}`);
    }

    return page;
  }
}
