import { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentTextWriter } from './DocumentTextWriter';
import { NO_STRUCTURE_NOTICE } from './constants';
import type { TextBlock, TextSection } from '../core/models';
import type { TextView } from './models/view';

export interface TextPanelProps {
  readonly sections: readonly TextSection[];
  readonly onCopy: (text: string) => void;
  readonly writer?: DocumentTextWriter;
  readonly activeBlock?: TextBlock | null;
  readonly scrollTarget?: number | null;
  readonly onScrollHandled?: () => void;
}

const FOCUS_STYLE =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

export function TextPanel({
  sections,
  onCopy,
  writer = new DocumentTextWriter(),
  activeBlock = null,
  scrollTarget = null,
  onScrollHandled,
}: TextPanelProps) {
  const [view, setView] = useState<TextView>('plain');
  const scroller = useRef<HTMLDivElement>(null);

  const text = useMemo(() => writer.view(sections, view), [writer, sections, view]);
  const words = useMemo(() => writer.words(text), [writer, text]);
  const hasStructure = sections.some((section) => section.heading !== null);
  const parts = useMemo(() => writer.parts(sections, view), [writer, sections, view]);

  useEffect(() => {
    if (scrollTarget === null || scroller.current === null || activeBlock === null) {
      return;
    }

    const target = scroller.current.querySelector(`[data-block-anchor="${scrollTarget}"]`);

    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    onScrollHandled?.();
  }, [activeBlock, onScrollHandled, scrollTarget]);

  return (
    <section
      aria-label="Texto extraído"
      className="glass flex h-full flex-col rounded-lg shadow-glass"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/60 px-4 py-3">
        <h2 className="font-sans text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
          Texto extraído
        </h2>
        <div
          role="tablist"
          aria-label="Formato del texto"
          className="glass-bar flex rounded-md p-0.5 text-xs"
        >
          {(['plain', 'markdown'] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={view === candidate}
              className={`rounded px-2.5 py-1 transition-colors ${FOCUS_STYLE} ${
                view === candidate
                  ? 'bg-primary-container text-on-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setView(candidate)}
            >
              {candidate === 'plain' ? 'Plano' : 'Markdown'}
            </button>
          ))}
        </div>
      </header>

      <div className="flex items-center justify-between px-4 pt-3 text-xs text-on-surface-variant">
        <span>{sections.length === 1 ? '1 sección' : `${sections.length} secciones`}</span>
        <span aria-live="polite">{words === 1 ? '1 palabra' : `${words} palabras`}</span>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-auto px-4 py-3">
        {view === 'markdown' && !hasStructure && text !== '' ? (
          <p className="mb-3 rounded-md bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
            {NO_STRUCTURE_NOTICE}
          </p>
        ) : null}
        {text === '' ? (
          <p className="text-sm text-on-surface-variant">Todavía no hay texto extraído.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {parts.map((part, index) => (
              <p
                key={index}
                data-block-anchor={index}
                className={`rounded px-1 font-serif text-sm leading-relaxed whitespace-pre-wrap transition-colors ${
                  part.block !== null && part.block === activeBlock
                    ? 'bg-secondary-container/60 text-on-surface ring-2 ring-primary-container/40'
                    : 'text-on-surface'
                }`}
              >
                {part.text}
              </p>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-outline-variant/60 p-3">
        <button
          type="button"
          className={`w-full rounded-md bg-primary-container px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary ${FOCUS_STYLE}`}
          onClick={() => onCopy(text)}
        >
          Copiar texto
        </button>
      </footer>
    </section>
  );
}
