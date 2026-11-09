# pdf-text-extractor

Greenfield client-side web app: upload a PDF, reconstruct its text with correct word
spacing from glyph geometry, then copy any paragraph or section already fixed.
Status: active — see `## Log`; F8 Feedback in progress (T34 closed in L50, T35 next).

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
| T14 | **Blocker.** Reading order for multi-column pages: cluster lines by column before/within baselines so two aligned columns stop interleaving. Regression probe exists (left-column click must not copy the right column) | S2, S4 | F5 Fixes | inline or writer, test-first |
| T15 | **Blocker.** Dehyphenation must distinguish a hyphenated line break from a real compound hyphen, so `franco-` + `aleman` yields `franco-aleman` and not `francoaleman` | S3 | F5 Fixes | inline or writer, test-first |
| T16 | Fix the hollow test in `tests/PdfDocumentLoader.test.ts` (asserts non-emptiness instead of the bundled worker URL) and pin the two surviving boundary mutations: `BlockBuilder` gap `>` and `BlockHitTester` bottom edge | S3 | F5 Fixes | inline |
| T17 | Verify the security headers for real: the browser check runs its own static server and never applies the CSP, so either make it apply them or record the headers as verified only on deploy | S7 | F5 Fixes | inline |
| T18 | Correct `README.md`: it states the suspicious-join signal needs a content scale "above about 2" and it fires near 1.1; also state plainly that the coverage number covers `src/core` only and excludes `src/ui` | S3, S8 | F5 Fixes | inline |
| T19 | Independent verification of T14, T15, T16 and T17 | all | F5 Fixes | verify |
| T20 | **Adopt the design system.** `DESIGN.md` defines *Serene Editorial Glass*: sage/slate palette, Newsreader + Manrope, glass surfaces, elevation, shapes, and component specs for buttons, chips, inputs, cards and floating viewer controls. Replace the ad-hoc Tailwind values with those tokens | S8, S9 | F6 Design | writer |
| T21 | **Three-panel layout.** Left panel of section cards with a text preview and page number, centre viewer, right panel of extracted text. Top bar with file name, file size, `Pag. n de m`, zoom and the load button. The current dropzone and outline panel are absorbed into it | S1, S5, S8, S9 | F6 Design | writer |
| T22 | **Plain / Markdown views of the extracted text**, with a word count. Markdown is new behaviour, not a style: headings, paragraphs and lists have to be emitted from the existing block and section models | S5, S9 | F6 Design | writer |
| T23 | **Active-section highlight on the real PDF.** Clicking a section card highlights that section's geometry on the canvas with a floating label. Same machinery as click-to-copy: `SectionBuilder` blocks in PDF user space mapped through `CoordinateMapper`. The mockup draws this over simulated HTML, so it has to be built over the real canvas | S2, S4, S5, S9 | F6 Design | writer |
| T24 | Verify the redesign: three panels at narrow widths, keyboard reachable, contrast holds, and the browser check still passes under the CSP with the new layout | S8, S9 | F6 Design | verify |
| T25 | **Fix the StrictMode render race first.** In `pnpm dev` the effect runs twice, pdf.js refuses two renders on one canvas, and the viewer sticks on "Preparando la página…". **Blocks every other welcome task**, because it is why nothing renders in development | S1 | F7 Welcome | inline, test-first |
| T26 | Hero and welcome screen: badge, serif headline, subhead, three feature chips, and the honest copy that replaces the mockup's claims | S8, S10 | F7 Welcome | writer |
| T27 | Dropzone card: drag target, the accepted formats and the **real** size limit, a primary file action and a secondary "open a sample" action that ships a real sample PDF in the app | S1, S10 | F7 Welcome | writer |
| T28 | **Live three-panel flow, driven by real state**: process state with real progress, the real canvas of the page being read, and the real sections and Markdown produced. This is the step animation, made honest | S2, S5, S10 | F7 Welcome | writer |
| T29 | Three pillars, privacy banner and footer with the navigation row, all with truthful copy | S8, S10 | F7 Welcome | writer |
| T30 | Remove the dropzone once a document is loaded, since the top bar already offers "Cargar PDF". — **closed in L54, together with T32** — **Reaches the top bar its own file input** so loading a second document keeps working | S1, S8 | F7 Welcome | inline |
| T31 | Verify the welcome: the honest copy holds, the flow panels track real state, the second document loads, and `pnpm test:browser` stays at 8 of 8 | S10 | F7 Welcome | verify |
| T32 | **Drop zone still visible while the document is loading.** — **closed in L54, together with T30** — `App.tsx` renders it unconditionally, so it sits there during extraction. **Must land together with T30**, because hiding it without first giving the top bar its own file input is exactly what broke the canvas earlier | S1, S8 | F8 Feedback | inline |
| T33 | **Markdown looks identical to plain text.** It only differs by headings and bullet lists, so on a document where no heading was detected the two views are byte-identical and the tab looks broken. The view needs to differ in ways that are honest and visible, or say plainly that the document has no detected structure | S5 | F8 Feedback | writer |
| T34 | **Heading detection misses bold-only headings** — **closed in L50** — which is why a whole document collapses into one untitled section. pdf.js exposes no font weight, so this needs another signal: short centred lines, vertical spacing before a line, or digit-and-dot numbering already covered. This is the root cause of T33 and T35 | S2, S5 | F8 Feedback | writer |
| T35 | **Clicking a section highlights every paragraph in it, which reads as wrong.** — **closed in L52** — Choose between highlighting the section's heading only, highlighting its first block with a lighter tint for the rest, or outlining the section as one region. Then separate **selecting** a section from **copying** it, because today one click does both | S4, S5 | F8 Feedback | writer |
| T36 | **The selected section card does not look selected.** — **closed in L53** — The active state is an `aria-current` and a border tint that evidently does not read. Make the selected card unmistakable | S5 | F8 Feedback | inline |

### Note on the redesign, before any of it starts

The mockup is a **design comp, not a specification**. Three things follow.
- `code.html` simulates the PDF as styled HTML (`sheet-doc-title`, `sheet-header`, `sheet-footer`). Our
  viewer renders the real thing with a canvas and pdf.js's text layer, so anything the mockup appears to do
  *to the PDF* has to be re-derived against real geometry. T23 is the case that matters.
- The mockup's copy is placeholder: `DocuExtract AI`, `Engine v2.4`, a fictional financial report. None of it
  becomes product copy; the app keeps its own honest wording.
- **T19 runs before the redesign, not after.** T14 to T17 changed extraction behaviour and the redesign only
  redraws it. Verifying extraction first keeps a T24 failure unambiguous: it will be layout, not logic.
- Kept deliberately: the extractor's honest states — no text layer, encrypted file, oversized file, the
  quality report — must survive the redesign. A prettier shell that hides them would be a regression.


### Routing for T14–T18, set against the models actually configured

Subagent profiles in force (verified in both `~/.gentle-shell/agent/subagents.json` and the frontmatter of
`~/.gentle-shell/agent/agents/*.md`, which agree on all ten): explore `DeepSeek-V4-Flash-0731` effort low;
worker and jd-fix-agent `DeepSeek-V4-Pro-0813` effort high; verify and the four `review-*` lenses
`MiniMax-M3` effort medium; jd-judge-a `MiniMax-M3` effort high; jd-judge-b `Qwen3.6-Plus` effort high.

| Task | Route | Model it lands on | Why |
| --- | --- | --- | --- |
| T14 | parent inline, test-first | `DeepSeek-V4.1-Flash` (parent) | `LineBuilder` is one cohesive file; the geometry reasoning must stay in the parent's head |
| T15 | parent inline, test-first | parent | one rule inside `TextAssembler`; the risk is the same-module interaction with the T4 behaviours |
| T16 | writer | `DeepSeek-V4-Pro-0813` high | three mechanical fixes across distinct files, each with a mutation to re-establish |
| T17 | writer | `DeepSeek-V4-Pro-0813` high | touches the browser harness and `vite.config.ts`, then must re-run the browser check |
| T18 | parent inline | parent | documentation only; delegation would cost more than the edit |
| T14 and T15, verification | verify | `MiniMax-M3` medium | **mandatory.** Both are high-risk changes to behaviour every other behaviour sits on, and `MiniMax-M3` is the profile that found the blockers in the first place |
| T19, final pass | verify | `MiniMax-M3` medium | confirm the blockers are actually gone, not merely tested |

**Models that are currently unused and why:** `jd-judge-a` and `jd-judge-b` are for Judgment Day only, and
this fix round is not a Judgment Day; invoking them would be ceremony without a user request. The four
`review-*` lenses belong to the native review lifecycle, which has not been started for any candidate.
`gentle-ai-explore` is for mapping code before a decision, and T14–T18 are already mapped by the
verification report, so spending it here would be reading what we can already cite by file and line.

**S10** The welcome screen adopts the landing design in the new `screen.png`, with the mockup's layout and
**copy audited against what the code actually does** (L44). Any claim the product cannot support is rewritten.

**S9** The interface adopts the *Serene Editorial Glass* design system in `DESIGN.md`. Verbatim: *"es el mockup de lo que quiero que se vea"*.

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

**L6** (T1 closed, evidence): commit `68ee0a4` — `chore: bootstrap the PDF text extractor project`,
15 files on `main`. Verified: `tsc --noEmit` exit 0, `eslint .` exit 0, `vitest run` 1/1 passed,
`vite build` exit 0, `pnpm peers check` clean.
- Branching: T1 is the repository bootstrap and lands on `main`, because a default branch with zero
  commits can be neither pushed nor protected. T2 onwards land on `feat/pdf-text-extractor`.
- Toolchain actually resolved: vite 8.3.5, vitest 5.1.0, react 19.3, eslint 10.14, tailwind 4.3.4,
  typescript **6.0.3** — deliberately not the 7.0.2 that `latest` resolves to, because
  `typescript-eslint@8.72.1` declares peer `typescript >=4.8.4 <6.1.0` and throws on startup with
  TS 7. Revisit when typescript-eslint supports TS 7.
- Each task's commit hash is recorded in this Log one commit late: a commit cannot contain its own
  hash. The subject line is the stable reference; the hash is corroboration.

**L7** (T2 closed, evidence): commit subject `feat(core): model PDF text and extract it through
pdf.js`. Files: `src/core/model.ts`, `src/core/pdf/{text-content,extract,load}.ts` plus two test
files. Checks observed: `vitest run` 13/13 passed, `tsc --noEmit` 0, `eslint .` 0,
`prettier --check .` clean, `vite build` 0.
- Coverage: `text-content.ts` and `extract.ts` at 100% branches. `load.ts` at 0% — deliberately
  untested here because it is glue around pdf.js `getDocument` and its real coverage comes from
  real-PDF tests in T6. This is an open gap, not a closed one.
- Test-first note: the malformed-transform test went RED first and the failure was my own faulty
  expectation, not a code defect. It exposed that the `NaN` sat in matrix cell `e` (x) while `f`
  (y) stayed readable — so the assertion was rewritten to prove degradation is *per cell*.
- Design decision: `core` never imports `pdfjs-dist`. The pdf.js item shape and the page/document
  shapes are declared **structurally**, so the mapping and the extraction walk are testable with
  plain objects, no worker and no browser. `load.ts` is the single pdf.js-aware module.
- Design decision: `core` throws no user-facing text. User-visible copy belongs to the UI layer, so
  later error mapping cannot leak English strings into the Spanish interface.
- Known limitation recorded for T11: pages rotated 90/270 are detected (`rotation` is kept) but
  their fragments are laid out as if horizontal. Vertical `ttb` runs are captured, not laid out.

**L8** (user instruction, verbatim): *"si y publico y continua, no hagas commits, quiero ver wl codigo antes"*
- Repo published: `https://github.com/orjuela45/pdf-text-extractor`, **public**, with `main` and
  `feat/pdf-text-extractor` pushed. `gh auth setup-git` had already installed the credential helper
  for account `orjuela45`.
- **Standing instruction, overrides the per-task commit rule in L5: no commits until the user has
  reviewed the code.** User decisions beat ODD momentum. Consequence: a tracked task no longer closes
  with its commit, so T3 is `blocked` on the user's review rather than `done`, and later tasks are not
  started, because piling unreviewed work would grow exactly the review this instruction exists to
  protect.

**L9** (T3 closed pending review, evidence): files `src/core/layout/lines.ts`,
`src/core/layout/lines.test.ts`, plus `TextLine` added to `src/core/model.ts` and the shared
`src/test/fragments.ts` factory.
- Checks observed: `vitest run` 24/24 passed, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .`
  clean, `vite build` 0. Coverage of `src/core`: **100% branches**, and `load.ts` remains the single
  uncovered file (0%, deferred to T6 by design).
- Test-first, honestly reported: the observed RED was an unresolved-import failure, which proves
  nothing about behaviour. It was compensated with a **mutation check** instead of being dressed up as
  evidence.
- Mutation check, three deliberate defects injected one at a time into `lines.ts`:
  - flipping the line order (top-down backwards) → 3 tests failed;
  - deleting the left-to-right sort inside a line → 1 test failed;
  - collapsing the baseline tolerance to zero → 3 tests failed.
  Every defect was caught, and `lines.ts` was confirmed byte-identical to the original afterwards.
- Finding from that check: removing the inner sort does **not** fail the test named "sorts the
  fragments of a line left to right whatever their input order", because the outer sort already orders
  by `x` when `y` ties. The inner sort is still load-bearing and still protected — it is the
  mixed-baseline test that pins it. Recorded so a future reader does not delete it as redundant.
- Design decisions: the page is walked top-down, which in PDF user space means **largest baseline
  first**; every sort is written that way, and reversing it silently flips a document. The baseline
  tolerance is `max(1, max(dominantSize, fragmentSize) * 0.3)` — deliberately generous, because
  splitting a line that belongs together injects a bogus paragraph break, which costs more than
  merging two lines whose baselines nearly coincide. A line anchors on its highest baseline and
  reports the largest font size on it as its dominant height.
- Known limitation for T5: multi-column pages are not segmented here. Two columns with aligning
  baselines merge into one line.

**L10** (user style instruction, verbatim): *"algunos ajustes que recomiendo, no pongas muchyos
bloques de comentarios, en lo esencial, nada, no me gustas, las interfaces y constantes no deben estar
en el mismo archivo deben estar aparte, y funciones sueltas en archivos no quiero, de ser posible usar
clases tipo OOP, esto no solo para este proyecto sino en general"*
- Explicitly project-independent. Saved to memory with `global` scope so it applies to every future
  project, not only this one.
- Convention adopted, user-selected after being offered the alternatives:
  - interfaces **grouped by domain** in `src/core/models/` (`text`, `page`, `pdfjs`, `layout`,
    `extraction`) with a barrel `index.ts`, never in the same file as the implementation;
  - constants **one per file** in `src/core/constants/` with a barrel `index.ts`;
  - classes with **configured instances** — `new LineBuilder({ baselineToleranceRatio }).build(…)` —
    instead of static methods or loose functions;
  - **zero comments in source.** Rationale lives in this document, not in the code. This is the whole
    point of the rule: the source stays clean and the reasoning stays where it belongs.
- Consequence applied to test scaffolding too: `FragmentFactory`, `RawItemFactory`, `FakePdfPage` and
  `FakePdfDocument` are classes, not helper functions. `FakePdfPage` records the viewport parameters it
  was called with, which replaced `vi.fn()` spying with a real recording fake.
- `models/` is excluded from coverage: those files emit no runtime code, so reporting them would be
  noise.
- Refactor scope: T2 and T3 were rewritten wholesale. Removed: `core/model.ts`,
  `core/pdf/{text-content,extract,load}.ts` with their tests, `core/layout/lines.ts` with its test, and
  `test/fragments.ts`.
- The speculative `isBlank` helper was dropped rather than ported: nothing consumed it, and it is
  reborn in T4 where whitespace handling actually belongs.
- Evidence **after** the refactor, since a refactor invalidates everything measured before it:
  `vitest run` 23/23, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean, `vite build` 0,
  coverage of `src/core` at 100% branches with `PdfDocumentLoader.ts` the only uncovered file (0%,
  deferred to T6 by design).
- The mutation check was **re-established** on the refactored code instead of being carried over: the
  three defects were injected together and 6 tests failed, then `LineBuilder.ts` was restored
  byte-identical and the suite went green again.
- Lint finding: `@typescript-eslint/no-unused-vars` does **not** honour the `_` prefix that TypeScript's
  `noUnusedParameters` does, so `_parameters` in a test double still errors. Resolved by removing the
  unused parameter instead of loosening the rule.

**L11** (user TODO review request, verbatim): *"puse un todo para que revises y me digas si es viable o no"*
- The TODO was not where the tooling could see it: absent from the `todo` list, from `odd/`, from any
  file in the project, and from GitHub (no issues, no PRs, no extra branches, no gists). It had been
  written as a **comment inside the source**, `src/core/layout/LineBuilder.ts`: *"todo: no seria mejor
  primero setear lo de dominantSize del else y luego dejar el if, para omitir el else"*.
- **Verdict: viable, with one condition.** Computing `dominantSize` unconditionally and keeping only the
  `baseline` branch works, but only if `flush()` resets `dominantSize` to 0. Without that reset, the
  dominant font size of one line leaks into the next, the tolerance never shrinks back, and later lines
  merge into one.
- Not hypothetical: a 40pt heading followed by 10pt body text loosens the tolerance from 3 points to 12,
  so body lines 10 points apart collapse into a single line. Heading-then-body is the ordinary shape of
  a real document, not a corner case.
- Applied: `flush()` now ends with `current = []; dominantSize = 0;`, and the loop body sets
  `dominantSize = Math.max(dominantSize, candidate.fontSize)` before a lone
  `if (current.length === 0) { baseline = candidate.y; }`.
- **The suite had no coverage for that reset.** Deleting `dominantSize = 0` from `flush()` was caught by
  nothing, because every existing case kept one font size across one page. Added
  `does not let a large font loosen the tolerance of later lines` as the regression guard.
- Proven rather than assumed: with the reset the suite is 24/24; deleting the reset fails **only** the
  new test (23 passed, 1 failed); restoring returns 24/24.
- Trade-off recorded honestly: the refactor is three lines shorter but replaces a self-contained reset
  with an invariant spanning two places — the loop now *assumes* `dominantSize` is 0 whenever `current`
  is empty. That assumption is exactly what the new test pins, which is what makes the trade acceptable.
- The user's comment was removed: it is resolved, and the convention forbids comments in source.
- Housekeeping finding: `src/core/layout/LineBuilder.ts` had become **untracked** in the git index, so a
  commit at that moment would have silently omitted the class while the test file went in. Staged again.
- Evidence: `vitest run` 24/24, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean,
  `vite build` 0, `src/core` at 100% branches.

**L12** (commits authorized by the user, verbatim: *"haz commit"*)
- Split into **two commits** rather than one, so the structural refactor and the behaviour change that
  came out of the review TODO can be reviewed, and reverted, independently. The TODO fix is the part
  with a real behaviour consequence, and mixing it into a 27-file restructure would bury it.
- Commit 1 `1608428` — `refactor(core): restructure the core into models, constants and classes`.
  27 files, +630/-458. Both files of the fix were temporarily rolled back to their pre-TODO state so
  this commit is a pure restructure, and the state was verified green **before** landing: 23/23 tests,
  `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean, `vite build` 0.
- Commit 1 deliberately excludes this document, so the Log entry describing the TODO fix does not land
  in the commit that does not contain that fix.
- Commit 2 — `fix(core): reset the dominant font size between lines`, carrying the review TODO fix, its
  regression test, and this document.
- Push has **not** been performed for either commit; it remains a separate decision.

**L13** (T4 implemented and verified — awaiting the commit decision): files
`src/core/text/TextNormalizer.ts`, `src/core/text/TextAssembler.ts` and their tests, plus
`src/core/models/assembly.ts`, `src/core/constants/SPACE_GAP_TOLERANCE_RATIO.ts`,
`src/core/constants/UNICODE_REPLACEMENTS.ts`, the two barrels, and `src/test/LineFactory.ts`.
- The gap rule inserts a separator when `next.x - (previous.x + previous.width)` exceeds
  `ratio x max(fontSize)`, with `SPACE_GAP_TOLERANCE_RATIO = 0.25`. A separator that already exists is
  never doubled. Fragments whose normalized text is empty are dropped from the chain, so the gap is
  measured **across** them instead of stopping at them.
- Normalization is a targeted map, not blanket NFKC: ligatures expand, typographic and non-breaking
  spaces fold onto a plain space, and invisible characters (soft hyphen, zero-width, BOM) are removed.
  `½`, `①`, `2³`, `¿`, `—` and `«»` are deliberately left alone, and a test pins that so nobody
  "upgrades" this to NFKC later without noticing what it would rewrite.
- Mutation check, four defects injected one at a time:
  - removing the existing-separator guard → **caught by nothing**;
  - treating the deletion entries as no-ops → 1 test;
  - measuring the gap from `x` instead of `x + width` → 4 tests;
  - keeping empty fragments in the chain → 1 test.
- Finding, and the whole reason the mutation check exists: the two original "never doubles a
  separator" tests passed **for the wrong reason.** The space fragment had width 3, so the gap from its
  end was already 0 and the gap rule inserted nothing — the guard was never exercised by them. Both were
  rewritten into a space fragment *narrower* than the real gap and a fragment that *leads* with a space,
  which exercise each side of the guard. Re-running the mutation now fails both.
- The guard is genuinely load-bearing, not defensive decoration: a space glyph whose advance is
  narrower than the visual gap is ordinary in real PDFs.
- Coverage finding: `TextAssembler.ts` had one uncovered branch, the defensive
  `fragment === undefined` guard that existed only to satisfy `noUncheckedIndexedAccess`. Rather than
  write a test for unreachable code, the loop was restructured to carry `previous` in a local and
  iterate with `for...of`, which deleted the dead branch outright. `src/core` is now at 100% branches.
- Evidence: `vitest run` 44/44, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean,
  `vite build` 0, `src/core` 100% branches with `PdfDocumentLoader.ts` (0%, deferred to T6) the only
  uncovered file.
- **Not committed**: the standing instruction is to see the code before it is committed.

**L14** (T5, first half — paragraphs; evidence): files `src/core/layout/BlockBuilder.ts`, its test,
`src/core/models/block.ts`, `src/core/constants/{PARAGRAPH_LINE_GAP_RATIO,INDENT_TOLERANCE_RATIO,
FONT_SIZE_TOLERANCE_RATIO}.ts`, `assembleBlock` added to `TextAssembler`, hyphen variants added to
`UNICODE_REPLACEMENTS`, and the `BlockFactory` / extended `LineFactory` test doubles.
- T5 is delivered as **two commits** (paragraphs, then sections) but kept as a single task, because ODD
  requires at least one work-unit commit per task and allows more than one. Splitting the commits keeps
  each review unit focused; splitting the task would only add bookkeeping.
- Three signals open a block: a vertical gap wider than `1.6 x pair font size`, a font size change beyond
  `15%`, or a line indented past the block margin by more than `0.5 x block dominant size`.
- Design decision that the tests forced: the indent rule must compare against a **block margin**, not the
  previous line's left edge. A paragraph whose first line is indented is the ordinary case, and a
  line-to-line comparison splits it in two. The margin is the leftmost edge seen so far, which also makes
  a line starting left of the margin *correct* the margin instead of opening a block. That is what keeps
  an indented first line followed by body text as one paragraph while a later indented line still opens
  the next one.
- Dehyphenation is deliberately narrow: the hyphen must be attached to a letter and the next line must
  start lowercase. A standalone dash and a hyphen before a new sentence both survive, and each has a test.
  Mapping `U+2010` and `U+2011` onto an ASCII hyphen is what makes the check a single character.
- Mutation check, five defects injected one at a time, all caught:
  - disabling the indent rule → 2 tests;
  - disabling the font size rule → 1 test;
  - using `max` instead of `min` for the block margin → 1 test;
  - welding without dropping the hyphen → 1 test;
  - dropping the lowercase guard after the hyphen → 1 test.
- A test was added **before** running that mutation run, not after: *"starts a new indented paragraph
  after one that was also indented"*. Without it, the `min`-vs-`max` mutation was caught by nothing —
  every existing case had a single indented paragraph, so the block margin never got tested against a
  paragraph that already contained one. The two-consecutive-indented-paragraphs shape is what pins it.
- Coverage finding, the same class as in T4: `BlockBuilder.ts:43` was the unreachable
  `previous === undefined` guard, there only for `noUncheckedIndexedAccess`. Deleted by passing `previous`
  from the caller instead. Line edges are now `min`/`max` reduces starting at signed infinities, so a line
  without fragments contributes nothing to a block box rather than pulling it to zero — which also removed
  the `?? 0` sentinel and its uncovered branch. The config fallbacks for `indentToleranceRatio` and
  `fontSizeToleranceRatio` were uncovered too; the "honours explicit ratios" test was extended to cover all
  three keys, which is what its name already claimed.
- Evidence: `vitest run` 61/61, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean,
  `vite build` 0, `src/core` at 100% branches with `PdfDocumentLoader.ts` (0%, deferred to T6) the only
  uncovered file.
- Remaining half of T5: headings and sections (`SectionBuilder`), which is what S5 needs for the outline.

**L15** (T5, second half — sections; evidence): files `src/core/layout/SectionBuilder.ts` and its test,
`src/core/models/section.ts`,
`src/core/constants/{HEADING_FONT_SIZE_RATIO,NUMBERED_HEADING_PATTERN,LABELLED_HEADING_PATTERN}.ts`,
both barrels, and `BlockFactory.createWithText`.
- Heading detection has two signals: the block's dominant font size exceeding the body size by 15%, or a
  numbering/label pattern. The body size is the mode of the **line** count per font size, not the block
  count, so one multi-line heading cannot outweigh the body text; ties break toward the smaller size.
- The numbered pattern is `/^(\d+(\.\d+)+|\d+[.)])\s/`. The obvious `/^\d+[.)]?\s/` was **rejected**:
  making the separator optional turns *"2020 fue un anio dificil."* into a heading. Requiring either a
  dotted multi-level number or a trailing separator keeps that sentence out while still accepting
  `1. Introduccion`, `1.2 Alcance`, `3) Algo` and `1.2.3 Detalle`. A test pins the rejection.
- Levels are the rank of the heading's font size among all heading sizes, descending — a single source of
  truth, not mixed with numbering depth. **Numbering depth is not used for nesting yet.**
- Known limitation, recorded rather than hidden: **bold-only headings cannot be detected.** pdf.js's text
  layer exposes a font family per generated font handle and no weight, so a heading that differs from body
  text only by weight is invisible to this heuristic. T6's real corpus will show what that costs.
- Known false-positive risk: *"10.000 unidades fueron cargadas."* matches the dotted-number alternative.
  Accepted for now; T7's quality report is where it should surface.
- Two tests were wrong on first write and were fixed **before** implementing: one asserted a value against
  itself (`expect(x).toBe(x)`), and another built a document where headings outnumbered body lines, so the
  statistical body-size mode selected the *heading* size. Both were caught by working the numbers by hand,
  not by the test runner.
- Coverage finding, third occurrence of the same class: `SectionBuilder.ts:45` was the `?? 1` fallback on
  `levels.get(block.fontSize)`, unreachable because the map is built from exactly the heading sizes. Rebuilt
  so the level map is keyed by **block** and the `undefined` check *is* the "is this a heading?" test, which
  made the branch reachable both ways and deleted the fallback. Keying the map by font size instead would
  have been a real bug: a numbered heading at body size would have pulled every body block at that size
  into the heading set.
- Mutations re-run on the rebuilt internals, since changing them invalidates earlier results. **Six defects,
  all caught:** disabling the size rule → 7 tests; disabling the pattern rules → 2; flipping the level order
  → 1; dropping the smaller-size tie-break → 2; giving every heading level 1 → 1; treating every block as a
  heading → 10.
- One mutation first reported NOT APPLIED because Prettier had rewrapped the `.sort(` call across two lines,
  so the target string no longer existed. Re-run against the wrapped text, it is caught. Worth remembering:
  **a mutation that cannot be applied is not a mutation that was survived.**
- Evidence: `vitest run` 74/74, `tsc --noEmit` 0, `eslint .` 0, `prettier --check .` clean, `vite build` 0,
  `src/core` at 100% branches with `PdfDocumentLoader.ts` (0%, deferred to T6) the only uncovered file.

**L16** (T6 closed, evidence — delivered by a delegated writer, then independently verified by the
parent): the inline corpus plus end-to-end tests now exist, driven by the **real** pipeline
(`PdfDocumentLoader` → `PdfTextExtractor` → `LineBuilder` → `BlockBuilder` → `TextAssembler` →
`SectionBuilder`) over eight generated fixtures, a unit test for worker injection, and a drop-in test for
a user-supplied real corpus.
- Files: `tests/fixtures/PdfFixtureFactory.ts`, `tests/extraction.test.ts`,
  `tests/PdfDocumentLoader.test.ts`, `tests/realCorpus.test.ts`,
  `tests/support/{ExtractionPipeline,ExtractionResult}.ts`, `tests/fixtures/real/.gitkeep`,
  `src/core/pdf/PdfDocumentLoader.ts`, `vite.config.ts`, `tsconfig.json`, `tsconfig.tests.json`,
  `package.json`.
- Evidence: `vitest run` **85 passed / 1 skipped** (the skip is the empty real corpus),
  `tsc -p tsconfig.json --noEmit && tsc -p tsconfig.tests.json --noEmit` 0, `eslint .` 0,
  `prettier --check .` clean, `vite build` 0, and coverage now **100% on all four metrics**
  (185/185 statements, 84/84 branches, 53/53 functions, 178/178 lines) with
  `PdfDocumentLoader.ts` no longer at 0%. This is the first time the whole of `src/core` is covered.
- The parent did **not** accept the writer's report at face value. Independently re-run: all six
  acceptance commands, a structural check that `tests/` contains classes and no loose functions, a grep
  proving no comments were introduced, and a fresh mutation forcing `TextAssembler.needsSeparator` to
  `true`, which failed the e2e test `keeps two runs glued when there is no gap between them`. That last
  one is the evidence that the corpus exercises real code rather than asserting on itself.

**L17** (T6) — worker source injection. `PdfDocumentLoader` now takes `workerSrc` with the production
`?url` value as its default, so the shipped bundle is unchanged. Vitest's Node environment resolves `?url`
to `/node_modules/...`, a root-relative dev path that Node's fake worker cannot `import()`. Tests pass
`createRequire(import.meta.url).resolve('pdfjs-dist/build/pdf.worker.min.mjs')`, an absolute path Node
imports directly. That is the whole fix; no production branch changed.

**L18** (T6) — deterministic corpus. Every fixture uses `PDFDocument.create({ updateMetadata: false })`.
The default stamps `CreationDate`/`ModDate` from `new Date()`, which would make the bytes differ between
runs. A test asserts byte-identical output across two calls.

**L19** (T6) — pdf.js normalizes before we do. `getTextContent()` defaults to
`disableNormalization: false`, so pdf.js expands U+FB00–U+FB04 and folds NBSP **itself**, before
`TextContentMapper` sees anything. The `TextNormalizer` ligature/NBSP map is therefore a robustness layer
for other sources and cannot be exercised through this e2e. Recorded so nobody later assumes the e2e pins
that map — the T4 unit tests still do. Exercising it end to end would need `disableNormalization: true` in
`PdfTextExtractor`, which would change production behaviour.

**L20** (T6) — pdf.js spacing side effects, and why one fixture uses two fonts. For a large horizontal gap
pdf.js emits a synthetic `' '` fragment and merges same-font adjacent runs. So the "separated words"
fixture is already spaced *upstream*, and the rule actually under test there is not ours. The "glued runs"
fixture therefore draws the two runs in different standard fonts (Helvetica / Times), which stops pdf.js
merging them, so the assembler's no-gap rule is genuinely exercised. Confirmed by mutation: forcing
`needsSeparator` to `true` fails that test.

**L21** (T6) — ligature fixture without a custom font. pdf-lib's standard fonts are WinAnsi and throw on
U+FB01/U+FB02; embedding a TTF would need `@pdf-lib/fontkit`, which is not a dependency. The fixture draws
placeholder bytes (`#`, `~`) in a Helvetica run and, after `font.embed()`, attaches a hand-written
`ToUnicode` CMap mapping `0x23 → U+FB01` and `0x7E → U+FB02`. pdf.js then extracts real ligature code
points without any font file.

**L22** (T6) — real corpus is a drop-in, never committed. `tests/fixtures/real/.gitkeep` keeps the
directory tracked; no PDF is downloaded or committed, so there is nothing to license. The test scans at
collection time and registers a skip with an explicit "drop PDFs here" message when empty, so the suite
never fails on an empty corpus. **Real-world PDFs remain the one thing generated fixtures cannot replace,
and this is the hook for them.**

**L23** (T6) — the generated corpus is pinned to pdfjs-dist 6.5.438 behaviour. Several e2e expectations
(synthetic space fragments, run merging) follow from pdf.js's content-stream handling, not from the PDF
spec, so a minor pdf.js upgrade may legitimately change them. When that happens, re-derive the expectation
from the observed output rather than assuming our code regressed.

**L24** (T6, parent finding — a false claim I caught by probing). The writer left a hand-written ambient
shim, `tests/node.d.ts`, because `@types/node` was not installed and installing it was outside what it
felt authorized to do. The decision escalated to the parent.
- First attempt: install `@types/node@26.6.6` and delete the shim. Typecheck passed, and I was about to
  record "no global pollution, because `tsconfig.json` restricts `types` to `vite/client`".
- **That claim was false, and a probe proved it.** Writing `const x: number = process.pid` in a temporary
  `src/__probe.ts` typechecked **without error**. Once any `node:`-prefixed import enters the program,
  `@types/node`'s global declarations join it and become visible across the whole project. A browser app
  that silently compiles `process.env.X` is a real defect waiting to happen.
- Root cause: a single `tsconfig.json` covering both `src/` and `tests/`. Fixed by splitting, which is the
  correct answer rather than a workaround:
  - `tsconfig.json` now includes only `src` and keeps `types: ["vite/client"]`;
  - `tsconfig.tests.json` extends it, includes `tests` and `vite.config.ts`, and sets
    `types: ["node", "vite/client"]`;
  - `typecheck` runs both configs in sequence, and `build` typechecks the app config only.
  No project references and no `composite`, so the `tsc -b` complications avoided earlier stay avoided.
- Verified with **two** probes, not one: `process.pid` in `src/` now fails with TS2591, and `import {
  readdirSync } from 'node:fs'` in `tests/` still typechecks. The shim is deleted; the landmine it carried
  (duplicate module declarations the moment `@types/node` is added) is gone with it.
- Lesson recorded: "the types are restricted so nothing leaks" is a hypothesis, not an observation, and it
  took one four-line file to falsify. Probe the property you are about to claim.

**L25** (user TODO in `TextContentMapper`, found by grep rather than reported by the user):
*"no es mejor usar esto como un switch"*.
- Verdict: **viable and applied, but labelled honestly as a lateral move, not a behavioural improvement.**
  The `if`-chain and the `switch` make the same number of decisions and are observably identical. The
  `default` branch has to stay reachable, and it already is: the existing "falls back to left-to-right"
  test pins it, confirmed by mutation — flipping `default` to `'rtl'` fails exactly that test.
- The small real gain: the method now reads as a mapping over a closed set, and a fourth direction becomes
  one more `case` instead of a restructured `if`-chain.
- Alternative worth knowing about if the mapping should become *data* rather than control flow: a `Record`
  constant in `src/core/constants/` plus `return TEXT_DIRECTIONS[dir] ?? 'ltr'`. Not adopted, because it
  adds a constant file and a `models` → `constants` type dependency for a three-entry table.
- **Process finding that matters more than the fix.** This comment had already been **committed**: `git add
  -A` swept it into `1608428` and I never noticed, because after the refactor I checked formatting, lint and
  tests but never grepped the source for comments. A user TODO then sat in the repository for several
  commits. This is the **second** occurrence — the LineBuilder TODO was the first.
- Standing rule adopted from here on, and the reason it is written down: **the convention "zero comments in
  source" is only verifiable by looking.** Grep `src/` and `tests/` for comment tokens as part of the
  pre-commit routine, every time, not just when something feels off.
- The comment is removed: it is resolved, and the convention forbids comments in source.
- Not adopted, offered to the user instead: a mechanical guard (ESLint's `no-warning-comments` plus
  `no-inline-comments`) would have caught both occurrences immediately, but it would also block the user
  from leaving a TODO in code, which is how both of these arrived. That trade is the user's call, not
  mine to make silently.

**L26** (T7, the project's most consequential finding so far — found by the delegated writer, then
**independently reproduced and sharpened by the parent with a controlled probe**).
**pdf.js already solves the problem this project was created for, and our gap rule never fires in
production.**
- The probe generated the same word pair at nine gap sizes, once in one font and once in two fonts, and
  printed pdf.js's raw `getTextContent()` items:

  | gap | same font | two fonts |
  | --- | --- | --- |
  | 0em | `"palabras"` (one item) | `"pala"` \| `"bras"` |
  | 0.03em | `"palabras"` | `"pala"` \| `"bras"` |
  | 0.08em | `"palabras"` | `"pala"` \| `"bras"` |
  | 0.11em | `"pala bras"` (**one item, space already inside**) | `"pala"` \| `" "` \| `"bras"` |
  | 0.13em | `"pala bras"` | `"pala"` \| `" "` \| `"bras"` |
  | 0.2em | `"pala bras"` | `"pala"` \| `" "` \| `"bras"` |
  | 0.25em | `"pala bras"` | `"pala"` \| `" "` \| `"bras"` |
  | 0.3em | `"pala bras"` | `"pala"` \| `" "` \| `"bras"` |
  | 0.5em | `"pala bras"` | `"pala"` \| `" "` \| `"bras"` |

- Reading it: below ~0.11em pdf.js merges same-font runs into one string and inserts no space; at and
  above ~0.11em it either merges them **with the space already inside the string**, or keeps them apart and
  emits a synthetic `" "` item. Our threshold is 0.25em. In both branches the separator is present before
  `TextAssembler` runs, our existing-separator guard suppresses the insertion, and the positive branch of
  the gap rule is **unreachable** through the default pipeline.
- Consequence for T4's design: the gap rule is a **fallback**, not the mechanism. It is still correct and
  still worth keeping — it is the guard that stops a separator being doubled, it becomes load-bearing the
  moment fragments arrive from anywhere other than pdf.js's default text layer, and a pdf.js change could
  make it live again. But the project must stop claiming that our geometry rule is what fixes the glued
  words. What our layer actually contributes is the selection UX (S4), the document structure (S2, S5), the
  quality report (T7), and the guarantee that separators are neither doubled nor lost.
- Consequence for T7: the marginal-join band is **unreachable in production** for the same reason, since
  every gap inside the band arrives already resolved by a separator. The writer flagged this itself and
  correctly refused to "fix" it by widening the band to hug pdf.js's ~0.11em threshold, which would have
  tuned the report to upstream behaviour rather than to our rule. The parent's call, recorded here: the
  band is not shipped as unreachable behaviour. The suspicious-join signal is **redefined to a condition
  that is reachable through the real pipeline** — an existing separator whose glyph advance disagrees with
  the measured gap — which is the same anomaly the T4 test `never doubles a separator when the space
  fragment is narrower than the gap` already covers, now surfaced to the user instead of silently handled.
- Method note worth keeping: the writer reported the threshold as "between 0.10 and 0.12". The parent
  probed at nine points including 0.11em exactly, which is what turned a range into a boundary and exposed
  the same-font **merge** branch the writer had not separated out. **Reproducing someone else's probe with a
  finer grid is cheap and found a second code path.**

**L27** (T7 rework; correction of L26 by the delegated writer, independently verified by the parent).
**My premise in L26 was wrong and is corrected here rather than quietly rewritten.**
- What I claimed: the redefined signal is reachable because a separator narrower than its gap "occurs with
  real PDFs". The writer probed further and refuted it: at normal content scale pdf.js **stretches a
  separator to span the whole gap**, whether it is a synthetic `' '` or a real space glyph in the stream,
  so the measured gap after a separator is exactly 0 and nothing is flagged. My stated everyday
  reachability did **not** hold.
- The reachable path is narrower and is a genuine pdf.js inconsistency, not a proxy: `pushWhitespace` sets
  the separator's `width` from a **text-space** advance while `transform.x` is in **device space**, so under
  a content scale above about 2 the width under-reports the device gap and `gap > 0` becomes observable. The
  end-to-end fixture reproduces that with real PDF geometry (a `cm` scale of 3).
- Rework delivered: the marginal band is **deleted, not widened** — the constant file, its logic and the
  band-only tests are gone. The signal is restated as an observable of the assembler's own decision,
  `!evaluated && gap > 0` (a separator already exists in the stream but does not reach the next fragment),
  and renamed accordingly: `MarginalJoinDetector` → `SuspiciousJoinDetector`, `marginalJoins` →
  `suspiciousJoins`. No constant is needed, so none was kept as dead weight.
- Reachability is proven by a test that runs the **real** chain over a generated fixture and asserts the
  exact report, plus a no-false-positive test on the ordinary separated-words fixture. The strongest single
  piece of evidence is mutation M3 from the writer: collapsing the rule back to the old `gap > threshold`
  shape fails **exactly and only** that end-to-end test, which is what proves the test pins the new signal
  rather than the old logic.
- The parent re-verified independently rather than trusting the report: 116 passed / 1 skipped,
  `tsc` 0 on both configs, `eslint` 0, `prettier --check` clean, `vite build` 0, coverage **100% on all four
  metrics** (214/214 statements, 90/90 branches, 59/59 functions, 206/206 lines), no comments, and a fresh
  mutation inverting `!join.evaluated` which failed **9 tests** including the end-to-end one.
- Honest assessment recorded for the user: this signal is **narrow**. It is kept because it is real, proven
  and load-bearing under mutation — not because it fires often. The valuable, broadly reachable half of T7 is
  `pagesWithoutText` plus the aggregate stats, which answers "this 200-page PDF produced 40 characters". If
  the user wants T7 trimmed, the suspicious-join half is the piece to drop and the rest stands on its own.
- Method note: **being corrected twice in one task is the system working.** My probe was coarser than the
  writer's follow-up, and the writer's report was in turn checked rather than trusted. Neither of us was
  right by authority.

**L28** (T8 + T9 closed, evidence): the application now works — drop or pick a PDF, see it rendered, click a
paragraph to get its corrected text on the clipboard.
- Logic classes in `src/ui/`: `CoordinateMapper`, `BlockHitTester`, `ClipboardWriter`, `ExtractionSession`,
  `PdfDocumentSession`, `PageRenderer`. Thin components: `App`, `Dropzone`, `PdfViewer`, `PdfPage`,
  `PdfPageView`, `ReportPanel`, `CopyFeedback`. UI interfaces in `src/ui/models/` (one concern per file plus
  a barrel), UI constants one per file in `src/ui/constants/`.
- Evidence: `vitest run` **148 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0,
  `prettier --check` clean, `vite build` 0, `src/core` still at 100% on all four metrics, no comments.
- The parent re-verified independently with a mutation the writer had not used — the sign of `y` in
  `CoordinateMapper.toUserSpace` — which failed three tests including
  `copies the corrected paragraph under the click through the viewer`. That is the whole path from a click to
  the clipboard, so the end-to-end wiring is load-bearing, not just the units.
- **Deliberate, reversible deviation from L10, which the user may want changed.** L10 forbids loose
  functions and wants classes. React function components and hooks are loose functions, and React class
  components are legacy. The split taken: components stay thin (markup, props, event wiring), every piece of
  real logic is a class, and the single hook `usePdfDocument` is glue that delegates to `PdfDocumentSession`.
  This honours the intent of L10 — logic does not live scattered in functions — while refusing to write
  legacy React. Flagged for the user rather than settled silently.
- Coordinate decision: `CoordinateMapper` is built on the pdf.js viewport transform with the exact
  `applyTransform` / `applyInverseTransform` formulas rather than calling `PageViewport` methods, so it stays
  unit-testable with a plain array and works in both directions. The viewer asks for `rotation: 0`, matching
  `PdfTextExtractor`: rendering with the page's own rotation would make the overlay look right while copying
  the wrong block.
- Hit-testing runs on core `TextBlock` boxes in user space, never on DOM text nodes or
  `window.getSelection()`. A non-empty native selection only suppresses our copy, so native selection and
  click-to-copy coexist.
- The text layer uses pdf.js's exported `TextLayer` with a minimal local `.textLayer` CSS instead of
  importing `pdf_viewer.css` wholesale, which would drag many global rules into a Tailwind app.
- `PageRenderer` wraps `page.render` with a `cancel()`, because React StrictMode double-invokes effects in
  development and pdf.js refuses concurrent renders on one canvas.
- Clipboard: `navigator.clipboard.writeText` first; if it is unavailable or rejects, the text is still
  delivered through a visible, pre-selected read-only `textarea`. `ClipboardLike` is a one-method interface
  so both paths are testable without a browser, and the fallback is a real fallback rather than a silent
  failure. Both paths have tests.
- **Honest gap, stated plainly rather than papered over: none of this was verified in a real browser.** No
  Playwright or Puppeteer is installed and none was added. Canvas drawing, the pdf.js `TextLayer` layout and
  the real `navigator.clipboard` need a real gesture and a secure context, so they are unverified outside
  tests. Treat "it builds and the component tests pass" as necessary but not sufficient for the UI. This is
  the single largest open risk in the project.
- Limitation carried forward to T11: pages declaring a rotation are extracted and rendered at `rotation: 0`
  so the core contract holds, so a rotated PDF displays sideways. Known since L7, still unresolved.
- The Vite chunk-size warning is pre-existing pdf.js weight, not new in T8/T9. No new runtime dependency and
  no network call was added; the PDF never leaves the browser.

**L29** (T10 + T11 closed, evidence — and **the browser gap in L28 is now closed**):
- T10: `OutlinePanel`, `OutlineBuilder`, `SectionTextAssembler`, plus `copySection` / `copyAll` on
  `ExtractionSession`. Outline entries carry heading (or an untitled placeholder), level and assembled text.
  A section body is mounted **only when expanded**, so a long document never puts its whole text in the DOM,
  and a browser check asserts exactly that. Spanish copy, `aria-label` / `aria-expanded` / `aria-controls`,
  keyboard reachable, copy-all as the first tab stop.
- T11: `PdfErrorMapper` maps `PasswordException` to an exact Spanish message and everything else to an
  unreadable-file message, which also covers worker failure. `NoTextPanel` makes zero fragments explicit.
  `FileSizeGuard` at **100 MB**, and the message now states the limit *and* the reason. Rotated pages are
  fixed rather than warned about: the viewer renders with the page's own rotation and `CoordinateMapper` is
  built from that same viewport transform, because the pdf.js viewport transform maps **unrotated** PDF user
  space — the space core geometry and `item.transform` both live in — onto the rotated canvas. **`src/core`
  is untouched and stays rotation-agnostic.**
- **The real-browser check found two failures that 182 unit and component tests could not, which is the
  entire justification for having built it.**
  1. *Click-to-copy failing* was a **verification-script defect, not an application defect.** Puppeteer's
     `overridePermissions` resets every unlisted permission to denied, and it maps `clipboard-write` to
     `clipboardReadWrite`; the `clipboardSanitizedWrite` permission that `writeText` actually needs was
     therefore revoked. The evidence was an isolation matrix over permission sets plus a DOM probe showing
     the app had **already put the correct corrected text in the fallback textarea** while `writeText` threw
     `NotAllowedError`. The fix was to grant the missing permission; **the assertion was not loosened.**
  2. *Rotated pages* was a **genuine application defect.** pdf.js positions its text-layer spans against
     `viewport.rawDims`, which are the **unrotated** page dimensions, and relies on global
     `[data-main-rotation]` rules in `pdf_viewer.css`. The minimal local port of `.textLayer` in L28 dropped
     those rules, so the canvas rotated while the overlay did not. Evidence: `.pdf-page`/canvas measured
     792x612 while `.textLayer` measured 612x792, with the span placed from the unrotated box. Fix: port the
     three rotation rules exactly. `PageRenderer` already used the rotated viewport, so the interrupted
     refactor was right and only the CSS was missing.
- Evidence, all re-run by the parent rather than taken from the report: `vitest run` **182 passed / 1 skipped**,
  `tsc` 0 on both configs, `eslint` 0, `prettier --check` clean, `vite build` 0, `src/core` 100% on all four
  metrics, no comments in source, `git status --porcelain -- src/core` empty, and **`pnpm test:browser` 7/7
  PASS** including `clicking a paragraph writes the corrected text to the clipboard` observed through the real
  `navigator.clipboard`.
- Five mutations on the new logic (outline level, section joining, the password mapping, the renderer's
  viewport call, the size-guard boundary), each caught by a named test and each restored byte-identically.
- The 100 MB guard is a coarse safety valve, not a considered product limit: the app holds the whole file as
  an `ArrayBuffer` and mounts one canvas plus one text layer per page with **no virtualization**, and the
  guard bounds bytes, not page count. A small file with thousands of pages is still unbounded. Recorded as
  the next real scalability gap rather than hidden behind the guard.
- Method note, now demonstrated twice in this Log: **"the tests pass" is not evidence that the product
  works.** The unit suite was green and completely blind to the overlay not rotating and to the real
  clipboard path. Any future claim about this UI is cheap to check and expensive to assume.

**L30** (T12 closed): delivery configuration and documentation.
- `netlify.toml`: build command and publish directory, an SPA redirect, security headers including a
  Content Security Policy, immutable caching for hashed `/assets/*`, and no-cache for `index.html`.
- **The CSP is deliberately mirrored into Vite's `preview.headers`, so the real-browser check exercises it.**
  A security policy that only exists on the host is a policy nobody verifies locally, and an unverified CSP is
  a liability: it would either break the deployed app or be quietly useless. `pnpm test:browser` passes with
  the header applied, which verifies it does not break the app locally. The real deploy remains the last
  check, and `docs/netlify-deploy.md` tells the user to watch the console for CSP errors on that first deploy.
- `README.md` (English, repository-facing) is upfront about what pdf.js already does and what this layer
  actually contributes, and lists the known limitations rather than burying them.
- `docs/netlify-deploy.md` is in **Spanish**, an explicit exception to the English-artifact default, because
  it is a step-by-step guide for the user to run on his own account with his own domain. It keeps the
  portfolio site untouched: a new Netlify site plus a `pdf.<domain>` subdomain, with an explicit warning to
  stop and ask before touching root DNS records.
- Also fixed here: `vite.config.ts` and `eslint.config.js` still carried comments written in T1, before the
  no-comments convention existed. The pre-commit grep had been scoped to `src/` and `tests/` and never looked
  at the root config files, so it could not have caught them. The grep now covers the root configs too.
- Grep false positive worth recording: `'src/**/*.{ts,tsx}'` contains `/*` inside a glob string, so a naive
  search for comment tokens flags configuration. The check was tightened to match comment tokens at the start
  of a line or after code, which is what actually matters.
- Evidence: `vitest run` 182 passed / 1 skipped, `tsc` 0, `eslint` 0, `prettier --check` clean,
  `vite build` 0, `pnpm test:browser` 7/7 PASS with the CSP applied, no comments in any `.ts`, `.tsx` or `.js`
  including the root configs.

**L31** (T13 — independent verification verdict. **The verification found real defects and one false
claim of mine. This entry exists to record them, not to soften them.**)
- Verified by a separate verifier agent, read-only, in a fresh copy of the tree with the original left
  byte-identical. Its baseline matched ours exactly: typecheck 0, lint 0, format clean, 182 passed /
  1 skipped, `src/core` 100% branches and statements, `pnpm test:browser` 7/7.
- **A false claim of mine, corrected rather than explained away.** L30 and `docs/netlify-deploy.md` said
  `pnpm test:browser` exercises the CSP because `preview.headers` mirrors `netlify.toml`. **That is
  false.** The browser script runs its own static server which sets only `content-type`, so the security
  headers were never applied; the verifier probed the response and found no CSP and no `X-Frame-Options`.
  The claim came from reasoning about the config instead of observing the response — the exact failure
  mode I had already recorded twice in this Log. Both documents now say the CSP is **unverified**, and
  `docs/netlify-deploy.md` tells the user to open the console on the first deploy. **I did the thing I had
  been warning about.**
- **Defect, blocker, S2 + S4: multi-column pages interleave.** `LineBuilder` clusters by `y` alone, so two
  columns whose baselines align merge into one line. Reproduced through the real pipeline and through the
  real clipboard: clicking a left-column paragraph copies left and right column text interleaved
  (`columna izquierda uno columna derecha uno columna izquierda dos columna derecha dos`). This was a
  known limitation in L9 written down as "multi-column pages are not segmented" and then never surfaced
  to the user as a product-level caveat. It is the largest real defect in the project.
- **Defect, blocker, S3: my dehyphenation rule deletes a hard compound hyphen.** `franco-` + `aleman`
  copies as `francoaleman` instead of `franco-aleman`. The L14 rule welds whenever the hyphen is attached
  to a letter and the next line starts lowercase, and it cannot tell a hyphenated line break from a
  genuine compound hyphen. Reproduced through the real clipboard.
- **False statement in `README.md`:** the suspicious-join signal is described as needing a content scale
  "above about 2". The verifier found it firing at about 1.1. The L27 wording was carried forward without
  re-measuring.
- **A hollow test.** `tests/PdfDocumentLoader.test.ts` "falls back to the bundled worker URL" asserts only
  that the value is non-empty, so it passes with the default replaced by `'WRONG-WORKER-URL'`. It claims to
  pin the bundled URL and does not.
- **Two boundary mutations survive the whole suite:** `BlockBuilder`'s gap comparison `>` → `>=` and
  `BlockHitTester`'s bottom boundary `>=` → `>`. 100% branch coverage is real but is **not**
  mutation-complete; branch coverage counts decisions taken, not boundaries pinned.
- **Coverage scope worth stating plainly:** the coverage config includes `src/core/**` only. **All of
  `src/ui/` is outside the metric**, so "100% coverage" must never be read as covering the interface.
- Suite-invisible behaviours named by the verifier: the CSP in the browser check, any real Netlify
  deploy, multi-column order, the hard-hyphen weld, the native-selection copy path (Ctrl+C bypasses
  assembly and returns raw text-layer text), the clipboard-denied fallback in a real browser, render
  errors swallowed by a `.catch(() => undefined)` that leaves a stuck loading state, RTL and vertical
  text (`direction` and `hasEOL` are captured and never consumed), real drag-and-drop, and page-count
  scalability.
- The verifier left ready-to-commit regression probes for the two blockers and the hollow test. **They are
  not applied**, because applying them requires a fix round and the honest state of the tree right now is
  "verified, with two blockers and one false claim corrected". Handing a broken behaviour a green test
  would be worse than leaving the defects named.

**L32** (user instruction, verbatim): *"dejemos ese de lado entonces. escribe las nuevas tareas a contianucion
para corregir los errores y levanta el proyecto para ver como va"*
- `unpdf` is set aside. Assessed and **not adopted**, with the reasoning recorded rather than dropped: it
  does expose pdf.js's own `PDFDocumentProxy` through `getDocumentProxy` (verified in the installed package,
  whose types re-export `types/src/display/api.js`), so the whole geometry layer would work unchanged. It
  was rejected anyway because it bundles PDF.js **4.0.189** against our **6.5.438** — which would invalidate
  the measured synthetic-space finding in L26 and every corpus expectation in L23 — and because solving our
  Node and test worker plumbing is a problem already paid for in L16 and L24 and verified with 7/7 browser
  checks. Its design target is serverless and nodeless runtimes, where the browser worker we actually want is
  absent. **Revisit it if a backend is ever added** (OCR or batch extraction), which is the deferred case in
  L2, and adopt it there with `definePDFJSModule(pdfjs-dist)` so our measured pdf.js version is kept.
- The blockers from L31 become tasks T14–T18 in the table above, in the order they should be fixed. T14 and
  T15 are the two real defects; T16–T18 are the false claim, the hollow test and surviving boundary
  mutations, and the README correction.
- Priority stated for the user: **T14 and T15 are more urgent than any decision about tooling.** They are
  defects in our own grouping and hyphen rules, and no loader swap touches them.
- The development server is started so the user can look at the application before the fixes land.

**L33** (model configuration validated at the user's request):
- The user's earlier change was to replace `inherit` with explicit per-subagent models. **It applied, in both
  places, consistently.** `subagents.json` and the frontmatter of each of the ten `agents/*.md` declare the
  same model for every agent, verified pair by pair. No precedence conflict exists and no source silently
  overrides the other.
- `gentle-ai/managed-assets.json` carries a SHA-256 for each agent file, which means the harness treats them
  as **package-managed assets** that it re-syncs from the package and verifies by hash. That explains the
  19:40 timestamps arriving after the 19:19 edit to `subagents.json`: the agent files were regenerated from
  the profiles rather than edited by hand. The models the user set are therefore the ones in force, and they
  survive future syncs.
- Routing for T14–T18 was then derived from that confirmed table plus the real commit authorship, recorded
  in the task table above. The parent takes T14, T15 and T18 inline; the writer takes T16 and T17; verify
  takes the confirmation pass. `jd-judge-a`, `jd-judge-b` and the four `review-*` lenses are deliberately left
  unused: they belong to Judgment Day and to the native review lifecycle, neither of which was requested, and
  spending them here would be ceremony. `gentle-ai-explore` is skipped because the verification report already
  located every defect by file and line.
- Recorded because it happened: **the delegated writer produced one defective artifact in this project** — the
  hollow test in `tests/PdfDocumentLoader.test.ts`, delivered in `a0a5c12` and caught only by independent
  verification in T13. The lesson is not which model wrote it; it is that a writer's own test for its own code
  is not independent evidence, which is why T16 exists and why verification stays mandatory.

**L34** (T14 closed — the multi-column blocker is fixed. Evidence, and the two wrong turns taken getting there.)
- Fix: `ColumnDetector` finds the widest vertical whitespace cuts that no fragment crosses, and `LineBuilder`
  groups lines **inside each column** instead of across the whole page. Files:
  `src/core/layout/ColumnDetector.ts` and its test, `src/core/models/columns.ts`,
  `src/core/constants/COLUMN_GAP_RATIO.ts`, both barrels, and `LineBuilder` reworked around it.
- The threshold is `4 x body size` and it was **measured, not guessed**. A probe over the existing corpus found
  the word-space fragment pdf.js inserts is **30pt** at 12pt text, while the column gap is **138pt**; 4em =
  48pt sits between them with room on both sides. The probe also found the real discriminator: two columns are
  a **stack** (fragments sharing a left edge with nothing between them), while a single line's words are
  separated by an inserted space fragment. The detector now requires both signals.
- The regression probe was written and observed **RED before any production change**: the left-column click
  copied `columna izquierda uno columna derecha uno columna izquierda dos columna derecha dos`, exactly the
  defect the independent verification reported. It passes now.
- **Two wrong turns, recorded because they cost real time and the pattern is worth recognising.**
  1. I first wrote a `columnsOf` wrapper with a stub `sorted()` and a `groupLines` returning `[]`. It was
     structure invented before the design was settled, and it had to be deleted wholesale. The working version
     reuses the existing grouping loop unchanged, which is what the first attempt should have done.
  2. I then added a `laysOut` candidate filter that never matched anything. Instrumenting the loop by hand,
     instead of forming a third hypothesis, showed the reason exactly: for the correct cut the lines **end
     137pt away from it**, so "a line must start or end near the cut" was simply the wrong condition. The
     filter was both wrong and unnecessary, because `isCut` already requires that no fragment crosses.
- Coverage lesson, recorded because it nearly slipped through: the first working version dropped `src/core`
  from 100% to 96% branch coverage. The uncovered branches were **defensive guards I had written and never
  needed**, plus one real behaviour (`LineBuilder`'s inner-column bounds). The guards were deleted rather than
  tested — the fifth time in this project — and the real behaviour is now covered by the new `ColumnDetector`
  unit tests. Coverage is back at 100% on all four metrics and the test count went from 185 to 192.
- Evidence: `vitest run` **191 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `vite build` 0, `src/core` 100% statements and branches, `pnpm test:browser` 7/7, no comments in source.
- **Not yet verified by anyone but me.** This is my own fix checked by my own tests. T19 exists to have it
  independently confirmed, and until then the honest claim is "the regression probe passes", not "the blocker
  is gone".

**L35** (T15 closed — the compound-hyphen blocker is fixed. Evidence, and the calibration that made it work.)
- Fix: `TextAssembler` now decides a hyphenated line break with **two** rules instead of one. A hyphen is
  dropped only when it is the one the line break itself put between a stem and its continuation, and it is
  **kept** when the word before it is a known compound prefix. Files: `src/core/text/TextAssembler.ts` and
  its tests, `src/core/constants/COMPOUND_PREFIXES.ts`, `src/core/constants/index.ts`,
  `tests/fixtures/PdfFixtureFactory.ts` (`hyphenCompound`), `tests/hyphenCompound.test.ts`.
- Regression probe written and observed **RED before any production change**:
  `El acuerdo fue francoaleman y beneficioso` for `franco-` + `aleman`, exactly the defect the independent
  verification reported. It now yields `franco-aleman`, while `extra-` + `ordinario` still yields
  `extraordinario` and `co-` + `operar` still yields `cooperar`.
- **The honest shape of this fix: it is calibrated, not correct.** `co-` is genuinely ambiguous between the
  Latin prefix and the ordinary start of a word, and no prefix list can tell them apart. The first draft
  listed the Latin prepositions (`ex`, `anti`, `pro`, `co`, `pre`, `post`…) and **broke the existing
  `cooperar` case**. The shipped list keeps only what is unambiguously a compound — `franco`, `anglo`,
  `hispano`, `italo`, `bien`, `mal`, `tipo` — and therefore **deliberately lets a genuine `ex-alumno` weld
  into `exalumno`**. That is a known wrong answer chosen over a regression, and it belongs in the README
  rather than in a comment.
- Ordering matters and the tests pin it: the compound rule is evaluated **before** the weld rule, because
  the weld rule matches any hyphen followed by a lowercase letter and would otherwise always win.
- Four mutations, three caught and **one deliberately not**:
  - forcing the old always-weld behaviour → the compound e2e test;
  - emptying the compound list → the same test;
  - using the whole line instead of its last word as the stem → the same test;
  - removing the `\p{L}` guard before the hyphen → **survives**, and measurement showed why: that guard is
    unreachable as a false condition, since reaching that branch means the weld rule already failed. It was
    a redundant guard, deleted rather than tested. That is the **seventh** time in this project.
- A test was added for behaviour that was correct but unpinned (`lo llamo franco -` must keep its spaced
  dash), and it is worth keeping even though it cannot fail: it documents a decision, not a defect.
- Ordering lesson from the whole round: the first two attempts were wrong because I reasoned about the
  *string* the assembler had already built instead of preserving the **fact that a line break happened**.
  Once `joinLines` carried the previous line explicitly, both rules became expressible. The same mistake
  appeared in T14 with a filter on a condition nobody measured.
- Evidence: `vitest run` **196 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `vite build` 0, `src/core` 100% on all four metrics, `pnpm test:browser` 7/7, no comments in source.
- **Still not verified by anyone but me.** T19 covers this and T14 together.

**L36** (T18 closed, and T16 + T17 delegated in parallel): `README.md` now states what the coverage
number actually measures and what it does not.
- Corrected a **false statement**: the suspicious-join signal was described as needing a content scale
  "above about 2". Independent measurement put it near **1.1**. The wording had been carried forward from
  L27 without being re-measured, which is the same failure mode as the CSP claim in L31.
- Added the **new known limitation** that the hyphen fix deliberately creates: a real compound with a short
  Latin prefix welds, so `ex-alumno` becomes `exalumno`. Written as a deliberate wrong answer, with the
  reason — `co` is indistinguishable from the ordinary start of a word, and including it broke `cooperar` —
  rather than as an unexplained defect.
- Added a **"What the coverage number means"** section, because the project has been quoting "100%" in a way
  that invites the wrong conclusion: the `include` is scoped to `src/core/**`, so the number says nothing
  about `src/ui/`, and that is why `pnpm test:browser` exists. Also states plainly that **branch coverage is
  not mutation coverage**, using this project's own case: 100% branches while two boundary comparisons could
  be flipped freely.
- Records that two columns are now segmented, since that changed in L34 and the README still implied the
  opposite by omission.
- T16 and T17 are deliberately run as **two writers in parallel**, with disjoint allowed surfaces. The
  runtime enforced that disjointness and rejected the first T17 launch, which had claimed `src/ui/**` and
  overlapped T16's `src/ui/BlockHitTester.test.ts`. The surface was narrowed to what the task actually needs
  rather than the overlap being negotiated away, and this is the first time in the project that parallel
  writers were authorised: T16 is test-quality work in three files, T17 is the browser harness, and neither
  reads the other's output.

**L37** (T16 closed, verified by the parent after delegation): the three holes that let real defects through are
closed. Files: `tests/PdfDocumentLoader.test.ts`, `src/core/layout/BlockBuilder.test.ts`,
`src/ui/BlockHitTester.test.ts`. **No source changed.**
- The hollow test now asserts the bundled worker URL instead of non-emptiness. **Verified by the parent**, not
  taken from the report: replacing the default with `'WRONG-WORKER-URL'` fails exactly
  `falls back to the bundled worker URL when none is injected`, and `PdfDocumentLoader.ts` was restored to
  hash `a3325097f72943cb061815de9e611ea58dd029218c15022b42503616f3b0e631`.
- Both surviving boundary mutations are now pinned, and the parent re-ran both: the `BlockBuilder` gap `>` to
  `>=` fails `keeps lines whose gap equals the paragraph leading in one block`, and `BlockHitTester`'s bottom
  `>=` to `>` fails `returns the block for a click exactly on its bottom edge`. Both source files came back
  identical to the committed version.
- The two boundaries are **not the same kind of decision**, and the difference is worth keeping: the gap
  boundary is **arbitrary** — 1.6x is a heuristic and the tie at exactly the threshold has no principled
  answer — while the hit-test boundary is **principled**, because `block.bottom` is the baseline of the last
  line and therefore part of the paragraph a user is pointing at. Pinning an arbitrary boundary is still
  worth doing, but calling it arbitrary is the honest framing.
- **Five more boundaries of the same class are reported and deliberately not fixed**: `BlockBuilder`'s font
  size and indent comparisons, and `BlockHitTester`'s left, right and top edges. They are left open as a
  scoping decision rather than silently absorbed, which is what the delegation asked for.
- The writer's own verification, kept as corroboration rather than as proof: 198 passed / 1 skipped, `tsc` 0,
  `eslint` 0, `prettier --check` clean, `vite build` 0, `src/core` 100% on all four metrics, no comments in the
  three changed files.
- Note the shape of this task: it is a **test-quality** task with no behaviour change, and the parent verified
  it by re-running the mutations rather than by reading the diff. A test that pins nothing looks identical to a
  test that pins everything until you try to break it.

**L38** (T17 closed — the false claim is now true, and verified by observation rather than by reading config).
- The defect: `tests/browser/verify-browser.ts` started its own static server that wrote **only** `content-type`
  (line 38), so the security headers from `netlify.toml` were never applied. The claim that `preview.headers`
  made the browser check exercise the CSP was therefore false, as the independent verification had already
  reported by probing a response.
- Fix: `tests/browser/NetlifyHeaderReader.ts` parses `netlify.toml`, the static server applies the matching
  rules per path, and a new check **asserts the headers are present on the response**:
  `the served document carries the security headers`. `vite.config.ts` no longer keeps its own copy of the
  policy; it reads the same `netlify.toml` through the same reader, so the two cannot drift. There is now
  **one** declaration and **one** presence assertion, where there used to be two declarations and none.
- Evidence, observed rather than inferred: `pnpm test:browser` is **8/8 PASS** with the headers actually
  applied, which also proves for the first time that the app runs **under** the policy — worker, wasm, blob
  URL, text layer and clipboard all still work with it in force. The new check bites: removing the headers
  from the server fails it with `content-security-policy missing or unexpected: absent`.
- The delegated writer for this task **failed with no output and left the tree completely clean**, so nothing
  was half-applied. The parent took the task inline. Recorded because a failed delegation is not a failed
  task, and the honest thing is to say which one it was.
- **Unrelated files appeared in the working tree during this work** — `DESIGN.md`, `code.html`, `screen.png`,
  all untracked and all created at 15:08 while this session was running. They are not mine, they are a design
  system and a screenshot, and they are **left alone**: not committed, not formatted, not deleted. Their
  presence made the repository-wide `format:check` fail, so formatting was verified against this task's own
  files instead of reporting a false failure. Whoever created them should decide their fate.
- Still unverified, by definition: the **real Netlify deploy**. The policy is now exercised locally against the
  same source of truth, which is strictly more than before, but no header has been observed on a Netlify
  response and `docs/netlify-deploy.md` keeps telling the user to watch the console on that first deploy.

**L39** (user request, verbatim): *"agrega la nueva tarea que puse que es de code desdign y screen, es el mockup de lo que quiero que se vea, analizo y dime si toca agregar nuevos todos"*
- Analysed `DESIGN.md`, `code.html` and `screen.png`. They are **not** style-only: the mockup carries product
  behaviour the app does not have. Five tasks added, T20 to T24, and spec **S9** for the design system.
- What the mockup specifies and what exists today:

  | Mockup | Today |
  | --- | --- |
  | three panels: sections / viewer / extracted text | viewer plus one side panel |
  | section cards with a text preview and page number | a list of section titles |
  | top bar: file name, size, `Pag. n de m`, zoom, load button | a dropzone |
  | right panel with Plain and Markdown views and a word count | one copy control |
  | active section highlighted on the PDF with a floating label | nothing |
  | design system: sage/slate palette, Newsreader + Manrope, glass surfaces | ad-hoc Tailwind values |

- **The finding that matters: `code.html` simulates the PDF as styled HTML** (`sheet-doc-title`,
  `sheet-header`, `sheet-footer`). Our viewer renders the real document with a canvas and pdf.js's text layer,
  so the active-section highlight cannot be copied from the mockup: it has to be derived from real geometry.
  The infrastructure exists — `SectionBuilder` blocks in PDF user space, mapped through the same
  `CoordinateMapper` that click-to-copy already uses — but it is new work, not a restyle.
- **Markdown is new behaviour**, not a style. Headings, paragraphs and lists have to be emitted from the block
  and section models that already exist.
- Placeholder copy is not adopted: `DocuExtract AI`, `Engine v2.4` and the fictional report stay in the mockup.
  The app keeps its own honest wording, and the copy is Spanish per L5.
- **T19 is sequenced before the redesign on purpose.** T14 to T17 changed extraction behaviour; the redesign
  only redraws it. Verifying extraction first makes a T24 failure a layout failure rather than an ambiguous one.
- Constraint recorded for the redesign: the extractor's honest states — no text layer, encrypted file,
  oversized file, the quality report — must survive it. A prettier shell that hides them would be a regression.
- The three mockup files stay **untracked and unedited** pending the user's decision on whether they belong in
  the repository at all, given that `screen.png` alone is 393 KB.

**L40** (T19 — verification of T14 to T17. **This one is not independent, and that is stated rather than glossed.**)
- The delegated verifier failed twice with no output and touched nothing, which is why it is not here. Rather
  than retry a third time, the parent ran the verification itself. That makes it **self-verification**: it is
  weaker evidence than L31 was, and it is recorded as such so nobody later reads this entry as an outside
  check. The pending independent pass is worth doing when a verifier is available again.
- Claims confirmed by mutation, not by reading: the worker-URL test fails on a wrong default; `BlockBuilder`'s
  gap `>` to `>=` fails `keeps lines whose gap equals the paragraph leading in one block`; `BlockHitTester`'s
  bottom `>=` to `>` fails `returns the block for a click exactly on its bottom edge`. All source files were
  restored byte-identical and the suite returned to 198.
- Adversarial probing of T14, through the real pipeline:
  - **three columns → correct.** `A uno A dos` / `B uno B dos` / `C uno C dos`, three separate columns.
  - **a full-width heading above two columns → correct.** The heading stays one block and the two columns stay
    separate, which is the case most likely to break a naive cut detector.
  - **a wide table with a large internal gap → WRONG.** `Concepto Importe Ingresos 1.250 Costes 840` comes out
    as a **single line**: the detector sees a wide internal whitespace column between the two halves of the
    table and treats it as a column cut, and then each row stops being a line. Recorded as its own task, since a
    table is a normal thing to find in a PDF and this is the same class of defect as the one T14 fixed.
- Adversarial probing of T15:
  - `franco-` + `aleman` → `franco-aleman`; `co-` + `operar` → `cooperar`. Both correct.
  - `casa-` + `miento` → `casamiento`; `pasa-` + `porte` → `pasaporte`. Correct: they weld, as they should.
  - **`tela-` + `rama` → `telarama`, which is wrong.** The word should be hyphenated. It welds only because
    `tela` is not in the prefix list, and adding every such word is not possible. This is the same calibration
    limit already recorded in L35 and now demonstrated with a concrete case.
- The honest conclusion: **the two blockers are fixed for the cases that were reported, and both fixes have a
  known edge the fixtures do not cover.** T14 fails on tables; T15 fails on compounds outside its list. Neither
  is a regression, and neither is silent, because both are now named.

**L41** (the wide-table defect found in L40 is fixed. Evidence, and the measurement that located it.)
- The defect: a two-column table came out as one line, `Concepto Importe Ingresos 1.250 Costes 840`.
- **Measured before touching anything**, which is what turned a guess into a fix. The raw fragments say
  exactly what pdf.js did:

  ```
  "Concepto" x=72.0  w=51.4
  " "        x=123.4 w=276.6   <- one whitespace run covering the whole table gap
  "Importe"  x=400.0 w=40.7
  ```

  Two things follow, and both changed the plan. First, **the lines were already correct**:
  `["Concepto Importe", "Ingresos 1.250", "Costes 840"]` is exactly the right set of rows, so the line layer
  needed nothing. Second, the fault was one layer up, in `BlockBuilder`, merging three good rows into one
  paragraph. Fixing the column detector — the obvious suspect, and where I would have wasted the time — would
  have been wrong.
- The signal, now its own class: **a line whose printed runs are separated by more than four times the font
  size is a table row, not prose.** Whitespace runs are excluded from the measurement, otherwise the 276pt
  space fragment would be read as the gap itself rather than as the hole it fills.
- Files: `src/core/layout/TableRowDetector.ts` and its 7 tests, `src/core/constants/TABLE_GAP_RATIO.ts`,
  `src/core/models/table.ts`, `tests/fixtures/PdfFixtureFactory.ts` (`twoColumnTable`) and a permanent
  end-to-end test in `tests/extraction.test.ts`.
- The permanent test asserts the **exact three rows**, not a count, and it was verified to bite: disabling the
  detector in `BlockBuilder` fails it, pushing the threshold to infinity fails it plus four unit tests, and
  measuring including the whitespace runs fails it plus two more.
- Two of my own test expectations were wrong on first write (a 38pt gap against a 40pt threshold, and a case
  meant to be true that was false). Both were arithmetic mistakes in the test, found by working the numbers by
  hand, and corrected rather than by loosening the assertion.
- Evidence: `vitest run` **235 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, and `src/core` at **100% on all four metrics** (314/314 statements, 150/150 branches).
- `pnpm test:browser` is at **7 of 8**: the rotated-page check is still red and belongs to T24.

**L42** (rotated text layer: the real mechanism identified, one real bug fixed, and one attempt reverted.)
- The official rules were fetched from `pdf.js/web/pdf_viewer.css` and `text_layer_builder.css` with the
  user's authorization. They settled a question two guesses had failed to answer.
- **Real bug found and kept: my rotation rules declared a `transform-origin` the official rules do not have.**
  pdf.js relies on the default origin; my `transform-origin: 100% 0 / 50% 50% / 0 0` overrode it. Removing
  them moved the span from `(1520, -320)` to `(728, 471)`, from outside the canvas to inside it. **The earlier
  selector fix was also real**: `.textLayer [data-main-rotation]` was a descendant selector while pdf.js puts
  the attribute on the `.textLayer` element itself, and correcting it changed the span from `100x16` to
  `16x100`. Two independent defects in the same three lines of CSS, and neither had ever been verified.
- **The remaining blocker is structural, not stylistic, and is now measured rather than guessed:**

  | | visual box |
  | --- | --- |
  | canvas | 792 x 612 (already rotated) |
  | `.textLayer` | 612 x 792 (rotated by CSS) |

  The canvas and the text layer disagree because our renderer asks pdf.js for the **rotated** viewport and
  paints the rotated bitmap, while pdf.js positions its spans against `rawDims` — the **unrotated**
  dimensions — and expects its own CSS to rotate the layer into place. Both approaches are self-consistent;
  mixing them is not.
- **An attempt to fix it by sizing the text layer from the unrotated viewport was reverted.** It produced a
  zero-sized layer and, worse, **broke the click-to-copy check that had been passing**, turning a 7-of-8 into
  something worse. The attempt was made while running low on context, which is exactly when a structural
  change to the viewer should not be started. It was reverted in full and the suite confirmed back at
  **235 passed / 1 skipped** with `pnpm test:browser` at 7 of 8 and click-to-copy green again.
- The honest state: **T24 stays open with one failing check**, and the reason is understood precisely. The
  fix is to pick one of the two consistent models — either render unrotated and rotate the page container, or
  stop relying on pdf.js's rotation CSS and position spans against a rotated viewport — and that is a
  deliberate piece of work, not a CSS tweak. Writing it down beats a third guess.

**L43** (the rotation problem solved, with option (b) chosen by the user: stop relying on pdf.js's rotation CSS.)
- The measurement in L42 said the two models disagreed: the canvas painted already rotated at 792x612 while
  css rotated the text layer into 612x792. **The fix was to stop having two models.** pdf.js's `TextLayer` is
  gone from this viewer; the spans are now placed from our own geometry against the **rotated** viewport, so
  nothing needs rotating after the fact and the `[data-main-rotation]` rules are deleted outright.
- Simpler than expected, and the reason is worth recording: **page rotation is always a multiple of 90
  degrees**, so a mapped fragment box stays axis aligned. Mapping two opposite corners through the existing
  `CoordinateMapper` is therefore enough, with no per-span css transform and no rotation bookkeeping. That is
  the whole trick.
- `TextLayerBuilder` is a class taking the container, the fragments, the mapper and the scale, with 6 tests:
  one span per non-empty fragment, the y-down flip, the quarter-turn case asserting a 10x20 box, font scaling,
  and container replacement. `PageRenderer` lost its `TextLayer` and its `getTextContent` call, so a page is
  also cheaper to render now. `PdfPageView` builds the layer in an effect from `page.model.fragments`.
- **`pnpm test:browser` is 8 of 8, the first time every check has passed.** The rotated-page check is green.
- Two real defects in that same css were fixed along the way and are kept: the descendant selector
  (`.textLayer [data-main-rotation]` against an attribute pdf.js puts on `.textLayer` itself) and a
  `transform-origin` the official rules do not have. **Both had shipped unverified**, and both were found only
  because the harness was made to apply the real headers and the checks were actually run.
- Evidence: `vitest run` **241 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `src/core` at **100% on all four metrics**, no comments in source, `pnpm test:browser` **8/8**.
- Note on the earlier failure, kept because it is the useful part: the reverted attempt at this same problem
  broke the click-to-copy check and was reverted in full. It was made while running low on context, which is
  exactly when a structural change to the viewer should not be started. Choosing the model first, with fresh
  context, is what made it small.

**L44** (user request, verbatim): *"Agregue un nuevo diseño para la parte de la bienbenida, revisala y agrega las
tareas para agregar"*
- `screen.png` and `code.html` came back as **updated versions** (322 KB against 393 KB, 44.7 KB against
  43.5 KB) and are now a **welcome landing page**, not a viewer mockup. The previous two files had been
  deleted on the user's instruction; these are new, so the old decision does not carry over.
- **The copy audit is the finding that matters, and it is the reason this is a task list rather than an
  implementation.** The mockup promises things this product cannot do:

  | Mockup says | Reality |
  | --- | --- |
  | `NUEVO MOTOR NEURONAL V2.4` | There is **no neural network**. Segmentation is geometric heuristics |
  | `OCR sin alterar tus fuentes` | There is **no OCR at all**; it is an explicit non-goal from L2 |
  | `Cifrado en reposo` | Nothing is stored, so there is nothing to encrypt |
  | `hasta 25 MB` | The shipped guard is **100 MB** |
  | `Análisis < 3,5s` | Unverified, and it depends entirely on the document |
  | `DocuExtract AI` | The product is *Extractor de texto PDF* |
  | `tus archivos nunca se emplean para entrenar modelos públicos` | True, but it implies a model exists |

  Shipping that copy would put a false claim on the first screen a user ever sees, which is the opposite of
  the honest-state discipline this project has followed from L29 onward. **The layout is adopted; the claims
  are rewritten to what the code actually does.**
- **The most valuable idea in the mockup, and the one worth building properly: the `Simulación interactiva`
  section.** Its three panels — process state, page scan, structured output — are the step animation the user
  asked for earlier, and they can be driven by **real state** rather than faked: the real extraction progress,
  the real rendered canvas of the page being read, and the real sections and Markdown produced. A canned
  animation would look the same and teach the user nothing; a real one is honest and costs the same.
- What is genuinely adoptable as designed: the hero structure (badge, headline, subhead, three feature chips),
  the dropzone card with a primary and a secondary action, the three `Pilares del flujo` cards, the privacy
  banner, and the footer with a navigation row.
- The two mockup files stay **untracked and unedited**, pending the same decision as before.

**L45** (user instruction, verbatim): *"lo del mockup solo era una idea para que armaras la landing, usalo y
acomdolao a lo que tenemos, no tiene que ser tal cual lo dice ahi; borralos"*
- `code.html` and `screen.png` are **deleted**, and this time the decision is settled rather than pending:
  both were references for a layout, not specifications. `DESIGN.md` stays because it holds the tokens the
  interface actually consumes.
- **The copy question of L44 is answered: the mockup's claims were never meant literally.** That removes the
  product-positioning dilemma — there is nothing to reconcile, because nothing in the mockup was a promise.
  The landing is built from its **structure** and written with the app's own honest wording, in Spanish.
- What that means for the tasks, concretely:
  - T26 keeps the hero shape (badge, headline, subhead, chips) and **drops the neural-engine badge entirely**
    rather than finding a truthful replacement for a claim that was never intended.
  - T27 keeps the two actions; the limits and the accepted formats are the real ones, and OCR is not named
    because **there is no OCR**.
  - T28 keeps the three-panel live flow, which was the genuinely good idea in the mockup and becomes real
    state instead of a canned animation.
  - T29 keeps the pillars, the privacy banner and the footer, worded to what the code does.
- The mockup's own price: it caused this project to spend a full round auditing copy that turned out to be
  placeholder. Recorded so the next reference image is understood as a reference from the start.

**L46** (T25 closed — the render race. This was the bug behind "el PDF no carga", and it was worse than
diagnosed: it was never only a development problem.)
- **The fix, and why it is small:** `PageRenderer` now hands pdf.js a **canvas of its own** and copies the
  finished bitmap onto the visible canvas with `drawImage`. Two renders that overlap therefore never touch the
  same canvas, so pdf.js has nothing to refuse. No signature changed, no component changed, no ref changed.
  That is the whole fix.
- This replaced an earlier attempt that serialised renders through a `WeakMap`: it **had the same class of
  defect as the bug it was fixing** — a TOCTOU, because it registered the in-flight render after an `await`,
  so both calls passed the check before either registered. Fixed to register synchronously, then reverted
  anyway because the canvas-per-render approach removes the race by construction instead of coordinating it.
  Coordinating a race is the weaker design.
- **The finding that matters more than the fix: this race also caused the two unexplained browser failures in
  production.** The harness uploads several PDFs in one session; each upload replaces `document`, `PdfPage`'s
  effect re-runs, and a new render began while the previous one was still in flight on the same canvas. pdf.js
  refused, the canvas came back blank, and the click-to-copy check timed out behind it. What looked like a
  harness timing problem was **the same bug**, and the fix took the browser check from 6 of 8 back to **8 of 8**.
- **Verified in `pnpm dev`, which is the point**, because that is where the user hit it and where the browser
  check cannot look: canvas 612x792 with 1370 painted pixels, 2 text-layer spans, **no alert**, and
  `Preparando la página` absent. Production is also confirmed: `pnpm test:browser` **8 of 8**.
- A minor finding, recorded and not fixed: the dev run logs one **404** for an unnamed resource. Nothing in the
  checks depends on it and I did not identify it, so it is written down rather than guessed at.
- Evidence: `vitest run` **243 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `src/core` at **100% on all four metrics**, no comments, `pnpm test:browser` **8 of 8**.
- Two of my own test doubles were wrong on first write and both were the same mistake: a fake page that
  mutated the canvas size and a guard keyed per page instance instead of per canvas. **pdf.js guards per
  canvas**; a double that guards per instance cannot show whether the fix works.

**L47** (T26 closed — the welcome hero, built from the mockup's shape and written with the app's own wording.)
- Files: `src/ui/HeroPanel.tsx` and its 4 tests, `src/ui/constants/HERO_COPY.ts`,
  `src/ui/constants/HERO_FEATURES.ts`, `src/ui/models/hero.ts`, both barrels, and one line in `App.tsx`.
- Honest copy, which is the whole point: the badge says **`Todo ocurre en tu navegador`** rather than a neural
  engine, the headline is **`Copiá texto de un PDF sin separar las palabras a mano`**, and the three chips are
  things the code does — section detection, plain or Markdown output, and nothing leaving the machine. The
  mockup's `NUEVO MOTOR NEURONAL V2.4` was **dropped, not replaced**: there was never a claim to restate.
- **A test states the honesty as a rule rather than trusting it**: `does not claim a neural engine, OCR or
  encryption that the app does not have` fails if the words neuronal, OCR or cifrado ever appear in this
  component. The rest of the mockup's copy cannot creep back in unnoticed.
- **Deliberately did NOT remove the drop zone**, even though it is coming out in T30. Last time three layout
  changes went in together and two broke; this time the hero was added **above** the drop zone, so the file
  input never left the DOM and the top bar's load button kept working. One change, verified, then the next.
- Verified in **both** environments, because production alone would not have caught the earlier failure:
  `pnpm test:browser` **8 of 8**, and a dev probe showing the hero heading, 3 chips, **exactly 1 file input**
  before upload, and afterwards a 612x792 canvas with 677 painted pixels, 1 text span, no `Preparando` state
  and the hero gone.
- Evidence: `vitest run` **247 passed / 1 skipped**, `tsc` 0, `eslint` 0, `prettier --check` clean,
  `vite build` 0.

**L48** (T35 decided by the user, verbatim: *"la a"*): **selecting a section and copying it become two separate
actions.** A click on a section card selects and highlights it; copying moves to its own control, as the mockup
had it. Copiar sin querer es peor que copiar a propósito, y con la separación el resaltado pasa a ser algo que
se mira en vez de un efecto secundario de hacer clic.

**L49** (handoff note, written while the session still has context to spare):
- **The work is not committed.** Everything since `99746cf` lives in the working tree only. A new session finds
  it on disk, so nothing is lost, but nothing is durable either. **Committing before switching is the single
  highest-value action available**, and it is the user's call.
- Where a new session should start reading, in this order: this document up to `## Log` (**L1 to L49 carry every
  diagnosis**), then `git status` for what is uncommitted, then the todo list.
- The live threads, in the order they should be picked up:
  1. **T34 — heading detection misses bold-only headings.** The root cause of the user's whole feedback round:
     with no heading detected there is one untitled section, which makes Markdown identical to plain text (T33)
     and makes one click highlight the entire document (T35).
  2. **T35 — separate selecting from copying**, decided in L48.
  3. **T36 — the selected card does not look selected.**
  4. **T32 together with T30** — hiding the drop zone requires giving the top bar its own file input first;
     doing it the other way round is what broke the canvas earlier.
  5. Then T27, T28, T29, T31, and the still-pending T29 (the five unpinned boundaries) and the `tela-` + `rama`
     finding.
- **What must not be forgotten when picking this up:** `pnpm test:browser` is the only check that sees the
  canvas, the pdf.js text layer and the real clipboard, and it runs against the **production** build. The
  StrictMode render race in L46 was invisible to it and only a dev-mode probe found it. **Verify in both.**

**L50** (T34 closed — bold-only headings are now detected. The signal was measured, not assumed.)
- **The premise in T34's own description needed correcting.** It says "pdf.js exposes no font weight", and that
  is true of `getTextContent()`, which returns an opaque per-document font handle (`g_d0_f1`, `g_d0_f2`,
  `g_d0_f3` for three embedded standard fonts in one probe). But an opaque handle is still **a distinction**:
  bold text uses a different font resource than body text, so the handle differs even when the size does not.
  A probe over a generated PDF with a 12pt HelveticaBold heading over 12pt Helvetica body showed the heading
  as its own block with handle `g_d0_f1` against the body's `g_d0_f2`. The feet-on-the-ground probe beat the
  note, which is why the note was probed before it was built on.
- **The signal shipped** is: a block whose font size is not below the body size, whose assembled text is at most
  `HEADING_MAXIMUM_WORDS` (8) words, and every one of whose non-empty fragments uses a font handle different
  from the body's dominant handle, is a heading. The body's dominant font is the mode by fragment count, the
  same shape as the existing body-size mode. Files: `src/core/layout/SectionBuilder.ts`,
  `src/core/constants/HEADING_MAXIMUM_WORDS.ts`, both barrels, and the `BlockFactory`/tests.
- **Centring and vertical spacing from the task text were deliberately not used.** Centring needs a page width
  that `SectionBuilder` does not receive, and the vertical gap is already consumed by `BlockBuilder` when it
  decides block boundaries, so neither is available at this layer without widening the model. The font-handle
  signal is strictly more local and needs no new input.
- **The single-line guard was written and then deleted.** The project's recurring pattern — a defensive guard
  that no test can fail is not a guard. A mutation that re-required one line was caught by nothing, because
  the word cap already excludes the long passage the line guard was meant to exclude. Deleting it also lets a
  bold heading that wraps onto two lines still be detected, which the line guard would have silently missed.
  A test now pins that wrapped case instead.
- **Five mutations, all caught.** Disabling the whole rule → 3 tests; removing the word cap → 2; re-adding the
  one-line guard → the wrapped-heading test; ignoring the font distinction → 3. Restored byte-identical each
  time. The two new tests that exist only to keep coverage honest (a small note in another font and a blank
  block) pin the two branches that were uncovered on the first pass.
- Coverage went from 100% to 99.4% and back: the new `block.fontSize < bodySize` branch and the
  `fonts.length > 0` guard were uncovered, and both are real behaviour, so both got a test rather than a
  deletion. The `fonts.length > 0` guard is not decoration: `[].every(...)` is `true`, so without it a block
  with no text would classify as a heading.
- Evidence: `vitest run` **254 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean on every file this task touched, `vite build` 0, `src/core` at **100% on all four metrics**
  (347/347 statements, 166/166 branches).
- **Verified in both environments, as L49 demanded.** Production: `pnpm test:browser` **9 of 9 PASS**, the new
  check being "the side panel lists a heading that only differs from the body by its font". Development: a
  probe against the dev server showed both bold headings in the panel, a 612x792 canvas with 3318 painted
  pixels, and no stuck "Preparando" state. The dev probe's one console 404 is the pre-existing unnamed
  resource already recorded in L46.

**L51** (environment findings recorded while T34 ran; neither is caused by T34.)
- **Engram is broken by a version mismatch, and that is why memory is unavailable in this session.** The
  running server is `engram 3.1.0` (pid on port 7437, `/health` answers with `version: 3.1.0`), while the
  `gentle-engram` 0.6.0 Pi plugin expects the `engram.pi-http-runtime/v1` contract at `/runtime-contract`.
  That route returns **404** on 3.1.0; the plugin rejects the runtime and blocks every memory dispatch, which
  is the failure the user had been told about. The Homebrew tap already offers **3.6.0**, which is where the
  route exists. The fix is `brew upgrade engram` (or the tap formula) and a server restart, but it is a
  machine-level change and was **not performed without authorization**.
- **`src/ui/constants/HERO_COPY.ts` is committed and does not pass `prettier --check`.** `HERO_NOTE` is 104
  characters on one line against a print width of 100; Prettier wants it wrapped. The commit `6e3ee73`
  message claims formatting was clean, so this is a false claim in that message.
- **A second file from the same commit fails the same way: `DESIGN.md`.** So `pnpm format:check` is red on the
  clean tree for **two** files, both landed by `6e3ee73`, and neither is touched by T34–T36. Left untouched
  here because they are unrelated and the rule is one change at a time; each needs its own formatting fix.

**L52** (T35 closed — selecting and copying are two actions, and the highlight is the heading only.)
- **The highlight style was asked, not assumed.** T35 names three candidates and L48 only settles select-vs-copy, so
  the remaining visual choice went to the user, who picked "highlight the section's heading only". The floating
  label already sat on the first block, so this reads as the section and stops competing with the body text.
- **The two actions are now separate.** Clicking a card calls `onSelectSection`; each card carries its own
  `Copiar` control that calls `onCopySection`. `App` no longer toggles the selection from the copy path, and the
  hook/pipeline gained `sectionHeadingBlock`, so the highlight is exactly the heading block instead of the whole
  body. Files: `src/ui/OutlinePanel.tsx`, `src/App.tsx`, `src/ui/usePdfDocument.ts`,
  `src/ui/PdfDocumentSession.ts`, and their tests.
- **The card could not hold a nested button.** The old card *was* a `<button>`, so a copy `<button>` inside it
  would be invalid HTML; the card is now a bordered `<div>` wrapping a selection button and, below it, the copy
  control. That is why every `OutlinePanel` test was rewritten rather than adjusted: the queries had to stop
  matching a card by the heading, because the copy control's label also names it. Selection is matched with
  `/^Introducción/` and copy with its exact label.
- **Two mutations, both caught.** Making the card click also copy fails "selects a section without copying it";
  making the copy control also select fails "copies a section through its own control without selecting it".
  This task was not run strictly test-first — the tests and the component were written together — so the
  mutations are the substitute evidence that the tests actually pin the split, and that is stated rather than
  hidden.
- **Honest limitation:** a section with no detected heading (the preamble, shown as "Sin título") has nothing to
  outline, so selecting it highlights nothing. That is the correct consequence of heading-only highlighting and
  is recorded rather than worked around with a silent fallback.
- Evidence: `vitest run` **255 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `src/core` still at **100% on all four metrics**, `pnpm test:browser` **10 of 10 PASS** with the new
  check "selecting a section highlights only its heading, not every paragraph", and a dev probe showing exactly
  **1** highlight box with the label "Sección activa: Seccion uno".

**L53** (T36 closed — the selected card is unmistakable, and the check to prove it found a stale-selection bug.)
- **Test-first, RED observed.** The new component test asserts `Seleccionada` is absent before the click and present
  after it; against the unmodified component it failed with `Unable to find an element with the text:
  Seleccionada`, which is the RED. A mutation that removes the marker brings it back to 1 failed, so the test
  pins the marker and not the surrounding markup.
- **What the selected card now carries:** a `ring-2` halo, a heavier background wash, the heading in primary
  typography, and a visible `Seleccionada` pill next to the page number. All four together, because the task is
  explicit that a border tint alone did not read. Files: `src/ui/OutlinePanel.tsx` and its test.
- **The production check caught a real bug on its first run, and the bug was not in the marker.** My first
  version of the check re-uploaded the *same* fixture the previous check had used and then clicked the card.
  The production run went `FAIL ... Waiting failed: 10000ms exceeded`, while the dev probe and the unit test
  were green. The reason: `App` never reset `activeSection` when a document changed, so the previous check's
  selection was still index 0 and the click **toggled it off**. That is a genuine defect — loading a different
  PDF could highlight a stale section index in the new document — not merely a test artifact.
- **Two fixes, and the distinction matters.** The application now calls `setActiveSection(null)` in the same
  document-change block that already resets the page. The check was also made independent of run order by
  uploading a *different* fixture, so a green result does not depend on what the previous check left behind.
  With both, production is **11 of 11 PASS** including "the selected section card is visibly marked as
  selected".
- **Honest note on where each half was observed:** the visual marker was verified in dev (marker absent before
  the click, exactly 1 after, `ring-2` present, `aria-current` true) and in production; the stale-selection
  reset was only observable through the production harness, because the dev probe used a single upload. It is
  not claimed for dev.
- Evidence: `vitest run` **256 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `src/core` at **100% on all four metrics**, `pnpm test:browser` **11 of 11 PASS**.

**L54** (T30 + T32 closed together, as the task demanded — the drop zone leaves when the document arrives.)
- **They landed in one work unit on purpose.** Hiding the drop zone without first giving the top bar its own file
  input is exactly what broke the canvas in an earlier round, so the two are inseparable and share one commit.
- **The top bar now owns its file input.** `TopBar` takes `onFile` instead of `onLoad`, holds a ref to its own
  hidden `<input type="file">`, and the `Cargar PDF` button clicks that ref. `App` no longer reaches into
  `window.document` for `input[type="file"]`, which was the coupling that would have broken the moment the drop
  zone unmounted.
- **The drop zone renders only when there is no document and nothing is loading:**
  `{!showDocument && status !== 'loading' ? <Dropzone … /> : null}`. It still shows after an error, so a failed
  file can be retried from the page.
- **Test-first, RED observed.** `TopBar.test.tsx` failed twice against the old component (no file input, so
  `Unable to find a label with the text of: Cargar PDF`). The loading state is pinned in `App.test.tsx` with the
  hook mocked, which is the only way to drive `status: 'loading'` in jsdom. Mutation: dropping the
  `status !== 'loading'` guard fails "hides the drop zone while a document is loading".
- Evidence: `vitest run` **259 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0, `prettier --check`
  clean, `src/core` at **100% on all four metrics**, `pnpm test:browser` **12 of 12 PASS** with the new check
  "the drop zone goes away once a document is loaded".
- **Dev probe:** before loading there are **2** file inputs and the drop zone; after loading there is exactly
  **1** input — the top bar's — and no drop zone. That is the whole change, observed in both environments.
- Recorded because it changes the harness: with two inputs while idle, `page.$('input[type=file]')` now picks the
  top bar's, and after loading the top bar's is the only one. The existing `upload` helper keeps working for the
  same reason it was already fragile-with-one-input: it always takes the first match.
