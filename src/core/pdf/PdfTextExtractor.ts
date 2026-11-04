import type { PageModel, PdfDocumentLike, PdfDocumentModel, ProgressListener } from '../models';
import { TextContentMapper } from './TextContentMapper';

export class PdfTextExtractor {
  private readonly mapper: TextContentMapper;
  private readonly onProgress: ProgressListener | undefined;

  constructor(onProgress?: ProgressListener) {
    this.mapper = new TextContentMapper();
    this.onProgress = onProgress;
  }

  async extract(document: PdfDocumentLike): Promise<PdfDocumentModel> {
    const pages: PageModel[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      pages.push(await this.extractPage(document, pageNumber));
      this.onProgress?.(pageNumber, document.numPages);
    }

    return { pageCount: document.numPages, pages };
  }

  private async extractPage(document: PdfDocumentLike, pageNumber: number): Promise<PageModel> {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1, rotation: 0 });
    const textContent = await page.getTextContent();

    return {
      index: pageNumber - 1,
      width: viewport.width,
      height: viewport.height,
      rotation: page.rotate,
      fragments: this.mapper.map(textContent.items),
    };
  }
}
