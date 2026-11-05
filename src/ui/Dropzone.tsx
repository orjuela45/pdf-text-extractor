import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

export interface DropzoneProps {
  readonly onFile: (file: File) => void;
  readonly disabled?: boolean;
}

export function Dropzone({ onFile, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!disabled && file !== undefined) {
      onFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];

    if (!disabled && file !== undefined) {
      onFile(file);
    }
  };

  return (
    <div
      role="region"
      aria-label="Zona para cargar el PDF"
      className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging
          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950'
          : 'border-slate-300 dark:border-slate-700'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Arrastrá un PDF acá o elegí un archivo.
      </p>
      <button
        type="button"
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Elegir PDF
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        aria-label="Elegir PDF"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
}
