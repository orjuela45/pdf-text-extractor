import { TABLE_GAP_RATIO } from '../constants';
import type { TextFragment, TextLine, TableRowDetectorConfig } from '../models';

export class TableRowDetector {
  private readonly ratio: number;

  constructor(config: TableRowDetectorConfig = {}) {
    this.ratio = config.tableGapRatio ?? TABLE_GAP_RATIO;
  }

  isTableRow(line: TextLine): boolean {
    const fragments = this.printed(line);

    return fragments.some((fragment, index) => {
      const next = fragments[index + 1];

      return next !== undefined && this.gapBetween(fragment, next) > this.ratio * line.fontSize;
    });
  }

  private printed(line: TextLine): TextFragment[] {
    return line.fragments.filter((fragment) => fragment.text.trim() !== '');
  }

  private gapBetween(fragment: TextFragment, next: TextFragment): number {
    return next.x - (fragment.x + fragment.width);
  }
}
