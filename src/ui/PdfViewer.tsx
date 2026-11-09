import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { TextBlock } from '../core/models';
import type { Point, ViewerPage } from './models';
import { PdfPage } from './PdfPage';

export interface PdfViewerProps {
  readonly pages: readonly ViewerPage[];
  readonly document: PDFDocumentProxy | null;
  readonly scale: number;
  readonly currentPage?: number;
  readonly showAllPages?: boolean;
  readonly highlighted?: readonly TextBlock[];
  readonly highlightLabel?: string | null;
  readonly onCopyAt: (pageIndex: number, point: Point) => void;
}

export function PdfViewer({
  pages,
  document,
  scale,
  currentPage = 1,
  showAllPages = false,
  highlighted = [],
  highlightLabel = null,
  onCopyAt,
}: PdfViewerProps) {
  const activePage = pages.find((page) => page.index === currentPage - 1) ?? pages[0];
  const visible = showAllPages || activePage === undefined ? pages : [activePage];
  if (document === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {visible.map((page) => (
        <PdfPage
          key={page.index}
          page={page}
          document={document}
          scale={scale}
          highlighted={highlighted}
          highlightLabel={highlightLabel}
          onCopyAt={onCopyAt}
        />
      ))}
    </div>
  );
}
