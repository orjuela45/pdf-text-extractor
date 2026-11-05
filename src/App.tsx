import { useState } from 'react';
import { CopyFeedback } from './ui/CopyFeedback';
import { ErrorNotice } from './ui/ErrorNotice';
import { NoTextPanel } from './ui/NoTextPanel';
import { OutlinePanel } from './ui/OutlinePanel';
import { PDF_RENDER_SCALE } from './ui/constants';
import { Dropzone } from './ui/Dropzone';
import type { CopyOutcome, Point } from './ui/models';
import { PdfViewer } from './ui/PdfViewer';
import { ReportPanel } from './ui/ReportPanel';
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
    open,
    copyBlockAt,
    copySection,
    copyAll,
  } = usePdfDocument();
  const [feedback, setFeedback] = useState<CopyOutcome>(EMPTY_OUTCOME);

  const handleCopyAt = async (pageIndex: number, point: Point): Promise<void> => {
    setFeedback(await copyBlockAt(pageIndex, point));
  };

  const handleCopySection = async (index: number): Promise<void> => {
    setFeedback(await copySection(index));
  };

  const handleCopyAll = async (): Promise<void> => {
    setFeedback(await copyAll());
  };

  const hasText = report !== null && report.stats.fragments > 0;
  const showNoText = status === 'ready' && report !== null && !hasText;
  const showDocument = status === 'ready' && !showNoText;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h1 className="text-lg font-semibold tracking-tight">Extractor de texto PDF</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Los espacios entre palabras se corrigen al cargar el archivo, no al copiar.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <Dropzone onFile={(file) => void open(file)} disabled={status === 'loading'} />

        {status === 'loading' ? (
          <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
            {progress.total > 0
              ? `Extrayendo texto: ${progress.done} de ${progress.total} páginas…`
              : 'Leyendo el PDF…'}
          </p>
        ) : null}

        {error !== null ? <ErrorNotice error={error} /> : null}

        {report !== null && !showNoText ? <ReportPanel report={report} /> : null}

        <CopyFeedback outcome={feedback} onDismiss={() => setFeedback(EMPTY_OUTCOME)} />

        {showNoText ? <NoTextPanel /> : null}

        {showDocument ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hacé clic en un párrafo del documento para copiar su texto ya corregido.
          </p>
        ) : null}

        {showDocument ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <OutlinePanel
              entries={outline}
              onCopySection={(index) => void handleCopySection(index)}
              onCopyAll={() => void handleCopyAll()}
            />

            {pages.length > 0 && document !== null ? (
              <section aria-label="Documento">
                <PdfViewer
                  pages={pages}
                  document={document}
                  scale={PDF_RENDER_SCALE}
                  onCopyAt={(pageIndex, point) => void handleCopyAt(pageIndex, point)}
                />
              </section>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
