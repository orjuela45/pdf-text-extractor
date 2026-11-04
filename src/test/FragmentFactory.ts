import type { TextFragment } from '../core/models';

export class FragmentFactory {
  create(overrides: Partial<TextFragment> = {}): TextFragment {
    const text = overrides.text ?? 'texto';

    return {
      x: 72,
      y: 700,
      width: text.length * 5,
      height: 10,
      fontSize: 10,
      fontName: 'g_d0_f1',
      direction: 'ltr',
      hasEOL: false,
      ...overrides,
      text,
    };
  }
}
