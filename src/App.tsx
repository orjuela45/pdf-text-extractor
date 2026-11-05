import { useState } from 'react';
import { CopyFeedback } from './ui/CopyFeedback';
import { PDF_RENDER_SCALE } from './ui/constants';
import { Dropzone } from './ui/Dropzone';
import type { CopyOutcome, Point } from './ui/models';
import { PdfViewer } from './ui/PdfViewer';
import { ReportPanel } from './ui/ReportPanel';
import { usePdfDocument } from './ui/usePdfDocument';

const EMPTY_OUTCOME: CopyOutcome = { text: null, copied: false };

export function App() {
  const { status, progress, pages, report, document, open, copyBlockAt } = usePdfDocument();
  const [feedback, setFeedback] = useState<CopyOutcome>(EMPTY_OUTCOME);

  const handleCopyAt = async (pageIndex: number, point: Point): Promise<void> => {
    setFeedback(await copyBlockAt(pageIndex, point));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h1 className="text-lg font-semibold tracking-tight">Extractor de texto PDF</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Los espacios entre palabras se corrigen al cargar el archivo, no al copiar.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <Dropzone onFile={(file) => void open(file)} disabled={status === 'loading'} />

        {status === 'loading' ? (
          <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
            {progress.total > 0
              ? `Extrayendo texto: ${progress.done} de ${progress.total} páginas…`
              : 'Leyendo el PDF…'}
          </p>
        ) : null}

        {status === 'error' ? (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">
            No se pudo leer el PDF. Verificá que el archivo no esté dañado ni protegido con
            contraseña.
          </p>
        ) : null}

        {report !== null ? <ReportPanel report={report} /> : null}
        <CopyFeedback outcome={feedback} onDismiss={() => setFeedback(EMPTY_OUTCOME)} />

        {status === 'ready' ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hacé clic en un párrafo del documento para copiar su texto ya corregido.
          </p>
        ) : null}

        {status === 'ready' && pages.length > 0 ? (
          <PdfViewer
            pages={pages}
            document={document}
            scale={PDF_RENDER_SCALE}
            onCopyAt={(pageIndex, point) => void handleCopyAt(pageIndex, point)}
          />
        ) : null}
      </main>
    </div>
  );
}
