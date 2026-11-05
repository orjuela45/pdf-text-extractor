import { SPACE_GAP_TOLERANCE_RATIO } from '../constants';
import type { TextAssemblerConfig, TextFragment, TextLine } from '../models';
import { TextNormalizer } from './TextNormalizer';

export class TextAssembler {
  private readonly normalizer: TextNormalizer;
  private readonly ratio: number;

  constructor(config: TextAssemblerConfig = {}) {
    this.normalizer = new TextNormalizer();
    this.ratio = config.spaceGapToleranceRatio ?? SPACE_GAP_TOLERANCE_RATIO;
  }

  assembleLine(line: TextLine): string {
    const fragments = line.fragments
      .map((fragment) => this.normalizer.normalizeFragment(fragment))
      .filter((fragment) => fragment.text !== '');

    let result = '';
    let previous: TextFragment | undefined;

    for (const fragment of fragments) {
      if (previous !== undefined && this.needsSeparator(previous, fragment)) {
        result += ' ';
      }

      result += fragment.text;
      previous = fragment;
    }

    return result.trim();
  }

  assembleLines(lines: readonly TextLine[]): string {
    return lines.map((line) => this.assembleLine(line)).join('\n');
  }

  private needsSeparator(previous: TextFragment, next: TextFragment): boolean {
    if (this.endsWithSpace(previous.text) || this.startsWithSpace(next.text)) {
      return false;
    }

    const gap = next.x - (previous.x + previous.width);

    return gap > this.ratio * Math.max(previous.fontSize, next.fontSize);
  }

  private startsWithSpace(text: string): boolean {
    return /\s/.test(text.charAt(0));
  }

  private endsWithSpace(text: string): boolean {
    return /\s/.test(text.charAt(text.length - 1));
  }
}
