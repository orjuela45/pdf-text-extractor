import type { TextBlock, TextSection } from '../core/models';
import { BlockFactory } from './BlockFactory';

export class SectionFactory {
  private readonly blocks = new BlockFactory();

  create(overrides: Partial<TextSection> = {}): TextSection {
    const heading: TextBlock = this.blocks.createWithText('Título', 18);

    return {
      heading,
      level: 1,
      blocks: [this.blocks.createWithText('Primer párrafo')],
      ...overrides,
    };
  }

  createBody(text: string): TextBlock {
    return this.blocks.createWithText(text);
  }

  createHeading(text: string, fontSize = 18): TextBlock {
    return this.blocks.createWithText(text, fontSize);
  }
}
