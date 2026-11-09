import type { TextBlock, TextLine } from '../core/models';
import { FragmentFactory } from './FragmentFactory';
import { LineFactory } from './LineFactory';

export class BlockFactory {
  private readonly fragments = new FragmentFactory();
  private readonly lines = new LineFactory();

  create(lineBlocks: readonly TextLine[] = [], overrides: Partial<TextBlock> = {}): TextBlock {
    return {
      lines: lineBlocks,
      left: 72,
      right: 500,
      top: 712,
      bottom: 688,
      fontSize: lineBlocks[0]?.fontSize ?? 10,
      ...overrides,
    };
  }

  createWithText(text: string, fontSize = 10, fontName = 'g_d0_f1'): TextBlock {
    return this.create(
      [
        this.lines.create([
          this.fragments.create({
            text,
            x: 72,
            y: 700,
            width: text.length * 5,
            fontSize,
            fontName,
          }),
        ]),
      ],
      { fontSize },
    );
  }
}
