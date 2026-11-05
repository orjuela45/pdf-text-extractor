import type { PdfErrorState } from './models';

export interface ErrorNoticeProps {
  readonly error: PdfErrorState;
}

export function ErrorNotice({ error }: ErrorNoticeProps) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
    >
      {error.message}
    </p>
  );
}
