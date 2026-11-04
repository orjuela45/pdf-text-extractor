export interface RawTextItem {
  readonly str: string;
  readonly dir: string;
  readonly transform: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly fontName: string;
  readonly hasEOL: boolean;
}

export interface RawMarkedContent {
  readonly type: string;
}

export type RawTextContentItem = RawTextItem | RawMarkedContent;

export interface ViewportParameters {
  readonly scale: number;
  readonly rotation?: number;
}

export interface ViewportLike {
  readonly width: number;
  readonly height: number;
}

export interface TextContentParameters {
  readonly includeMarkedContent?: boolean;
  readonly disableNormalization?: boolean;
}

export interface TextContentLike {
  readonly items: readonly RawTextContentItem[];
}

export interface PdfPageLike {
  readonly rotate: number;
  getViewport(parameters: ViewportParameters): ViewportLike;
  getTextContent(parameters?: TextContentParameters): Promise<TextContentLike>;
}

export interface PdfDocumentLike {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<PdfPageLike>;
}
