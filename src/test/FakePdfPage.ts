import type {
  PdfPageLike,
  RawTextContentItem,
  TextContentLike,
  ViewportLike,
  ViewportParameters,
} from '../core/models';

export class FakePdfPage implements PdfPageLike {
  readonly rotate: number;
  readonly viewportParameters: ViewportParameters[] = [];

  private readonly width: number;
  private readonly height: number;
  private readonly items: readonly RawTextContentItem[];

  constructor(
    options: {
      rotate?: number;
      width?: number;
      height?: number;
      items?: readonly RawTextContentItem[];
    } = {},
  ) {
    this.rotate = options.rotate ?? 0;
    this.width = options.width ?? 612;
    this.height = options.height ?? 792;
    this.items = options.items ?? [];
  }

  getViewport(parameters: ViewportParameters): ViewportLike {
    this.viewportParameters.push(parameters);

    const quarterTurn = (parameters.rotation ?? this.rotate) % 180 !== 0;

    return quarterTurn
      ? { width: this.height, height: this.width }
      : { width: this.width, height: this.height };
  }

  async getTextContent(): Promise<TextContentLike> {
    return { items: this.items };
  }
}
