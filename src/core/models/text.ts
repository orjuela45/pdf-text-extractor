export type TextDirection = 'ltr' | 'rtl' | 'ttb';

export interface TextFragment {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fontSize: number;
  readonly fontName: string;
  readonly direction: TextDirection;
  readonly hasEOL: boolean;
}

export interface TextLine {
  readonly fragments: readonly TextFragment[];
  readonly baseline: number;
  readonly fontSize: number;
}
