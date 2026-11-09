import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PAGE_RENDER_ERROR_MESSAGE } from '../core/constants';
import { PENDING_PAGE_VIEWPORT } from './constants';
import type { TextBlock } from '../core/models';
import type { PageRenderViewport, Point, ViewerPage } from './models';
import { PageRenderer } from './PageRenderer';
import { PdfPageView } from './PdfPageView';

export interface PdfPageProps {
  readonly page: ViewerPage;
  readonly document: PDFDocumentProxy;
  readonly scale: number;
  readonly highlighted?: readonly TextBlock[];
  readonly highlightLabel?: string | null;
  readonly onCopyAt: (pageIndex: number, point: Point) => void;
}

export function PdfPage({
  page,
  document,
  scale,
  highlighted = [],
  highlightLabel = null,
  onCopyAt,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<PageRenderViewport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas === null) {
      return;
    }

    let active = true;
    const renderer = new PageRenderer();

    setFailed(false);

    void renderer
      .render(document, page.index + 1, scale, canvas)
      .then((rendered) => {
        if (active) {
          setViewport(rendered);
        }
      })
      .catch(() => {
        if (active) {
          setViewport(null);
          setFailed(true);
        }
      });

    return () => {
      active = false;
      renderer.cancel();
    };
  }, [document, page.index, scale]);

  const rendered = viewport ?? PENDING_PAGE_VIEWPORT;

  return (
    <div className="flex flex-col gap-2">
      {failed ? (
        <p role="alert" className="glass rounded-lg px-4 py-3 text-sm text-error">
          {`${PAGE_RENDER_ERROR_MESSAGE} (página ${page.index + 1})`}
        </p>
      ) : null}

      {viewport === null && !failed ? (
        <p
          role="status"
          className="glass animate-pulse rounded-lg px-4 py-8 text-center text-sm text-on-surface-variant"
        >
          {`Preparando la página ${page.index + 1}…`}
        </p>
      ) : null}

      <PdfPageView
        width={rendered.width}
        height={rendered.height}
        transform={rendered.transform}
        canvasRef={canvasRef}
        textLayerRef={textLayerRef}
        fragments={page.model.fragments}
        highlighted={highlighted}
        highlightLabel={highlightLabel}
        onCopyAt={(point) => onCopyAt(page.index, point)}
      />
    </div>
  );
}
