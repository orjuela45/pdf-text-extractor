import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CopyFeedback } from './ui/CopyFeedback';
import { ErrorNotice } from './ui/ErrorNotice';
import { HeroPanel } from './ui/HeroPanel';
import { NoTextPanel } from './ui/NoTextPanel';
import { OutlinePanel } from './ui/OutlinePanel';
import { DEFAULT_ZOOM, COPY_CONFIRMATION_MILLISECONDS, MAX_ZOOM, MIN_ZOOM } from './ui/constants';
import { DocumentTextWriter } from './ui/DocumentTextWriter';
import { ByteFormatter } from './ui/ByteFormatter';
import { Dropzone } from './ui/Dropzone';
import { TopBar } from './ui/TopBar';
import { TextPanel } from './ui/TextPanel';
import type { CopyOutcome, DocumentMode, Point } from './ui/models';
import { PdfViewer } from './ui/PdfViewer';
import { usePdfDocument } from './ui/usePdfDocument';

const EMPTY_OUTCOME: CopyOutcome = { text: null, copied: false };

export function App() {
  const {
    status,
    progress,
    pages,
    report,
    error,
    document,
    file,
    open,
    copyBlockAt,
    copyAll,
    copyText,
    sections,
    outlineFor,
    outlineBlock,
    copyOutlineBlock,
    copyOutlineBlockInDocument,
    pageOfBlock,
    documentOutline,
  } = usePdfDocument();
  const [feedback, setFeedback] = useState<CopyOutcome>(EMPTY_OUTCOME);
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [scrollTarget, setScrollTarget] = useState<number | null>(null);
  const [mode, setMode] = useState<DocumentMode>('document');
  const viewerRef = useRef<HTMLElement>(null);
  const documentKey = file === null ? null : `${file.name}:${file.size}`;

  if (pageKey !== documentKey) {
    setPageKey(documentKey);
    setPage(1);
    setActiveSection(null);
    setMode('document');
  }
  const writer = useMemo(() => new DocumentTextWriter(), []);

  const showCopyOutcome = useCallback((outcome: CopyOutcome): void => {
    if (outcome.copied) {
      setFeedback(EMPTY_OUTCOME);
      setCopyConfirmed(true);

      if (confirmationTimer.current !== null) {
        clearTimeout(confirmationTimer.current);
      }

      confirmationTimer.current = setTimeout(() => {
        setCopyConfirmed(false);
        confirmationTimer.current = null;
      }, COPY_CONFIRMATION_MILLISECONDS);

      return;
    }

    setCopyConfirmed(false);
    setFeedback(outcome);
  }, []);

  useEffect(
    () => () => {
      if (confirmationTimer.current !== null) {
        clearTimeout(confirmationTimer.current);
      }
    },
    [],
  );

  const handleCopyAt = async (pageIndex: number, point: Point): Promise<void> => {
    showCopyOutcome(await copyBlockAt(pageIndex, point));
  };

  const handleSelectBlock = (index: number): void => {
    const next = activeSection === index ? null : index;

    setActiveSection(next);
    setScrollTarget(next === null ? null : index);
  };

  const handleCopyBlock = async (index: number): Promise<void> => {
    showCopyOutcome(
      mode === 'document'
        ? await copyOutlineBlockInDocument(index)
        : await copyOutlineBlock(page - 1, index),
    );
  };

  const handleCopyAll = async (): Promise<void> => {
    showCopyOutcome(await copyAll());
  };

  const handleCopyText = async (text: string): Promise<void> => {
    showCopyOutcome(await copyText(text));
  };

  const hasText = report !== null && report.stats.fragments > 0;
  const showNoText = status === 'ready' && report !== null && !hasText;
  const showDocument = status === 'ready' && !showNoText && pages.length > 0;
  const outline = showDocument && mode === 'document' ? documentOutline : outlineFor(page - 1);
  const activeBlock =
    activeSection === null
      ? null
      : mode === 'document'
        ? (documentOutline[activeSection]?.block ?? null)
        : outlineBlock(page - 1, activeSection);
  const highlighted = activeBlock === null ? [] : [activeBlock];
  const targetPage = activeBlock === null ? null : pageOfBlock(activeBlock);

  useEffect(() => {
    if (mode !== 'document' || targetPage === null || viewerRef.current === null) {
      return;
    }

    viewerRef.current
      .querySelector(`[data-page-anchor="${targetPage}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeBlock, mode, targetPage]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface text-on-surface">
      <TopBar
        fileName={file?.name ?? null}
        fileSize={file === null ? null : new ByteFormatter().format(file.size)}
        page={page}
        pageCount={pages.length}
        zoom={zoom}
        copyConfirmed={copyConfirmed}
        onPageChange={setPage}
        onZoomChange={(next) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)))}
        onFile={(chosen) => void open(chosen)}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {showDocument && document !== null ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,22rem)]">
            <OutlinePanel
              entries={outline}
              report={report}
              activeIndex={activeSection}
              mode={mode}
              onModeChange={setMode}
              onSelectBlock={handleSelectBlock}
              onCopyBlock={(index) => void handleCopyBlock(index)}
              onCopyAll={() => void handleCopyAll()}
            />

            <section ref={viewerRef} aria-label="Documento" className="min-h-0 overflow-auto">
              <PdfViewer
                pages={pages}
                document={document}
                scale={zoom}
                currentPage={page}
                showAllPages={mode === 'document'}
                highlighted={highlighted}
                highlightLabel={
                  activeBlock === null ? null : (outline[activeSection ?? 0]?.text ?? null)
                }
                onCopyAt={(pageIndex, point) => void handleCopyAt(pageIndex, point)}
              />
            </section>

            <TextPanel
              sections={sections}
              writer={writer}
              activeBlock={activeBlock}
              scrollTarget={scrollTarget}
              onScrollHandled={() => setScrollTarget(null)}
              onCopy={(text) => void handleCopyText(text)}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
            {!showDocument ? <HeroPanel /> : null}

            {error !== null ? <ErrorNotice error={error} /> : null}

            {!showDocument && status !== 'loading' ? (
              <Dropzone onFile={(chosen) => void open(chosen)} />
            ) : null}

            {status === 'loading' ? (
              <p role="status" className="text-center text-sm text-on-surface-variant">
                {progress.total > 0
                  ? `Extrayendo texto: ${progress.done} de ${progress.total} páginas…`
                  : 'Leyendo el PDF…'}
              </p>
            ) : null}

            {showNoText ? <NoTextPanel /> : null}
          </div>
        )}

        <CopyFeedback outcome={feedback} onDismiss={() => setFeedback(EMPTY_OUTCOME)} />
      </main>
    </div>
  );
}
