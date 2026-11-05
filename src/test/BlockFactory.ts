import type { TextBlock, TextLine } from '../core/models';

export class BlockFactory {
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
}
