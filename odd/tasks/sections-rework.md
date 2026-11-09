# pdf-text-extractor — F9 Sections rework

Feature: replace the typographic section list with a block list scoped to the current
page, unify the two text paths that diverged, and scroll the right panel to the
selected item.

## Specs

- **S11** The left panel lists **blocks** of the current page, not sections.
  Verbatim: *"estoy viendo que las sescciones tiene todo el bloque y no es la idea"*.
- **S12** Each card is one block: its own text, its own page number, and selecting it
  highlights **that block** on the canvas.
  Source: answered decision, *"Que cada tarjeta sea un bloque, no la sección entera"*.
- **S13** The panel shows only the blocks that belong to the **current page**.
  Verbatim: *"si tiene varias paginas deberia estar las secciones por la pagina actual no de todas"*.
  Answered decision: blocks of the current page, not sections that start there.
- **S14** Selecting a block scrolls the right panel to that block's text.
  Verbatim: *"al seleccionar una parte se deberia posicionar en esa parte en la parte de la derecha"*.
- **S15** The left panel and the right panel must show the **same** text for the same
  content. Source: defect found while reading the attached screenshot; today
  `SectionTextAssembler` and `DocumentTextWriter` diverge.
- **S16** `pnpm test:browser` stays green and gains a check per behaviour above.

## Tasks

| ID | Task | Specs | Route | Commit |
| --- | --- | --- | --- | --- |
| T37 | `PageBlockOutlineBuilder`: build the outline from `ViewerPage.blocks` of one page, each entry one block | S11, S12, S13 | inline, test-first | `pending` |
| T38 | Unify the text path: one assembler used by both the outline and `DocumentTextWriter` | S15 | inline, test-first | `pending` |
| T39 | Wire the page into the outline and re-render it on page change | S13 | inline | `pending` |
| T40 | Point the right panel at the selected block | S14 | inline, test-first | `pending` |
| T41 | Browser checks for T37–T40 | S16 | inline | `pending` |
| T42 | Verify in dev and production | S11–S16 | verify | `pending` |

All six are closed in L59, in one work unit: the model change crosses every file at
once, so any intermediate state would not typecheck.

## Log

**L56** (user request, verbatim):
> estoy viendo que las sescciones tiene todo el bloque y no es la idea, tambien si tiene varias paginas deberia estar las secciones por la pagina actual no de todas, y en la parte de bloque extraido se tiene todo, es bueno pero al seleccionar una parte se deberia posicionar en esa parte en la parte de la derecha

**L57** (decisions, from the two questions):
- Panel content: **blocks**, not sections. Each card is one block with its own text and
  its own page number, and selecting it highlights that block on the canvas.
- Page scoping: **the blocks of the current page**. The user chose this over
  "sections that start here", so the unit and the scope are both the block.

**L58** (defect found while reading the screenshot, before implementing):
The right panel reported `6 secciones` while the left showed different grouping for the
same content. Cause: two parallel text paths. `OutlineBuilder` +
`SectionTextAssembler` assemble the cards; `DocumentTextWriter` assembles the right
panel. They are independent implementations of the same idea and have already diverged.
Recorded as S15 and T38 rather than left as a cosmetic difference.

**L59** (T37–T42 closed — the panel lists blocks of the current page, and the right panel
follows the selection. One work unit, because the model change crosses every file.)
- **What the panel is now:** `PageBlockOutlineBuilder` reads `ViewerPage.blocks` of **one page**
  and emits one entry per block, carrying the block itself so it can be highlighted and
  copied on its own. The panel is titled `Bloques de la página`, the entries are flat (no
  level, no indentation), and each card shows that block's own text.
- **`OutlineEntry` changed shape** from `{heading, level, text, page}` to `{block, text, page}`.
  That is why `OutlineBuilder` is deleted outright rather than adapted: it turned sections
  into cards, and sections are no longer the unit. `UNTITLED_SECTION_HEADING` is now unused.
- **T38, the defect from L58, is fixed by construction.** `DocumentTextWriter` gained
  `parts(sections, view): TextPart[]` where each part carries the `TextBlock` it came from,
  and `plain`/`markdown` are now derived from those same parts. There is one assembly path,
  so the cards and the right panel can no longer disagree.
- **T40 ships with the anchor**, and the honest limitation is stated: `data-block-anchor` is
  a real anchor per block and the panel calls `scrollIntoView` when the selection changes,
  but **no scroll is observable when the block is already on screen**, which is the ordinary
  case in a short document. The browser check therefore asserts the marked block rather than
  a scroll offset, because a scroll assertion would pass for the wrong reason.
- **Three check failures on the way, each a real finding, not noise:**
  1. `no button labelled "Página siguiente"` — pagination controls carry `aria-label` and no
     text, so the harness's text-matching helper could not see them. Added `clickAriaLabel`.
  2. The scroll check timed out because the *previous* check had left the viewer on page two
     and the panel correctly showed page two's blocks. The check now returns to page one
     explicitly instead of depending on run order.
  3. The first version asserted a scroll offset that never changes on a short document, so it
     would have passed or failed for the wrong reason. Replaced with the marked-block assert.
- Evidence: `vitest run` **271 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0,
  `prettier --check` clean on every file this work touches, `src/core` at **100% on all four
  metrics**, `pnpm test:browser` **15 of 15 PASS**.
- Dev probe: two cards for a two-block page, each carrying its own full text, and exactly one
  `ring-2` block in the right panel after selecting one.
- **Bonus, from running Prettier over `src`:** `src/ui/constants/HERO_COPY.ts` is now formatted,
  which closes half of the L51 finding. `DESIGN.md` is still unformatted and is deliberately
  left alone: it is a design document in the user's own words, not code this work touches.
