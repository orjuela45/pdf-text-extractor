import { TextAssembler } from '../core/text/TextAssembler';
import type { OutlineEntry } from './models';
import type { ViewerPage } from './models/viewer';

export class PageBlockOutlineBuilder {
  private readonly assembler: TextAssembler;

  constructor(assembler: TextAssembler = new TextAssembler()) {
    this.assembler = assembler;
  }

  build(pages: readonly ViewerPage[], pageIndex: number): OutlineEntry[] {
    const page = pages.find((candidate) => candidate.index === pageIndex);

    if (page === undefined) {
      return [];
    }

    const entries: OutlineEntry[] = [];

    for (const block of page.blocks) {
      const text = this.assembler.assembleBlock(block);

      if (text === '') {
        continue;
      }

      entries.push({ index: entries.length, block, text, page: pageIndex + 1 });
    }

    return entries;
  }
}
