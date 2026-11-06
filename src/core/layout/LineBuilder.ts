import {
  COLUMN_GAP_RATIO,
  DEFAULT_BASELINE_TOLERANCE_RATIO,
  MIN_BASELINE_TOLERANCE,
} from '../constants';
import type { ColumnAwareLineBuilderConfig, ColumnLayout, TextFragment, TextLine } from '../models';
import { ColumnDetector } from './ColumnDetector';

export class LineBuilder {
  private readonly columnDetector: ColumnDetector;
  private readonly ratio: number;

  constructor(config: ColumnAwareLineBuilderConfig = {}) {
    this.columnDetector = new ColumnDetector({
      columnGapRatio: config.columnGapRatio ?? COLUMN_GAP_RATIO,
    });
    this.ratio = config.baselineToleranceRatio ?? DEFAULT_BASELINE_TOLERANCE_RATIO;
  }

  build(fragments: readonly TextFragment[]): TextLine[] {
    const split = this.columnDetector.detect(fragments, this.bodySize(fragments));
    const lines: TextLine[] = [];

    for (let column = 0; column < split.columnCount; column += 1) {
      lines.push(...this.groupLines(this.columnFragments(fragments, column, split)));
    }

    return lines;
  }

  private columnFragments(
    fragments: readonly TextFragment[],
    column: number,
    split: ColumnLayout,
  ): TextFragment[] {
    const left = column === 0 ? Number.NEGATIVE_INFINITY : (split.cuts[column - 1] as number);
    const right =
      column === split.columnCount - 1 ? Number.POSITIVE_INFINITY : (split.cuts[column] as number);

    return fragments.filter((fragment) => {
      const middle = fragment.x + fragment.width / 2;

      return middle > left && middle <= right;
    });
  }

  private groupLines(fragments: readonly TextFragment[]): TextLine[] {
    const ordered = [...fragments].sort((left, right) => right.y - left.y || left.x - right.x);

    const lines: TextLine[] = [];
    let current: TextFragment[] = [];
    let baseline = 0;
    let dominantSize = 0;

    const flush = (): void => {
      if (current.length === 0) {
        return;
      }

      lines.push({
        fragments: [...current].sort((left, right) => left.x - right.x),
        baseline,
        fontSize: dominantSize,
      });
      current = [];
      dominantSize = 0;
    };

    for (const candidate of ordered) {
      const startsNewLine =
        current.length > 0 &&
        Math.abs(candidate.y - baseline) > this.tolerance(dominantSize, candidate.fontSize);

      if (startsNewLine) {
        flush();
      }

      dominantSize = Math.max(dominantSize, candidate.fontSize);

      if (current.length === 0) {
        baseline = candidate.y;
      }

      current.push(candidate);
    }

    flush();

    return lines;
  }

  private bodySize(fragments: readonly TextFragment[]): number {
    const counts = new Map<number, number>();

    for (const fragment of fragments) {
      const size = Math.round(fragment.fontSize * 10) / 10;
      counts.set(size, (counts.get(size) ?? 0) + 1);
    }

    let size = Number.POSITIVE_INFINITY;
    let best = 0;

    for (const [candidate, count] of counts) {
      if (count > best || (count === best && candidate < size)) {
        size = candidate;
        best = count;
      }
    }

    return Number.isFinite(size) ? size : 0;
  }

  private tolerance(dominantSize: number, fragmentSize: number): number {
    return Math.max(MIN_BASELINE_TOLERANCE, Math.max(dominantSize, fragmentSize) * this.ratio);
  }
}
