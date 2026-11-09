import type { PDFDocumentProxy, PageViewport, RenderTask } from 'pdfjs-dist';
import type { PageRenderViewport } from './models';

interface ViewportPage {
  getViewport(parameters: { scale: number }): PageViewport;
}

export class PageRenderer {
  private task: RenderTask | null = null;

  createViewport(page: ViewportPage, scale: number): PageViewport {
    return page.getViewport({ scale });
  }

  async render(
    pdf: PDFDocumentProxy,
    pageNumber: number,
    scale: number,
    canvas: HTMLCanvasElement,
  ): Promise<PageRenderViewport> {
    const page = await pdf.getPage(pageNumber);
    const viewport = this.createViewport(page, scale);
    const scratch = document.createElement('canvas');

    scratch.width = viewport.width;
    scratch.height = viewport.height;

    this.task = page.render({ canvas: scratch, viewport });
    await this.task.promise;
    this.task = null;

    canvas.width = scratch.width;
    canvas.height = scratch.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.getContext('2d')?.drawImage(scratch, 0, 0);

    return { width: viewport.width, height: viewport.height, transform: viewport.transform };
  }

  cancel(): void {
    this.task?.cancel();
    this.task = null;
  }
}
