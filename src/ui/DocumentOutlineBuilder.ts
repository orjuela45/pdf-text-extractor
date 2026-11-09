import { TextAssembler } from '../core/text/TextAssembler';
import type { OutlineEntry } from './models';
import type { ViewerPage } from './models/viewer';

export class DocumentOutlineBuilder {
  private readonly assembler: TextAssembler;

  constructor(assembler: TextAssembler = new TextAssembler()) {
    this.assembler = assembler;
  }

  build(pages: readonly ViewerPage[]): OutlineEntry[] {
    const entries: OutlineEntry[] = [];

    for (const page of pages) {
      for (const block of page.blocks) {
        const text = this.assembler.assembleBlock(block);

        if (text === '') {
          continue;
        }

        entries.push({ index: entries.length, block, text, page: page.index + 1 });
      }
    }

    return entries;
  }
}
