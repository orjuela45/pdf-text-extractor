import { useMemo, useState } from 'react';
import { CopyFeedback } from './ui/CopyFeedback';
import { ErrorNotice } from './ui/ErrorNotice';
import { HeroPanel } from './ui/HeroPanel';
import { NoTextPanel } from './ui/NoTextPanel';
import { OutlinePanel } from './ui/OutlinePanel';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from './ui/constants';
import { DocumentTextWriter } from './ui/DocumentTextWriter';
import { ByteFormatter } from './ui/ByteFormatter';
import { Dropzone } from './ui/Dropzone';
import { TopBar } from './ui/TopBar';
import { TextPanel } from './ui/TextPanel';
import type { CopyOutcome, Point } from './ui/models';
import { PdfViewer } from './ui/PdfViewer';
import { usePdfDocument } from './ui/usePdfDocument';

const EMPTY_OUTCOME: CopyOutcome = { text: null, copied: false };

export function App() {
  const {
    status,
    progress,
    pages,
    report,
    outline,
    error,
    document,
    file,
    open,
    copyBlockAt,
    copySection,
    copyAll,
    copyText,
    sections,
    sectionHeadingBlock,
    sectionHeadingText,
  } = usePdfDocument();
  const [feedback, setFeedback] = useState<CopyOutcome>(EMPTY_OUTCOME);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const documentKey = file === null ? null : `${file.name}:${file.size}`;

  if (pageKey !== documentKey) {
    setPageKey(documentKey);
    setPage(1);
  }
  const writer = useMemo(() => new DocumentTextWriter(), []);

  const handleCopyAt = async (pageIndex: number, point: Point): Promise<void> => {
    setFeedback(await copyBlockAt(pageIndex, point));
  };

  const handleSelectSection = (index: number): void => {
    setActiveSection(activeSection === index ? null : index);
  };

  const handleCopySection = async (index: number): Promise<void> => {
    setFeedback(await copySection(index));
  };

  const handleCopyAll = async (): Promise<void> => {
    setFeedback(await copyAll());
  };

  const handleCopyText = async (text: string): Promise<void> => {
    setFeedback(await copyText(text));
  };

  const hasText = report !== null && report.stats.fragments > 0;
  const showNoText = status === 'ready' && report !== null && !hasText;
  const showDocument = status === 'ready' && !showNoText && pages.length > 0;
  const headingBlock = activeSection === null ? null : sectionHeadingBlock(activeSection);
  const highlighted = headingBlock === null ? [] : [headingBlock];

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-on-surface">
      <TopBar
        fileName={file?.name ?? null}
        fileSize={file === null ? null : new ByteFormatter().format(file.size)}
        page={page}
        pageCount={pages.length}
        zoom={zoom}
        onPageChange={setPage}
        onZoomChange={(next) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)))}
        onLoad={() => {
          const input = window.document.querySelector<HTMLInputElement>('input[type="file"]');

          input?.click();
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        {error !== null ? <ErrorNotice error={error} /> : null}

        {!showDocument ? <HeroPanel /> : null}

        <Dropzone onFile={(chosen) => void open(chosen)} disabled={status === 'loading'} />

        <CopyFeedback outcome={feedback} onDismiss={() => setFeedback(EMPTY_OUTCOME)} />

        {status === 'loading' ? (
          <p role="status" className="text-center text-sm text-on-surface-variant">
            {progress.total > 0
              ? `Extrayendo texto: ${progress.done} de ${progress.total} páginas…`
              : 'Leyendo el PDF…'}
          </p>
        ) : null}

        {showNoText ? <NoTextPanel /> : null}

        {showDocument && document !== null ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,22rem)]">
            <OutlinePanel
              entries={outline}
              report={report}
              activeIndex={activeSection}
              onSelectSection={handleSelectSection}
              onCopySection={(index) => void handleCopySection(index)}
              onCopyAll={() => void handleCopyAll()}
            />

            <section aria-label="Documento" className="min-h-0 overflow-auto">
              <PdfViewer
                pages={pages}
                document={document}
                scale={zoom}
                currentPage={page}
                highlighted={highlighted}
                highlightLabel={activeSection === null ? null : sectionHeadingText(activeSection)}
                onCopyAt={(pageIndex, point) => void handleCopyAt(pageIndex, point)}
              />
            </section>

            <TextPanel
              sections={sections}
              writer={writer}
              onCopy={(text) => void handleCopyText(text)}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
