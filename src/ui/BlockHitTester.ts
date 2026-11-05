import type { TextBlock } from '../core/models';
import type { Point } from './models';

export class BlockHitTester {
  find(blocks: readonly TextBlock[], point: Point): TextBlock | null {
    for (const block of blocks) {
      if (this.contains(block, point)) {
        return block;
      }
    }

    return null;
  }

  private contains(block: TextBlock, point: Point): boolean {
    return (
      point.x >= block.left &&
      point.x <= block.right &&
      point.y >= block.bottom &&
      point.y <= block.top
    );
  }
}
