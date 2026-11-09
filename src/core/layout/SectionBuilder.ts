import {
  HEADING_FONT_SIZE_RATIO,
  HEADING_MAXIMUM_WORDS,
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
    const bodyFont = this.bodyFontName(blocks);
    const headingBlocks = blocks.filter((block) => this.isHeading(block, bodySize, bodyFont));
    const sizes = [...new Set(headingBlocks.map((block) => block.fontSize))].sort(
      (left, right) => right - left,
    );

    const levels = new Map<TextBlock, number>();

    for (const block of headingBlocks) {
      levels.set(block, sizes.indexOf(block.fontSize) + 1);
    }

    return levels;
  }

  private isHeading(block: TextBlock, bodySize: number, bodyFont: string): boolean {
    if (block.fontSize > bodySize * (1 + this.ratio)) {
      return true;
    }

    const text = this.assembler.assembleBlock(block);

    if (NUMBERED_HEADING_PATTERN.test(text) || LABELLED_HEADING_PATTERN.test(text)) {
      return true;
    }

    return this.isShortDistinctHeading(block, text, bodySize, bodyFont);
  }

  private isShortDistinctHeading(
    block: TextBlock,
    text: string,
    bodySize: number,
    bodyFont: string,
  ): boolean {
    if (block.fontSize < bodySize) {
      return false;
    }

    if (this.wordCount(text) > HEADING_MAXIMUM_WORDS) {
      return false;
    }

    const fonts = this.blockFonts(block);

    return fonts.length > 0 && fonts.every((font) => font !== bodyFont);
  }

  private wordCount(text: string): number {
    return text.split(/\s+/).filter((word) => word !== '').length;
  }

  private blockFonts(block: TextBlock): readonly string[] {
    const fonts = new Set<string>();

    for (const line of block.lines) {
      for (const fragment of line.fragments) {
        if (fragment.text.trim() !== '') {
          fonts.add(fragment.fontName);
        }
      }
    }

    return [...fonts];
  }

  private bodyFontName(blocks: readonly TextBlock[]): string {
    const counts = new Map<string, number>();

    for (const block of blocks) {
      for (const line of block.lines) {
        for (const fragment of line.fragments) {
          if (fragment.text.trim() !== '') {
            counts.set(fragment.fontName, (counts.get(fragment.fontName) ?? 0) + 1);
          }
        }
      }
    }

    let bodyFont = '';
    let bestCount = 0;

    for (const [font, count] of counts) {
      if (count > bestCount) {
        bodyFont = font;
        bestCount = count;
      }
    }

    return bodyFont;
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
