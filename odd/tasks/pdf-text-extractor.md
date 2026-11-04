# pdf-text-extractor

Greenfield client-side web app: upload a PDF, reconstruct its text with correct word
spacing from glyph geometry, then copy any paragraph or section already fixed.
Status: planning — 0 of 13 tasks closed.

## Specs

- **S1** Upload a PDF file. Verbatim: *"se suba un pdf"*.
- **S2** Extract the text of paragraphs or of a given section. Verbatim: *"este pueda extraer los textos de los parrafos o de alguna seccion"*.
- **S3** Fix joined words at load time, not at copy time. Verbatim: *"hay algunos pdfs que al copiar un texto y pasarlos a otro lado pone algunas palabras juntas y toca manualmente separarlas"* / *"se habra hecho la correcion del texto al cargar el pdf"*.
- **S4** Selecting a paragraph on the rendered PDF copies the already-corrected text. Verbatim: *"al seleccionar el parrafo o texto a extraer ya se corrige ... la seleccion del texto solo carga lo ya convertido"*.
- **S5** Side panel with the whole document structured in sections, with per-section copy. Source: scope decision L2.
- **S6** 100% client-side, no backend; the PDF never leaves the machine. Verbatim: *"no se si es necesario tener backend pero si consideras que si hagamosle"* → decided no (L2).
- **S7** Deploy as a static site on Netlify, published under the user's existing custom domain alongside the portfolio. Source: deploy decision L2.
- **S8** It is an online page, usable in a browser. Verbatim: *"esto puede ser una pagina online"*.

Non-goals (explicit): OCR of scanned/image-only PDFs, user accounts, persisted libraries,
free-rectangle drag selection. Recorded in L2/L3 as deferred.

## Tasks

| ID | Task | Specs | Phase | Route |
| --- | --- | --- | --- | --- |
| T1 | Project foundation: `git init`, Vite + React + TS, Tailwind, Vitest, ESLint/Prettier, folder skeleton | S6, S8 | F0 Foundations | inline |
| T2 | Domain model + pdf.js loader: `src/core/model.ts`, `src/core/pdf/open.ts` (ArrayBuffer → pages → fragments with transform/width) | S1, S6 | F1 Core | inline, test-first |
| T3 | Fragment → line grouping: `src/core/layout/lines.ts` (baseline clustering by y, tolerance from font height, sort by x) | S3 | F1 Core | inline, test-first |
| T4 | Text assembly: `src/core/text/assemble.ts` + `src/core/text/normalize.ts` (gap rule, ligatures, soft hyphen, NBSP) | S3 | F1 Core | inline, test-first |
| T5 | Line → block → section grouping: `src/core/layout/blocks.ts` (vertical gap, indentation, heading heuristic) | S2, S5 | F1 Core | inline, test-first |
| T6 | Fixture corpus: `tests/scripts/make-fixtures.ts` (pdf-lib, deterministic) + small real PDFs; end-to-end reconstruction tests | S3 | F1 Core | inline |
| T7 | Extraction quality report: `src/core/report.ts` (pages without text layer, suspicious joins, stats) | S3 | F1 Core | inline |
| T8 | PDF viewer UI: `src/ui/Dropzone.tsx`, `src/ui/PdfViewer.tsx`, `src/ui/usePdfDocument.ts` (drag&drop, canvas render, text layer, progress) | S1 | F2 Interface | inline |
| T9 | Click-to-copy: hit-test the block under the cursor, write to clipboard, feedback | S4 | F2 Interface | inline |
| T10 | Structured side panel: `src/ui/OutlinePanel.tsx` (outline, copy per section, copy all) | S5 | F2 Interface | inline |
| T11 | Error and edge states: encrypted PDF, no text layer, oversized file, worker failure, responsive + keyboard/a11y | S1, S8 | F3 Robustness | inline |
| T12 | Delivery: `netlify.toml`, production build check, custom-domain deploy guide for the existing portfolio domain | S7 | F4 Delivery | inline |
| T13 | Verification pass: verdict per S# on S1-S8, full suite, coverage of `src/core` | all | F4 Delivery | independent verify |

## Log

**L1** (user request, verbatim):
> tengo la idea de crear una aplicacion en la cual se suba un pdf y este pueda extraer los textos de los parrafos o de alguna seccion, esto debido a que hay algunos pdfs que al copiar un texto y pasarlos a otro lado pone algunas palabras juntas y toca manualmente separarlas, entonces al seleccionar el parrafo o texto a extraer ya se corrige porque se habra hecho la correcion del texto al cargar el pdf y la seleccion del texto solo carga lo ya convertido. Al ser un proyecto de 0 quiero que usemos el mejor flujo de buenas practicas de gentel ai que tienes configurado y crear las tareas, test, fases, arquitectura y de ultimas despliegues, esto puede ser una pagina online, no se si es necesario tener backend pero si consideras que si hagamosle

**L2** (decisions, from the scoping question):
- Scope: click on paragraph/block **and** structured side panel with the whole document. Free-rectangle
  drag selection deferred (non-goal, not discarded forever).
- Backend: **none**. pdf.js runs in the browser; static page; PDF never uploaded.
- Deploy: **Netlify**, on the user's own domain, which already hosts the portfolio as a separate
  Netlify site. Full DNS/domain guide belongs to T12.

**L3** (deferred, recorded as non-goals): OCR of scanned PDFs (would need a backend or
`tesseract.js` in-browser, ~15MB of models); user accounts; persisted libraries.

**L4** (harness defaults applied): generated technical artifacts — code, comments, identifiers,
filenames, commit messages, repo docs — are written in English. Specs and this Log keep the user's
verbatim strings.

**L5** (user instruction, verbatim): *"iniciemos y en español la ui, y asocia de una vez mi cuenta de github, no se si este"*
- Authorized: start the work, `git init`, and one work-unit commit per task. Push, PR creation and
  merge are still the user's decision, not authorized here.
- UI copy language: **Spanish**. This overrides the English default recorded in L4 for user-facing
  strings only; code, identifiers and commit messages stay in English.
- GitHub account associated: `orjuela45`. Verified two ways — `gh` CLI authenticated (token scopes
  `gist`, `read:org`, `repo`, HTTPS protocol) and SSH key `~/.ssh/id_ed25519` handshaking as
  `orjuela45`. `gh auth setup-git` installed the credential helper for `github.com`.
- Repo visibility is not yet decided; no remote has been created.
