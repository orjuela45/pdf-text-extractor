import { CopyFeedback } from './CopyFeedback';
import { Dropzone } from './Dropzone';
import { IntroSteps } from './IntroSteps';
import type { ExtractionStatus } from './models';
import type { CopyOutcome } from './models/copy';

export interface IntroPanelProps {
  readonly status: ExtractionStatus;
  readonly outcome: CopyOutcome;
  readonly onFile: (file: File) => void;
  readonly onDismissFeedback: () => void;
}

export function IntroPanel({ status, outcome, onFile, onDismissFeedback }: IntroPanelProps) {
  return (
    <section
      aria-label="Cómo funciona"
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-4"
    >
      <header className="text-center">
        <h1 className="font-serif text-3xl leading-tight font-medium text-on-surface">
          Texto de un PDF, con los espacios donde van
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          Cuando copiás texto de algunos PDFs, las palabras salen pegadas y hay que separarlas a
          mano. Acá el texto se rearma al cargar el archivo, así que al elegir un párrafo lo copiás
          ya corregido.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Todo pasa en tu navegador:{' '}
          <strong className="font-medium text-on-surface">
            el PDF nunca se sube a ningún servidor
          </strong>
          , no hay cuentas y no se guarda nada.
        </p>
      </header>

      <IntroSteps status={status} />

      <Dropzone onFile={onFile} disabled={status === 'loading'} />

      <CopyFeedback outcome={outcome} onDismiss={onDismissFeedback} />

      <ul className="mx-auto flex max-w-md flex-col gap-1.5 text-xs text-on-surface-variant">
        <li>· Clic sobre un párrafo del documento y lo copiás entero.</li>
        <li>· El panel izquierdo lista las secciones detectadas.</li>
        <li>· El panel derecho muestra el texto en plano o en Markdown.</li>
      </ul>
    </section>
  );
}
