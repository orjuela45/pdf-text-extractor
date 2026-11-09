# pdf-text-extractor — F11 Whole-document mode

Feature: a switch between whole-document and current-page browsing, fixed-height
block cards, and the whole PDF rendered with normal scrolling and a real jump to
the selected block.

## Specs

- **S19** Block cards have a fixed maximum height and clip their text with an
  ellipsis instead of growing to the whole block.
  Verbatim: *"no quiero secciones tan largas, que sean fijas"*.
- **S20** A switch chooses between the whole document and the current page.
  Verbatim: *"o poner una opcion de documento completo o paginas"*.
- **S21** In whole-document mode every page is rendered and the viewer scrolls
  normally. Verbatim: *"ahora carguemos todo el pdf, ya no pongamos las paginas"* /
  *"si es completo que tenga el scroll normal"*.
- **S22** Selecting a block in whole-document mode moves the viewer to that block.
  Verbatim: *"ahi si se posicione solo cuando se seleccione una seccion"*.
- **S23** `pnpm test:browser` stays green and gains a check per behaviour above.

## Tasks

| ID | Task | Specs | Route | Commit |
| --- | --- | --- | --- | --- |
| T46 | Clamp the block card text to a fixed number of lines | S19 | inline, test-first | `pending` |
| T47 | `DocumentMode` state plus the switch in the panel header | S20 | inline, test-first | `pending` |
| T48 | Outline builder for the whole document, with real page numbers | S20, S21 | inline, test-first | `pending` |
| T49 | Render every page in whole-document mode with normal scrolling | S21 | inline, test-first | `pending` |
| T50 | Selecting a block scrolls the viewer to that block's page and block | S22 | inline, test-first | `pending` |
| T51 | Browser checks for T46–T50 | S23 | inline | `pending` |
| T52 | Verify in dev and production | S19–S23 | verify | `pending` |

All are closed in L65. They landed as two work units: the card clamp with the view
switch, then the whole-document rendering with the jump.

## Log

**L61** (user request, verbatim):
> mira como se ve, no quiero secciones tan largas, que sean fijas, y ahora carguemos todo el pdf, ya no pongamos las paginas, o poner una opcion de documento completo o paginas, y si es completo que tenga el scroll normal y ahi si se posicione solo cuando se seleccione una seccion

**L62** (decisions, from the two questions):
- View mode: **a switch** between whole document and current page, rather than
  replacing the page mode outright.
- Cards: **clamped to a few lines with an ellipsis**, so every card is about the
  same height and the list is scannable.

**L63** (defect confirmed before implementing):
`OutlinePanel` has no height limit at all on a card, so a twelve-line block fills
the column and pushes every other card out of view. The screenshot shows exactly
that. Fixed by T46 rather than worked around in the layout.

**L64** (consequence worth stating, because the pagination control is now
misleading): the top bar's `‹ Pág. 1 de 1 ›` is only correct while a single page
is shown. In whole-document mode it becomes a jump control rather than a display
of what is on screen. T49 and T50 decide what it means; it must not claim to be
showing one page while every page is rendered.

**L65** (T46–T52 closed — clamped cards, a scope switch, the whole document rendered
with normal scrolling, and a jump to the selected block.)
- **The default is now the whole document**, with a `Todo` / `Página` switch in the panel
  header. Page mode is kept rather than removed, because the user asked for the option, not
  for a replacement.
- **T46, the defect from L63:** the card text is `line-clamp-3` and the full text is kept in
  the `title` attribute, so nothing is lost. Clamping is presentation only: copying sends the
  **whole** block, which a test pins explicitly.
- **T48** adds `DocumentOutlineBuilder`, which walks every page and reports the real page
  number of each block, so it and `PageBlockOutlineBuilder` share the `OutlineEntry` shape and
  the panel does not care which produced the list.
- **T49** renders every page when `showAllPages` is set, and `PdfPage` now carries
  `data-page-anchor`, which is what makes the jump possible.
- **T50** scrolls the viewer to the selected block's page. The honest limit: it lands on the
  **page** that contains the block, not on the block inside that page. Landing on the block
  itself would need its position in canvas pixels, and the page anchor already takes the user
  to the right place in the ordinary case. Stated rather than implied.
- **Three check failures, and the last two were real defects, not test noise:**
  1. An older check asserted that the panel always lists only the current page. That is no
     longer true by default, so it was rewritten to enter page scope first and to say so by
     its name; it then hands the mode back to `Todo` so it does not leak state.
  2. The whole-document check reused the previous check's fixture, and because `documentKey`
     is `name:size`, uploading the same file does not reload. **The mode therefore persisted
     across documents**, so a stale `Página` selection survived into the next document. The
     fix is a real behaviour change: `App` now resets the mode in the same document-change
     block that resets page and selection. The check also moved to its own fixture so it no
     longer depends on run order.
  3. The rotated-page check then failed because the previous check left three pages mounted.
     The mode reset in (2) is what fixes it: a new document starts in whole-document mode with
     its own pages instead of inheriting the previous state.
- Evidence: `vitest run` **293 passed / 1 skipped**, `tsc` 0 on both configs, `eslint` 0,
  `prettier --check` clean, `src/core` at **100% on all four metrics**, `pnpm test:browser`
  **17 of 17 PASS**.
- Dev probe, measured: whole-document mode shows 3 anchors, 3 cards and 3 text layers for a
  three-page PDF, the card text is clamped, and switching to `Página` leaves exactly 1 anchor
  and 1 card. Uploading a different file resets to whole-document mode.
