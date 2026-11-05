export type PdfErrorKind = 'password' | 'oversized' | 'unreadable';

export interface PdfErrorState {
  readonly kind: PdfErrorKind;
  readonly message: string;
}
