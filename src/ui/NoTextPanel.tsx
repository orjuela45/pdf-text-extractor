export function NoTextPanel() {
  return (
    <section
      aria-label="Sin texto extraíble"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950"
    >
      <h2 className="mb-2 text-base font-semibold text-amber-800 dark:text-amber-300">
        Este PDF no tiene texto extraíble
      </h2>
      <p className="text-amber-800 dark:text-amber-300">
        Parece un documento escaneado o compuesto solo por imágenes. Esta herramienta no hace OCR,
        así que no hay texto para mostrar ni copiar.
      </p>
    </section>
  );
}
