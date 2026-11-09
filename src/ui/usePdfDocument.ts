import { useCallback, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { QualityReport, TextBlock, TextSection } from '../core/models';
import { FileSizeGuard } from './FileSizeGuard';
import type {
  CopyOutcome,
  ExtractionProgress,
  ExtractionStatus,
  OutlineEntry,
  PdfErrorState,
  Point,
  ViewerPage,
} from './models';
import { PdfDocumentSession } from './PdfDocumentSession';
import { PdfErrorMapper } from './PdfErrorMapper';

export interface UsePdfDocument {
  readonly status: ExtractionStatus;
  readonly progress: ExtractionProgress;
  readonly pages: readonly ViewerPage[];
  readonly report: QualityReport | null;
  readonly outline: readonly OutlineEntry[];
  readonly error: PdfErrorState | null;
  readonly document: PDFDocumentProxy | null;
  readonly file: File | null;
  readonly sections: readonly TextSection[];
  open(file: File): Promise<void>;
  copyBlockAt(pageIndex: number, point: Point): Promise<CopyOutcome>;
  copySection(index: number): Promise<CopyOutcome>;
  copyAll(): Promise<CopyOutcome>;
  copyText(text: string): Promise<CopyOutcome>;
  sectionBlocks(index: number): readonly TextBlock[];
  sectionHeadingText(index: number): string | null;
}

export function usePdfDocument(session?: PdfDocumentSession): UsePdfDocument {
  const [activeSession] = useState(() => session ?? new PdfDocumentSession());
  const [guard] = useState(() => new FileSizeGuard());
  const [mapper] = useState(() => new PdfErrorMapper());
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [progress, setProgress] = useState<ExtractionProgress>({ done: 0, total: 0 });
  const [pages, setPages] = useState<readonly ViewerPage[]>([]);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [error, setError] = useState<PdfErrorState | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const open = useCallback(
    async (file: File): Promise<void> => {
      if (guard.exceeds(file.size)) {
        setPages([]);
        setReport(null);
        setError(mapper.oversized());
        setStatus('error');
        return;
      }

      setFile(file);
      setStatus('loading');
      setProgress({ done: 0, total: 0 });
      setError(null);
      setPages([]);
      setReport(null);

      try {
        await activeSession.open(await file.arrayBuffer(), (done, total) => {
          setProgress({ done, total });
        });
        setPages(activeSession.viewerPages);
        setReport(activeSession.qualityReport);
        setStatus('ready');
      } catch (caught) {
        setError(mapper.describe(caught));
        setStatus('error');
      }
    },
    [activeSession, guard, mapper],
  );

  const copyBlockAt = useCallback(
    (pageIndex: number, point: Point): Promise<CopyOutcome> =>
      activeSession.copyBlockAt(pageIndex, point),
    [activeSession],
  );

  const copySection = useCallback(
    (index: number): Promise<CopyOutcome> => activeSession.copySection(index),
    [activeSession],
  );

  const copyAll = useCallback((): Promise<CopyOutcome> => activeSession.copyAll(), [activeSession]);

  const copyText = useCallback(
    (text: string): Promise<CopyOutcome> => activeSession.copyText(text),
    [activeSession],
  );

  const sectionBlocks = useCallback(
    (index: number): readonly TextBlock[] => activeSession.sectionBlocks(index),
    [activeSession],
  );

  const sectionHeadingText = useCallback(
    (index: number): string | null => activeSession.sectionHeadingText(index),
    [activeSession],
  );

  return {
    status,
    progress,
    pages,
    report,
    outline: activeSession.outline,
    error,
    document: activeSession.documentProxy,
    file,
    sections: activeSession.sections,
    open,
    copyBlockAt,
    copySection,
    copyAll,
    copyText,
    sectionBlocks,
    sectionHeadingText,
  };
}
