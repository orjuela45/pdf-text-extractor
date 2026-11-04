import type { RawTextItem } from '../core/models';

export class RawItemFactory {
  create(text: string, overrides: Partial<RawTextItem> = {}): RawTextItem {
    return {
      str: text,
      dir: 'ltr',
      transform: [10, 0, 0, 10, 100, 700],
      width: text.length * 5,
      height: 10,
      fontName: 'g_d0_f1',
      hasEOL: false,
      ...overrides,
    };
  }
}
