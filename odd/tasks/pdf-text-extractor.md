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
