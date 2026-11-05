import { useState } from 'react';
import { OUTLINE_INDENT_REM } from './constants';
import type { OutlineEntry } from './models';

export interface OutlinePanelProps {
  readonly entries: readonly OutlineEntry[];
  readonly onCopySection: (index: number) => void;
  readonly onCopyAll: () => void;
}

const FOCUS_STYLE =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400';

export function OutlinePanel({ entries, onCopySection, onCopyAll }: OutlinePanelProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());

  const toggle = (index: number): void => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  return (
    <aside
      aria-label="Esquema del documento"
      className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Esquema del documento</h2>
        <button
          type="button"
          className={`rounded-lg bg-sky-600 px-3 py-1.5 font-medium text-white hover:bg-sky-700 ${FOCUS_STYLE}`}
          onClick={onCopyAll}
        >
          Copiar todo el documento
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No se detectaron secciones.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {entries.map((entry) => {
            const isExpanded = expanded.has(entry.index);
            const contentId = `seccion-${entry.index}`;

            return (
              <li
                key={entry.index}
                style={{ paddingInlineStart: `${entry.level * OUTLINE_INDENT_REM}rem` }}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  className={`flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${FOCUS_STYLE}`}
                  onClick={() => toggle(entry.index)}
                >
                  <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
                  <span className="font-medium">{entry.heading}</span>
                </button>

                {isExpanded ? (
                  <div id={contentId} className="mt-1 flex flex-col gap-2 px-2 pb-2">
                    <p className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-slate-600 dark:text-slate-300">
                      {entry.text}
                    </p>
                    <button
                      type="button"
                      className={`self-start rounded-lg border border-sky-600 px-3 py-1 font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-400 dark:text-sky-300 dark:hover:bg-sky-950 ${FOCUS_STYLE}`}
                      onClick={() => onCopySection(entry.index)}
                    >
                      {`Copiar sección: ${entry.heading}`}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
