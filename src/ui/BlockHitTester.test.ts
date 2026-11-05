import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../test/BlockFactory';
import { BlockHitTester } from './BlockHitTester';

const blocks = new BlockFactory();
const tester = new BlockHitTester();

describe('BlockHitTester', () => {
  it('returns the block that contains the point', () => {
    const block = blocks.create([], { left: 100, right: 240, top: 710, bottom: 700 });

    expect(tester.find([block], { x: 150, y: 705 })).toBe(block);
  });

  it('returns null for a click that lands between two paragraphs', () => {
    const first = blocks.create([], { left: 100, right: 300, top: 710, bottom: 700 });
    const second = blocks.create([], { left: 100, right: 300, top: 660, bottom: 650 });

    expect(tester.find([first, second], { x: 150, y: 680 })).toBeNull();
  });

  it('returns null for a click outside every block box', () => {
    const block = blocks.create([], { left: 100, right: 240, top: 710, bottom: 700 });

    expect(tester.find([block], { x: 500, y: 705 })).toBeNull();
  });

  it('returns null when there are no blocks', () => {
    expect(tester.find([], { x: 150, y: 705 })).toBeNull();
  });
});
