import { useRef, type ChangeEvent } from 'react';
import { COPY_CONFIRMATION_LABEL, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from './constants';

export interface TopBarProps {
  readonly fileName: string | null;
  readonly fileSize: string | null;
  readonly page: number;
  readonly pageCount: number;
  readonly zoom: number;
  readonly copyConfirmed?: boolean;
  readonly onPageChange: (page: number) => void;
  readonly onZoomChange: (zoom: number) => void;
  readonly onFile: (file: File) => void;
}

const FOCUS_STYLE =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

const ICON_BUTTON = `grid h-8 w-8 place-items-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container ${FOCUS_STYLE}`;

export function TopBar({
  fileName,
  fileSize,
  page,
  pageCount,
  zoom,
  copyConfirmed = false,
  onPageChange,
  onZoomChange,
  onFile,
}: TopBarProps) {
  const hasDocument = pageCount > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file !== undefined) {
      onFile(file);
    }
  };

  return (
    <header className="glass-bar flex flex-wrap items-center gap-3 border-b border-outline-variant/60 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-md bg-primary-container font-serif text-on-primary"
        >
          ¶
        </span>
        <span className="font-sans text-sm font-semibold tracking-tight">
          Extractor de texto PDF
        </span>
      </div>

      {hasDocument ? (
        <div className="glass flex min-w-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs">
          <span aria-hidden="true" className="text-on-surface-variant">
            ▤
          </span>
          <span className="truncate font-medium" title={fileName ?? ''}>
            {fileName}
          </span>
          {fileSize !== null ? (
            <>
              <span aria-hidden="true" className="text-outline">
                •
              </span>
              <span className="text-on-surface-variant">{fileSize}</span>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {copyConfirmed ? (
          <span
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 rounded-full bg-primary-container/15 px-2.5 py-1 text-xs font-medium text-primary"
          >
            <span aria-hidden="true">✓</span>
            {COPY_CONFIRMATION_LABEL}
          </span>
        ) : null}

        {hasDocument ? (
          <>
            <nav
              aria-label="Paginación"
              className="glass-bar flex items-center gap-1 rounded-md p-0.5"
            >
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                ‹
              </button>
              <span className="px-1 text-xs whitespace-nowrap">
                Pág. {page} de {pageCount}
              </span>
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label="Página siguiente"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                ›
              </button>
            </nav>

            <div aria-label="Zoom" className="glass-bar flex items-center gap-1 rounded-md p-0.5">
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label="Reducir"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => onZoomChange(zoom - ZOOM_STEP)}
              >
                −
              </button>
              <span className="px-1 text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label="Ampliar"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => onZoomChange(zoom + ZOOM_STEP)}
              >
                +
              </button>
            </div>
          </>
        ) : null}

        <button
          type="button"
          className={`rounded-md bg-primary px-3.5 py-2 text-xs font-medium text-on-primary transition-colors hover:bg-primary-container ${FOCUS_STYLE}`}
          onClick={() => inputRef.current?.click()}
        >
          Cargar PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          aria-label="Cargar PDF"
          onChange={handleChange}
        />
      </div>
    </header>
  );
}
