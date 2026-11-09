import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../test/BlockFactory';
import { DocumentOutlineBuilder } from './DocumentOutlineBuilder';
import type { ViewerPage } from './models/viewer';

const blocks = new BlockFactory();
const builder = new DocumentOutlineBuilder();

function page(index: number, texts: readonly string[]): ViewerPage {
  return {
    index,
    model: { index, width: 612, height: 792, rotation: 0, fragments: [] },
    blocks: texts.map((text) => blocks.createWithText(text)),
  };
}

describe('DocumentOutlineBuilder', () => {
  it('returns no entries for a document with no pages', () => {
    expect(builder.build([])).toEqual([]);
  });

  it('walks every page in order and makes one entry per block', () => {
    const pages = [page(0, ['Uno', 'Dos']), page(1, ['Tres'])];

    const entries = builder.build(pages);

    expect(entries.map((entry) => entry.text)).toEqual(['Uno', 'Dos', 'Tres']);
  });

  it('numbers entries across the whole document, not per page', () => {
    const entries = builder.build([page(0, ['Uno', 'Dos']), page(1, ['Tres'])]);

    expect(entries.map((entry) => entry.index)).toEqual([0, 1, 2]);
  });

  it('reports the real page number each block belongs to', () => {
    const entries = builder.build([
      page(0, ['Uno', 'Dos']),
      page(1, ['Tres']),
      page(2, ['Cuatro']),
    ]);

    expect(entries.map((entry) => entry.page)).toEqual([1, 1, 2, 3]);
  });

  it('leaves out empty blocks without breaking the numbering', () => {
    const entries = builder.build([page(0, ['   ', 'Dos']), page(1, ['Tres'])]);

    expect(entries.map((entry) => entry.text)).toEqual(['Dos', 'Tres']);
    expect(entries.map((entry) => entry.index)).toEqual([0, 1]);
  });

  it('carries the block so the viewer can jump to it', () => {
    const pages = [page(0, ['Uno'])];

    const entries = builder.build(pages);

    expect(entries[0]?.block).toBe(pages[0]?.blocks[0]);
  });
});
