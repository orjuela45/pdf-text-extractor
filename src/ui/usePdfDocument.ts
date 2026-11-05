import { useCallback, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { QualityReport } from '../core/models';
import type {
  CopyOutcome,
  ExtractionProgress,
  ExtractionStatus,
  Point,
  ViewerPage,
} from './models';
import { PdfDocumentSession } from './PdfDocumentSession';

export interface UsePdfDocument {
  readonly status: ExtractionStatus;
  readonly progress: ExtractionProgress;
  readonly pages: readonly ViewerPage[];
  readonly report: QualityReport | null;
  readonly document: PDFDocumentProxy | null;
  open(file: File): Promise<void>;
  copyBlockAt(pageIndex: number, point: Point): Promise<CopyOutcome>;
}

export function usePdfDocument(): UsePdfDocument {
  const [session] = useState(() => new PdfDocumentSession());
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [progress, setProgress] = useState<ExtractionProgress>({ done: 0, total: 0 });
  const [pages, setPages] = useState<readonly ViewerPage[]>([]);
  const [report, setReport] = useState<QualityReport | null>(null);

  const open = useCallback(
    async (file: File): Promise<void> => {
      setStatus('loading');
      setProgress({ done: 0, total: 0 });

      try {
        await session.open(await file.arrayBuffer(), (done, total) => {
          setProgress({ done, total });
        });
        setPages(session.viewerPages);
        setReport(session.qualityReport);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    },
    [session],
  );

  const copyBlockAt = useCallback(
    (pageIndex: number, point: Point): Promise<CopyOutcome> =>
      session.copyBlockAt(pageIndex, point),
    [session],
  );

  return {
    status,
    progress,
    pages,
    report,
    document: session.documentProxy,
    open,
    copyBlockAt,
  };
}
