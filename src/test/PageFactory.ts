import type { PageModel, TextFragment } from '../core/models';

export class PageFactory {
  create(fragments: readonly TextFragment[] = [], overrides: Partial<PageModel> = {}): PageModel {
    return {
      index: 0,
      width: 612,
      height: 792,
      rotation: 0,
      fragments,
      ...overrides,
    };
  }
}
