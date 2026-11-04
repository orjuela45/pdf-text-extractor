/**
 * Domain model for a loaded PDF.
 *
 * ## Coordinate contract
 *
 * Every geometric value in `src/core` is expressed in **PDF user space**:
 *
 * - units are unscaled PDF points (72 per inch), never pixels;
 * - the origin is the bottom-left corner of the page, so `y` grows *upwards*;
 * - the page's `/Rotate` value is **not** applied.
 *
 * This keeps layout reasoning independent of rendering. The UI layer is the only
 * place that maps user space to screen coordinates, through the pdf.js viewport
 * transform. Nothing in `core` knows about canvas, CSS or the DOM.
 *
 * A fragment's `y` is its **baseline**, not the top of its ink box, because that is
 * what the PDF text operator records. A fragment's box therefore runs from `y` to
 * `y + height`, and should be read as the font box rather than the ink box.
 */

/**
 * Which way the text advances, as reported by pdf.js.
 *
 * `ttb` (vertical writing) is recorded but not yet laid out: the recipes in this
 * layer assume a horizontal advance along `+x`.
 */
export type TextDirection = 'ltr' | 'rtl' | 'ttb';

/**
 * One run of text as stored in the PDF content stream.
 *
 * A PDF does not record word boundaries. A space is an *absence of ink*, meaning a
 * horizontal gap between two fragments. That gap is not stored anywhere; it is
 * recovered later by comparing `x + width` against the next fragment's `x`.
 */
export interface TextFragment {
  /** Decoded text as pdf.js reported it. Whitespace-only runs are deliberately kept. */
  readonly text: string;
  /** Left edge, in PDF user space. */
  readonly x: number;
  /** Baseline, in PDF user space. */
  readonly y: number;
  /** Advance width, in PDF user space. */
  readonly width: number;
  /** Nominal font height, in PDF user space. */
  readonly height: number;
  /** Effective font size, in PDF user space. */
  readonly fontSize: number;
  /** pdf.js font handle such as `g_d0_f1`. Stable within one document. */
  readonly fontName: string;
  readonly direction: TextDirection;
  /** True when the PDF signalled a line break right after this run. */
  readonly hasEOL: boolean;
}

export interface PageModel {
  /** Zero-based page index. */
  readonly index: number;
  /** Unrotated page width, in PDF user space. */
  readonly width: number;
  /** Unrotated page height, in PDF user space. */
  readonly height: number;
  /** The page's `/Rotate` value in degrees: 0, 90, 180 or 270. */
  readonly rotation: number;
  readonly fragments: readonly TextFragment[];
}

export interface PdfDocumentModel {
  readonly pageCount: number;
  readonly pages: readonly PageModel[];
}
