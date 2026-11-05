import { TextLayer, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import type { PageRenderViewport } from './models';

export class PageRenderer {
  private task: RenderTask | null = null;

  async render(
    document: PDFDocumentProxy,
    pageNumber: number,
    scale: number,
    canvas: HTMLCanvasElement,
    textLayerContainer: HTMLElement,
  ): Promise<PageRenderViewport> {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation: 0 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    this.task = page.render({ canvas, viewport });
    await this.task.promise;
    this.task = null;

    textLayerContainer.replaceChildren();
    const textLayer = new TextLayer({
      textContentSource: await page.getTextContent(),
      container: textLayerContainer,
      viewport,
    });
    await textLayer.render();

    return { width: viewport.width, height: viewport.height, transform: viewport.transform };
  }

  cancel(): void {
    this.task?.cancel();
    this.task = null;
  }
}
