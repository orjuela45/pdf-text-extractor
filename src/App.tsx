export function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h1 className="text-lg font-semibold tracking-tight">Extractor de texto PDF</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Los espacios entre palabras se corrigen al cargar el archivo, no al copiar.
        </p>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <p className="max-w-prose text-center text-sm text-slate-500 dark:text-slate-400">
          Todavía no hay ninguna forma de cargar un PDF: eso llega en la fase de interfaz.
        </p>
      </main>
    </div>
  );
}
