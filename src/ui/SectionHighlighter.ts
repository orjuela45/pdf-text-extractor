import type { TextBlock } from '../core/models';
import type { Point } from './models';

export interface HighlightBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export class SectionHighlighter {
  boxesFor(blocks: readonly TextBlock[]): HighlightBox[] {
    return blocks.map((block) => this.boxOf(block));
  }

  boxOf(block: TextBlock): HighlightBox {
    return {
      left: block.left,
      top: block.top,
      width: Math.max(0, block.right - block.left),
      height: Math.max(0, block.top - block.bottom),
    };
  }

  contains(box: HighlightBox, point: Point): boolean {
    return (
      point.x >= box.left &&
      point.x <= box.left + box.width &&
      point.y <= box.top &&
      point.y >= box.top - box.height
    );
  }
}
