import {
  HEADING_FONT_SIZE_RATIO,
  LABELLED_HEADING_PATTERN,
  NUMBERED_HEADING_PATTERN,
} from '../constants';
import type { SectionBuilderConfig, TextBlock, TextSection } from '../models';
import { TextAssembler } from '../text/TextAssembler';

export class SectionBuilder {
  private readonly assembler: TextAssembler;
  private readonly ratio: number;

  constructor(config: SectionBuilderConfig = {}) {
    this.assembler = new TextAssembler();
    this.ratio = config.headingFontSizeRatio ?? HEADING_FONT_SIZE_RATIO;
  }

  build(blocks: readonly TextBlock[]): TextSection[] {
    if (blocks.length === 0) {
      return [];
    }

    const levels = this.headingLevels(blocks);

    const sections: TextSection[] = [];
    let heading: TextBlock | null = null;
    let level = 0;
    let content: TextBlock[] = [];

    const flush = (): void => {
      if (heading === null && content.length === 0) {
        return;
      }

      sections.push({ heading, level, blocks: [...content] });
      content = [];
    };

    for (const block of blocks) {
      const blockLevel = levels.get(block);

      if (blockLevel === undefined) {
        content.push(block);
        continue;
      }

      flush();
      heading = block;
      level = blockLevel;
    }

    flush();

    return sections;
  }

  private headingLevels(blocks: readonly TextBlock[]): Map<TextBlock, number> {
    const bodySize = this.bodyFontSize(blocks);
    const headingBlocks = blocks.filter((block) => this.isHeading(block, bodySize));
    const sizes = [...new Set(headingBlocks.map((block) => block.fontSize))].sort(
      (left, right) => right - left,
    );

    const levels = new Map<TextBlock, number>();

    for (const block of headingBlocks) {
      levels.set(block, sizes.indexOf(block.fontSize) + 1);
    }

    return levels;
  }

  private isHeading(block: TextBlock, bodySize: number): boolean {
    if (block.fontSize > bodySize * (1 + this.ratio)) {
      return true;
    }

    const text = this.assembler.assembleBlock(block);

    return NUMBERED_HEADING_PATTERN.test(text) || LABELLED_HEADING_PATTERN.test(text);
  }

  private bodyFontSize(blocks: readonly TextBlock[]): number {
    const lineCounts = new Map<number, number>();

    for (const block of blocks) {
      lineCounts.set(block.fontSize, (lineCounts.get(block.fontSize) ?? 0) + block.lines.length);
    }

    let bodySize = Number.POSITIVE_INFINITY;
    let bestCount = 0;

    for (const [size, count] of lineCounts) {
      if (count > bestCount || (count === bestCount && size < bodySize)) {
        bodySize = size;
        bestCount = count;
      }
    }

    return bodySize;
  }
}
