import { DEFAULT_BASELINE_TOLERANCE_RATIO, MIN_BASELINE_TOLERANCE } from '../constants';
import type { LineBuilderConfig, TextFragment, TextLine } from '../models';

export class LineBuilder {
  private readonly ratio: number;

  constructor(config: LineBuilderConfig = {}) {
    this.ratio = config.baselineToleranceRatio ?? DEFAULT_BASELINE_TOLERANCE_RATIO;
  }

  build(fragments: readonly TextFragment[]): TextLine[] {
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
    };

    for (const candidate of ordered) {
      const startsNewLine =
        current.length > 0 &&
        Math.abs(candidate.y - baseline) > this.tolerance(dominantSize, candidate.fontSize);

      if (startsNewLine) {
        flush();
      }

      if (current.length === 0) {
        baseline = candidate.y;
        dominantSize = candidate.fontSize;
      } else {
        dominantSize = Math.max(dominantSize, candidate.fontSize);
      }

      current.push(candidate);
    }

    flush();

    return lines;
  }

  private tolerance(dominantSize: number, fragmentSize: number): number {
    return Math.max(MIN_BASELINE_TOLERANCE, Math.max(dominantSize, fragmentSize) * this.ratio);
  }
}
