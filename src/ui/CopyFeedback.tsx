import { useEffect, useRef } from 'react';
import { COPY_FAILURE_MESSAGE, COPY_FALLBACK_HINT } from './constants';
import type { CopyOutcome } from './models';

export interface CopyFeedbackProps {
  readonly outcome: CopyOutcome;
  readonly onDismiss: () => void;
}

export function CopyFeedback({ outcome, onDismiss }: CopyFeedbackProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!outcome.copied && outcome.text !== null) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [outcome]);

  if (outcome.text === null || outcome.copied) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-outline-variant/70 bg-surface shadow-glass p-3 text-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-on-surface">{COPY_FAILURE_MESSAGE}</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">{COPY_FALLBACK_HINT}</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          className="shrink-0 rounded-md px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container"
          onClick={onDismiss}
        >
          Cerrar
        </button>
      </div>
      <textarea
        ref={textareaRef}
        readOnly
        aria-label="Texto copiado a mano"
        value={outcome.text}
        className="mt-2 h-20 w-full resize-y rounded-md border border-outline-variant/70 bg-surface-lowest p-2 font-serif text-xs text-on-surface"
        onFocus={(event) => event.currentTarget.select()}
      />
    </div>
  );
}
