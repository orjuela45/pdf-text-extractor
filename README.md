# pdf-text-extractor

A browser-only PDF text extractor. Drop a PDF, click a paragraph, get its text on the
clipboard with the word spacing already corrected. The file never leaves the machine:
pdf.js runs in a web worker inside the page, and there is no backend, no upload and no
account.

## What this actually does, honestly

pdf.js already solves most of the problem this project was started for. Measured with a
controlled probe: below roughly 0.11em it merges same-font runs into one string with no
space; at and above that it either merges the runs with the space already inside the
string, or keeps them apart and emits a synthetic space item. Our own gap rule therefore
almost never fires on the default pipeline, and the logs record that rather than hiding it.

What this layer contributes is everything around that:

- a contiguous reading order and a document model in one coordinate space;
- paragraphs, headings and sections, so "copy this section" is a single action;
- the guarantee that a separator is never doubled and never lost;
- a quality report that says which pages have no text at all, and how much text came out;
- a viewer where the click target and the copied text are the same object by construction.

## Requirements

- Node 26 and pnpm 11.
- A Chromium-based browser only for the optional real-browser check.

## Commands

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `pnpm dev`             | development server                                             |
| `pnpm build`           | typecheck the app config, then build to `dist/`                |
| `pnpm preview`         | serve the built output with the production headers applied     |
| `pnpm test`            | unit, component and end-to-end tests                           |
| `pnpm test --coverage` | the same, with coverage                                        |
| `pnpm typecheck`       | both TypeScript configs: app and tests                         |
| `pnpm lint`            | ESLint                                                         |
| `pnpm format:check`    | Prettier                                                       |
| `pnpm test:browser`    | build, then drive headless system Chrome against the built app |

`pnpm test:browser` is the only check that exercises canvas painting, the pdf.js text layer
and the real `navigator.clipboard`. Unit tests were green while both of those were broken,
so treat it as the functional check and not as decoration.

## Layout

```
src/core/          pure TypeScript, no DOM, no pdf.js types, fully unit-testable
  models/          interfaces grouped by concern, one concern per file
  constants/       one constant per file
  pdf/             the only place that touches pdf.js
  layout/          lines, blocks, sections
  text/            spacing rule, Unicode normalization, assembly
  report/          extraction quality report
src/ui/            thin React components over logic classes
tests/             fixture corpus, pipeline end-to-end, real-browser check
odd/tasks/         the feature document: specs, tasks, and the full decision log
```

Every geometric value in `src/core` is in PDF user space: unscaled points, origin
bottom-left, `y` growing upwards, page rotation not applied. The UI is the only layer that
maps that to pixels, through the pdf.js viewport transform.

Source carries no comments by design. All rationale lives in `odd/tasks/pdf-text-extractor.md`,
which is the entry point for anyone reading this repository.

## Known limitations

- **Bold-only headings are not detected.** pdf.js exposes a font family per generated font
  handle and no weight, so a heading that differs from body text only by weight is invisible
  to the heuristic.
- **No page virtualization.** One canvas and one text layer per page, all mounted. The 100 MB
  file guard bounds bytes, not page count, so a small file with thousands of pages is still
  unbounded.
- **The suspicious-join signal is narrow.** It becomes observable around a content scale of 1.1,
  because pdf.js normally stretches a separator to span its gap. Measured, not assumed.
- **A real compound beginning with a short Latin prefix welds together.** `ex-alumno` copied
  across a line break comes out as `exalumno`. The rule keeps a hyphen when the word before it
  is a known compound prefix, and the shipped list holds only the unambiguous ones (`franco`,
  `anglo`, `hispano`, `italo`, `bien`, `mal`, `tipo`). The Latin prepositions were excluded on
  purpose because `co` is indistinguishable from the ordinary start of a word: including it
  broke `cooperar`, which is the far more common case. This is a deliberate wrong answer, not an
  oversight.
- A paragraph numbered like `10.000 unidades` can be read as a heading.

Two columns are segmented, one column is left alone, and each column is read top to bottom
before moving to the next.

## What the coverage number means

`pnpm test --coverage` reports 100% statements and branches with the `include` scoped to
`src/core/**`. **It does not cover `src/ui/` at all**, so read it as "the extraction engine is
fully covered", never as "the application is". The interface is covered by component tests and,
for canvas painting, the pdf.js text layer and the real clipboard, by `pnpm test:browser`,
which is the only check that sees any of those three.

Coverage also is not mutation coverage. An earlier round of this project had 100% branch
coverage while two boundary comparisons could be flipped without failing anything, because
branch coverage counts the decisions taken, not the boundaries pinned. Those are now pinned.

## Deployment

See `docs/netlify-deploy.md`. The short version: a static site, `pnpm build` to `dist`, and
the headers and redirects in `netlify.toml`.
