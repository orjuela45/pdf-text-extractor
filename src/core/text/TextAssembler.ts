import { COMPOUND_PREFIXES, SPACE_GAP_TOLERANCE_RATIO } from '../constants';
import type {
  LineAssembly,
  TextAssemblerConfig,
  TextBlock,
  TextFragment,
  TextJoinDecision,
  TextLine,
} from '../models';
import { TextNormalizer } from './TextNormalizer';

export class TextAssembler {
  private readonly normalizer: TextNormalizer;
  private readonly ratio: number;

  constructor(config: TextAssemblerConfig = {}) {
    this.normalizer = new TextNormalizer();
    this.ratio = config.spaceGapToleranceRatio ?? SPACE_GAP_TOLERANCE_RATIO;
  }

  assembleLine(line: TextLine): string {
    return this.assembleLineWithDecisions(line).text;
  }

  assembleLineWithDecisions(line: TextLine): LineAssembly {
    const fragments = line.fragments
      .map((fragment) => this.normalizer.normalizeFragment(fragment))
      .filter((fragment) => fragment.text !== '');

    let text = '';
    const joins: TextJoinDecision[] = [];
    let previous: TextFragment | undefined;

    for (const fragment of fragments) {
      if (previous !== undefined) {
        const join = this.join(previous, fragment);

        if (join.insertedSeparator) {
          text += ' ';
        }

        joins.push(join);
      }

      text += fragment.text;
      previous = fragment;
    }

    return { text: text.trim(), joins };
  }

  assembleLines(lines: readonly TextLine[]): string {
    return lines.map((line) => this.assembleLine(line)).join('\n');
  }

  assembleBlock(block: TextBlock): string {
    return this.joinLines(
      block.lines.map((line) => this.assembleLine(line)).filter((text) => text !== ''),
    ).trim();
  }

  private joinLines(lines: readonly string[]): string {
    let result = '';
    let previous = '';

    for (const text of lines) {
      if (result === '') {
        result = text;
      } else if (this.endsWithCompoundHyphen(previous)) {
        result = `${result}${text}`;
      } else if (this.isHyphenatedBreak(previous, text)) {
        result = `${result.slice(0, -1)}${text}`;
      } else {
        result = `${result} ${text}`;
      }

      previous = text;
    }

    return result;
  }

  private isHyphenatedBreak(previous: string, next: string): boolean {
    return /\p{L}-$/u.test(previous) && /\p{Ll}/u.test(next.charAt(0));
  }

  private endsWithCompoundHyphen(previous: string): boolean {
    const stem = previous.slice(0, -1);
    const lastWord = stem.split(/\s/).pop() as string;

    return COMPOUND_PREFIXES.has(lastWord.toLowerCase());
  }

  private join(previous: TextFragment, next: TextFragment): TextJoinDecision {
    const fontSize = Math.max(previous.fontSize, next.fontSize);
    const threshold = this.ratio * fontSize;
    const gap = next.x - (previous.x + previous.width);
    const evaluated = !this.endsWithSpace(previous.text) && !this.startsWithSpace(next.text);

    return {
      previousText: previous.text,
      nextText: next.text,
      gap,
      threshold,
      fontSize,
      evaluated,
      insertedSeparator: evaluated && gap > threshold,
      crossesFontBoundary: previous.fontName !== next.fontName,
    };
  }

  private startsWithSpace(text: string): boolean {
    return /\s/.test(text.charAt(0));
  }

  private endsWithSpace(text: string): boolean {
    return /\s/.test(text.charAt(text.length - 1));
  }
}
