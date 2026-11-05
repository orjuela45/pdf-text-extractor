import {
  FONT_SIZE_TOLERANCE_RATIO,
  INDENT_TOLERANCE_RATIO,
  PARAGRAPH_LINE_GAP_RATIO,
} from '../constants';
import type { BlockBuilderConfig, TextBlock, TextLine } from '../models';

export class BlockBuilder {
  private readonly lineGapRatio: number;
  private readonly indentRatio: number;
  private readonly sizeRatio: number;

  constructor(config: BlockBuilderConfig = {}) {
    this.lineGapRatio = config.lineGapRatio ?? PARAGRAPH_LINE_GAP_RATIO;
    this.indentRatio = config.indentToleranceRatio ?? INDENT_TOLERANCE_RATIO;
    this.sizeRatio = config.fontSizeToleranceRatio ?? FONT_SIZE_TOLERANCE_RATIO;
  }

  build(lines: readonly TextLine[]): TextBlock[] {
    const blocks: TextBlock[] = [];
    let group: TextLine[] = [];

    for (const line of lines) {
      const previous = group.at(-1);

      if (previous !== undefined && this.startsBlock(group, previous, line)) {
        blocks.push(this.toBlock(group));
        group = [];
      }

      group.push(line);
    }

    if (group.length > 0) {
      blocks.push(this.toBlock(group));
    }

    return blocks;
  }

  private startsBlock(group: readonly TextLine[], previous: TextLine, line: TextLine): boolean {
    const pairSize = Math.max(previous.fontSize, line.fontSize);

    if (Math.abs(line.baseline - previous.baseline) > this.lineGapRatio * pairSize) {
      return true;
    }

    const blockSize = this.dominantSize(group);

    if (Math.abs(line.fontSize - blockSize) > this.sizeRatio * Math.max(line.fontSize, blockSize)) {
      return true;
    }

    return this.leftOf(line) - this.leftOfBlock(group) > this.indentRatio * blockSize;
  }

  private toBlock(group: readonly TextLine[]): TextBlock {
    return {
      lines: [...group],
      left: this.leftOfBlock(group),
      right: Math.max(...group.map((line) => this.rightOf(line))),
      top: Math.max(...group.map((line) => line.baseline + line.fontSize)),
      bottom: Math.min(...group.map((line) => line.baseline)),
      fontSize: this.dominantSize(group),
    };
  }

  private dominantSize(group: readonly TextLine[]): number {
    return Math.max(...group.map((line) => line.fontSize));
  }

  private leftOfBlock(group: readonly TextLine[]): number {
    return Math.min(...group.map((line) => this.leftOf(line)));
  }

  private leftOf(line: TextLine): number {
    return line.fragments.reduce(
      (left, fragment) => Math.min(left, fragment.x),
      Number.POSITIVE_INFINITY,
    );
  }

  private rightOf(line: TextLine): number {
    return line.fragments.reduce(
      (right, fragment) => Math.max(right, fragment.x + fragment.width),
      Number.NEGATIVE_INFINITY,
    );
  }
}
