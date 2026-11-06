import { COLUMN_GAP_RATIO } from '../constants';
import type { ColumnDetectorConfig, ColumnLayout, FragmentSpan, TextFragment } from '../models';

export class ColumnDetector {
  private readonly ratio: number;

  constructor(config: ColumnDetectorConfig = {}) {
    this.ratio = config.columnGapRatio ?? COLUMN_GAP_RATIO;
  }

  detect(fragments: readonly TextFragment[], hint: number): ColumnLayout {
    const spans = fragments.map((fragment) => ({
      left: fragment.x,
      right: fragment.x + fragment.width,
    }));

    const cuts: number[] = [];

    for (const cut of this.candidates(spans, hint)) {
      if (this.isCut(spans, cut, hint)) {
        cuts.push(cut);
      }
    }

    return { columnCount: cuts.length + 1, cuts };
  }

  private candidates(spans: readonly FragmentSpan[], hint: number): number[] {
    const edges = new Set<number>();

    for (const span of spans) {
      edges.add(span.left);
      edges.add(span.right);
    }

    const ordered = [...edges].sort((left, right) => left - right);
    const candidates: number[] = [];

    for (let index = 0; index < ordered.length - 1; index += 1) {
      const before = ordered[index] as number;
      const after = ordered[index + 1] as number;

      if (this.laysOutOn(spans, after, hint) || this.endsAt(spans, before, hint)) {
        candidates.push(before + (after - before) / 2);
      }
    }

    return candidates;
  }

  private laysOutOn(spans: readonly FragmentSpan[], edge: number, hint: number): boolean {
    const laidOut = spans.filter((span) => span.left > edge - hint && span.left <= edge);

    return this.isStacked(laidOut, hint) && this.isStacked(spans, hint);
  }

  private endsAt(spans: readonly FragmentSpan[], edge: number, hint: number): boolean {
    const ended = spans.filter((span) => span.right < edge + hint && span.right >= edge);

    return this.isStacked(ended, hint) && this.isStacked(spans, hint);
  }

  private isStacked(spans: readonly FragmentSpan[], hint: number): boolean {
    let shared = 0;

    for (let index = 1; index < spans.length; index += 1) {
      const previous = spans[index - 1] as FragmentSpan;
      const current = spans[index] as FragmentSpan;

      if (previous.right - previous.left < hint || current.right - current.left < hint) {
        continue;
      }

      if (Math.max(previous.left, current.left) < Math.min(previous.right, current.right)) {
        shared += 1;
      }
    }

    return shared > 0;
  }

  private isCut(spans: readonly FragmentSpan[], cut: number, hint: number): boolean {
    let leftSize = 0;
    let rightSize = 0;
    let crossed = false;

    for (const span of spans) {
      if (span.right <= cut) {
        leftSize += 1;
      } else if (span.left >= cut) {
        rightSize += 1;
      } else {
        crossed = true;
      }
    }

    if (crossed || leftSize === 0 || rightSize === 0) {
      return false;
    }

    let leftNearest = Number.NEGATIVE_INFINITY;
    let rightNearest = Number.POSITIVE_INFINITY;

    for (const span of spans) {
      if (span.right <= cut) {
        leftNearest = Math.max(leftNearest, span.right);
      } else {
        rightNearest = Math.min(rightNearest, span.left);
      }
    }

    return rightNearest - leftNearest > this.ratio * hint;
  }
}
