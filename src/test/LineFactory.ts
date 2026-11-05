import type { TextFragment, TextLine } from '../core/models';
import { FragmentFactory } from './FragmentFactory';

export class LineFactory {
  private readonly fragments = new FragmentFactory();

  create(lineFragments: readonly TextFragment[] = [], overrides: Partial<TextLine> = {}): TextLine {
    return {
      fragments: lineFragments,
      baseline: lineFragments[0]?.y ?? 700,
      fontSize: lineFragments[0]?.fontSize ?? 10,
      ...overrides,
    };
  }

  createAt(left: number, baseline: number, fontSize = 10): TextLine {
    return this.create([
      this.fragments.create({ text: 'texto', x: left, y: baseline, width: 100, fontSize }),
    ]);
  }
}
