import type { TextBlock } from '../../core/models';

export type TextView = 'plain' | 'markdown';

export interface TextPart {
  readonly block: TextBlock | null;
  readonly text: string;
}
