import type { PageModel, TextBlock } from '../../core/models';

export interface ViewerPage {
  readonly index: number;
  readonly model: PageModel;
  readonly blocks: readonly TextBlock[];
}

export type ExtractionStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ExtractionProgress {
  readonly done: number;
  readonly total: number;
}
