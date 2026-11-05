import { useEffect, useRef } from 'react';
import type { CopyOutcome } from './models';

export interface CopyFeedbackProps {
  readonly outcome: CopyOutcome;
  readonly onDismiss: () => void;
}

export function CopyFeedback({ outcome, onDismiss }: CopyFeedbackProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!outcome.copied && outcome.text !== null) {
      textareaRef.current?.select();
    }
  }, [outcome]);

  if (outcome.text === null) {
    return null;
  }

  if (outcome.copied) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950"
      >
        <p className="mb-1 font-medium text-emerald-800 dark:text-emerald-300">
          Párrafo copiado al portapapeles:
        </p>
        <p className="max-h-32 overflow-auto whitespace-pre-wrap text-slate-700 dark:text-slate-200">
          {outcome.text}
        </p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950"
    >
      <p className="mb-2 font-medium text-amber-800 dark:text-amber-300">
        No se pudo copiar automáticamente. Copiá el texto de este cuadro:
      </p>
      <textarea
        ref={textareaRef}
        readOnly
        value={outcome.text}
        className="h-24 w-full resize-y rounded-lg border border-amber-300 bg-white p-2 text-slate-800 dark:border-amber-800 dark:bg-slate-900 dark:text-slate-100"
        onFocus={(event) => event.currentTarget.select()}
      />
      <button
        type="button"
        className="mt-2 rounded-lg border border-amber-300 px-3 py-1 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900"
        onClick={onDismiss}
      >
        Cerrar
      </button>
    </div>
  );
}
