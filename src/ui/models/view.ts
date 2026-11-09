import type { TextBlock } from '../../core/models';

export type TextView = 'plain' | 'markdown';

export type DocumentMode = 'page' | 'document';

export interface TextPart {
  readonly block: TextBlock | null;
  readonly text: string;
}
