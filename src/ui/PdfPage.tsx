import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PENDING_PAGE_VIEWPORT } from './constants';
import type { PageRenderViewport, Point, ViewerPage } from './models';
import { PageRenderer } from './PageRenderer';
import { PdfPageView } from './PdfPageView';

export interface PdfPageProps {
  readonly page: ViewerPage;
  readonly document: PDFDocumentProxy;
  readonly scale: number;
  readonly onCopyAt: (pageIndex: number, point: Point) => void;
}

export function PdfPage({ page, document, scale, onCopyAt }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<PageRenderViewport | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textLayer = textLayerRef.current;

    if (canvas === null || textLayer === null) {
      return;
    }

    let active = true;
    const renderer = new PageRenderer();

    void renderer
      .render(document, page.index + 1, scale, canvas, textLayer)
      .then((rendered) => {
        if (active) {
          setViewport(rendered);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      renderer.cancel();
    };
  }, [document, page.index, scale]);

  const rendered = viewport ?? PENDING_PAGE_VIEWPORT;

  return (
    <div className="flex flex-col gap-2">
      {viewport === null ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {`Preparando la página ${page.index + 1}…`}
        </p>
      ) : null}

      <PdfPageView
        width={rendered.width}
        height={rendered.height}
        transform={rendered.transform}
        canvasRef={canvasRef}
        textLayerRef={textLayerRef}
        onCopyAt={(point) => onCopyAt(page.index, point)}
      />
    </div>
  );
}
