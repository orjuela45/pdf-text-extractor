import type { RawTextContentItem, RawTextItem, TextDirection, TextFragment } from '../models';

export class TextContentMapper {
  map(items: readonly RawTextContentItem[]): TextFragment[] {
    const fragments: TextFragment[] = [];

    for (const item of items) {
      if (this.isTextItem(item)) {
        fragments.push(this.mapItem(item));
      }
    }

    return fragments;
  }

  private isTextItem(item: RawTextContentItem): item is RawTextItem {
    return 'str' in item;
  }

  private mapItem(item: RawTextItem): TextFragment {
    const { transform } = item;

    return {
      text: item.str,
      x: this.cell(transform, 4),
      y: this.cell(transform, 5),
      width: item.width,
      height: item.height,
      fontSize: Math.hypot(this.cell(transform, 2), this.cell(transform, 3)),
      fontName: item.fontName,
      direction: this.direction(item.dir),
      hasEOL: item.hasEOL,
    };
  }

  private cell(matrix: readonly number[], index: number): number {
    const value = matrix[index];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  private direction(dir: string): TextDirection {
    switch (dir) {
      case 'rtl':
        return 'rtl';
      case 'ttb':
        return 'ttb';
      default:
        return 'ltr';
    }
  }
}
