import type { QualityReport } from '../core/models';

export interface ReportPanelProps {
  readonly report: QualityReport;
}

export function ReportPanel({ report }: ReportPanelProps) {
  const { pagesWithoutText, stats } = report;
  const emptyPages = pagesWithoutText.map((pageIndex) => pageIndex + 1).join(', ');

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-base font-semibold">Resultado de la extracción</h2>

      {pagesWithoutText.length > 0 ? (
        <p role="alert" className="mb-2 text-amber-700 dark:text-amber-400">
          {`Este PDF tiene ${pagesWithoutText.length} página(s) sin texto extraíble (${emptyPages}). Si está escaneado, el texto tendrá que salir de un OCR.`}
        </p>
      ) : (
        <p className="mb-2 text-emerald-700 dark:text-emerald-400">
          Se encontró texto en todas las páginas.
        </p>
      )}

      <p className="text-slate-500 dark:text-slate-400">
        {`${stats.characters} caracteres, ${stats.blocks} párrafos, ${stats.sections} secciones y ${stats.pages} páginas.`}
      </p>
    </section>
  );
}
