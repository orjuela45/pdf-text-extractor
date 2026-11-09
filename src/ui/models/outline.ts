import type { TextBlock } from '../../core/models';

export interface OutlineEntry {
  readonly index: number;
  readonly block: TextBlock;
  readonly text: string;
  readonly page: number;
}
