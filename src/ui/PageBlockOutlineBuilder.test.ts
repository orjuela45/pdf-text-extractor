import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../test/BlockFactory';
import { PageBlockOutlineBuilder } from './PageBlockOutlineBuilder';
import type { ViewerPage } from './models/viewer';

const blocks = new BlockFactory();
const builder = new PageBlockOutlineBuilder();

function page(
  index: number,
  pageBlocks: readonly ReturnType<BlockFactory['createWithText']>[],
): ViewerPage {
  return {
    index,
    model: { index, width: 612, height: 792, rotation: 0, fragments: [] },
    blocks: pageBlocks,
  };
}

describe('PageBlockOutlineBuilder', () => {
  it('returns no entries when there is no page for the requested index', () => {
    expect(builder.build([], 0)).toEqual([]);
  });

  it('makes one entry per block of the requested page', () => {
    const first = blocks.createWithText('ILLUMIA S.A.S.');
    const second = blocks.createWithText('901.897.818-5');

    const entries = builder.build([page(0, [first, second])], 0);

    expect(entries).toHaveLength(2);
    expect(entries[0]?.text).toBe('ILLUMIA S.A.S.');
    expect(entries[1]?.text).toBe('901.897.818-5');
  });

  it('numbers entries by their position on the page, not in the document', () => {
    const pages = [
      page(0, [blocks.createWithText('Portada')]),
      page(1, [blocks.createWithText('Primero'), blocks.createWithText('Segundo')]),
    ];

    expect(builder.build(pages, 1).map((entry) => entry.index)).toEqual([0, 1]);
  });

  it('reports the page number of the requested page, one based', () => {
    const pages = [
      page(0, [blocks.createWithText('Portada')]),
      page(1, [blocks.createWithText('Cuerpo')]),
    ];

    expect(builder.build(pages, 0)[0]?.page).toBe(1);
    expect(builder.build(pages, 1)[0]?.page).toBe(2);
  });

  it('leaves out blocks whose text is empty', () => {
    const entries = builder.build(
      [page(0, [blocks.createWithText('   '), blocks.createWithText('Cuerpo')])],
      0,
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.text).toBe('Cuerpo');
  });

  it('does not mix blocks of other pages into the result', () => {
    const pages = [
      page(0, [blocks.createWithText('De la pagina uno')]),
      page(1, [blocks.createWithText('De la pagina dos')]),
    ];

    const entries = builder.build(pages, 1);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.text).toBe('De la pagina dos');
  });

  it('exposes the block each entry came from so it can be highlighted', () => {
    const block = blocks.createWithText('Cuerpo');

    const entries = builder.build([page(0, [block])], 0);

    expect(entries[0]?.block).toBe(block);
  });
});
