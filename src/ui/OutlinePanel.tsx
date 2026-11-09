import { useState } from 'react';
import type { QualityReport } from '../core/models';
import type { DocumentMode, OutlineEntry } from './models';

export interface OutlinePanelProps {
  readonly entries: readonly OutlineEntry[];
  readonly report?: QualityReport | null;
  readonly activeIndex?: number | null;
  readonly mode?: DocumentMode;
  readonly onModeChange?: (mode: DocumentMode) => void;
  readonly onSelectBlock: (index: number) => void;
  readonly onCopyBlock: (index: number) => void;
  readonly onCopyAll: () => void;
}

const FOCUS_STYLE =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

export function OutlinePanel({
  entries,
  report = null,
  activeIndex = null,
  mode = 'page',
  onModeChange,
  onSelectBlock,
  onCopyBlock,
  onCopyAll,
}: OutlinePanelProps) {
  const [ownActive, setOwnActive] = useState<number | null>(null);
  const active = activeIndex ?? ownActive;

  const pagesWithoutText = report?.pagesWithoutText ?? [];

  return (
    <aside
      aria-label="Bloques de la página"
      className="glass flex h-full min-h-0 flex-col rounded-lg shadow-glass"
    >
      <header className="border-b border-outline-variant/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
            Bloques de la página
          </h2>
          <span className="rounded-full bg-secondary-container/70 px-2 py-0.5 text-[0.6875rem] text-on-secondary-container">
            {entries.length === 1 ? '1' : entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-on-surface-variant">Seleccioná para inspeccionar</p>
        <div
          role="tablist"
          aria-label="Alcance de los bloques"
          className="glass-bar mt-2 flex rounded-md p-0.5 text-xs"
        >
          {(['document', 'page'] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={mode === candidate}
              className={`flex-1 rounded px-2 py-1 transition-colors ${FOCUS_STYLE} ${
                mode === candidate
                  ? 'bg-primary-container text-on-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => onModeChange?.(candidate)}
            >
              {candidate === 'document' ? 'Todo' : 'Página'}
            </button>
          ))}
        </div>
      </header>

      {pagesWithoutText.length > 0 ? (
        <p
          role="status"
          className="mx-4 mt-3 rounded-md bg-error-container px-3 py-2 text-xs text-on-error-container"
        >
          {pagesWithoutText.length === 1
            ? `La página ${pagesWithoutText[0]! + 1} no tiene texto extraíble. Puede ser un escaneo.`
            : `${pagesWithoutText.length} páginas no tienen texto extraíble. Pueden ser escaneos.`}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {entries.length === 0 ? (
          <p className="px-1 py-2 text-sm text-on-surface-variant">
            No se detectaron bloques en esta página.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {entries.map((entry) => {
              const isActive = active === entry.index;

              return (
                <li key={entry.index}>
                  <div
                    className={`rounded-lg border transition-colors duration-150 ${
                      isActive
                        ? 'border-primary-container bg-secondary-container/60 ring-2 ring-primary-container/40'
                        : 'border-outline-variant/70 bg-surface-lowest/80 hover:border-primary-container/60'
                    }`}
                  >
                    <button
                      type="button"
                      aria-current={isActive ? 'true' : undefined}
                      data-block-index={entry.index}
                      className={`w-full rounded-t-lg p-3 text-left ${FOCUS_STYLE}`}
                      onClick={() => {
                        setOwnActive(isActive ? null : entry.index);
                        onSelectBlock(entry.index);
                      }}
                    >
                      <span className="flex items-start justify-between gap-2">
                        {' '}
                        <span
                          data-testid="block-card-text"
                          title={entry.text.replace(/\s+/g, ' ')}
                          className={`line-clamp-3 font-serif text-sm leading-snug font-medium ${isActive ? 'text-primary' : 'text-on-surface'}`}
                        >
                          {entry.text}
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          {isActive ? (
                            <span className="rounded-full bg-primary-container px-2 py-0.5 text-[0.6875rem] font-medium text-on-primary">
                              Seleccionado
                            </span>
                          ) : null}
                          <span className="rounded-full bg-surface-container px-2 py-0.5 text-[0.6875rem] text-on-surface-variant">
                            Pág. {entry.page}
                          </span>
                        </span>
                      </span>
                    </button>
                    <div className="flex justify-end px-3 pb-2">
                      <button
                        type="button"
                        aria-label={`Copiar el bloque: ${entry.text}`}
                        className={`rounded border border-outline-variant/70 px-2 py-1 text-[0.6875rem] text-on-surface-variant transition-colors hover:border-primary-container hover:text-primary ${FOCUS_STYLE}`}
                        onClick={() => onCopyBlock(entry.index)}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <footer className="border-t border-outline-variant/60 p-3">
        <button
          type="button"
          className={`w-full rounded-md bg-primary-container px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary ${FOCUS_STYLE}`}
          onClick={onCopyAll}
        >
          Copiar todo el documento
        </button>
      </footer>
    </aside>
  );
}
