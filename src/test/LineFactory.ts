import type { TextFragment, TextLine } from '../core/models';

export class LineFactory {
  create(fragments: readonly TextFragment[] = [], overrides: Partial<TextLine> = {}): TextLine {
    return {
      fragments,
      baseline: fragments[0]?.y ?? 700,
      fontSize: fragments[0]?.fontSize ?? 10,
      ...overrides,
    };
  }
}
