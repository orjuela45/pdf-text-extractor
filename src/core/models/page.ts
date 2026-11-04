import type { TextFragment } from './text';

export interface PageModel {
  readonly index: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
  readonly fragments: readonly TextFragment[];
}

export interface PdfDocumentModel {
  readonly pageCount: number;
  readonly pages: readonly PageModel[];
}
