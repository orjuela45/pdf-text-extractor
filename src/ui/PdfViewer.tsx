import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Point, ViewerPage } from './models';
import { PdfPage } from './PdfPage';

export interface PdfViewerProps {
  readonly pages: readonly ViewerPage[];
  readonly document: PDFDocumentProxy | null;
  readonly scale: number;
  readonly onCopyAt: (pageIndex: number, point: Point) => void;
}

export function PdfViewer({ pages, document, scale, onCopyAt }: PdfViewerProps) {
  if (document === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {pages.map((page) => (
        <PdfPage
          key={page.index}
          page={page}
          document={document}
          scale={scale}
          onCopyAt={onCopyAt}
        />
      ))}
    </div>
  );
}
