import type { TextDirection, TextFragment } from '../model';

/**
 * Structural subset of the pdf.js `TextItem` this module consumes.
 *
 * It is declared structurally instead of imported from `pdfjs-dist` on purpose:
 * the whole mapping then becomes unit-testable without a worker, a real PDF or a
 * browser, and `core` never depends on pdf.js at type level either.
 */
export interface RawTextItem {
  readonly str: string;
  readonly dir: string;
  readonly transform: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly fontName: string;
  readonly hasEOL: boolean;
}

/**
 * pdf.js interleaves marked-content markers (`beginMarkedContent`, and friends)
 * with real text items in the same array. They carry no text and must be skipped.
 */
export interface RawMarkedContent {
  readonly type: string;
}

export type RawTextContentItem = RawTextItem | RawMarkedContent;

export function isTextItem(item: RawTextContentItem): item is RawTextItem {
  return 'str' in item;
}

const DIRECTIONS: readonly TextDirection[] = ['ltr', 'rtl', 'ttb'];

function toDirection(dir: string): TextDirection {
  return DIRECTIONS.find((candidate) => candidate === dir) ?? 'ltr';
}

/**
 * Reads one cell of a matrix defensively.
 *
 * A malformed transform means the fragment cannot be placed, but its text must
 * still be kept: dropping it would silently delete characters from the document.
 * An unusable position degrades layout, never content.
 */
function cell(matrix: readonly number[], index: number): number {
  const value = matrix[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Maps one pdf.js text item onto the domain model.
 *
 * `transform` is the matrix `[a, b, c, d, e, f]`. The pair `(e, f)` is the origin
 * of the text space, which is the start of the baseline, and `hypot(c, d)` is the
 * vertical scale, which is the effective font size. pdf.js reports `width` and
 * `height` in the same space at scale 1, so they are used as-is.
 */
export function toFragment(item: RawTextItem): TextFragment {
  const { transform } = item;

  return {
    text: item.str,
    x: cell(transform, 4),
    y: cell(transform, 5),
    width: item.width,
    height: item.height,
    fontSize: Math.hypot(cell(transform, 2), cell(transform, 3)),
    fontName: item.fontName,
    direction: toDirection(item.dir),
    hasEOL: item.hasEOL,
  };
}

export function toFragments(items: readonly RawTextContentItem[]): TextFragment[] {
  return items.filter(isTextItem).map(toFragment);
}

/** True for runs that carry only whitespace, including non-breaking spaces. */
export function isBlank(fragment: TextFragment): boolean {
  return fragment.text.trim() === '';
}
