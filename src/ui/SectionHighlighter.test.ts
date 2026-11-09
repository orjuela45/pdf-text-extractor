import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../test/BlockFactory';
import { SectionHighlighter } from './SectionHighlighter';

const highlighter = new SectionHighlighter();
const blocks = new BlockFactory();

describe('SectionHighlighter', () => {
  it('turns a block into a box in PDF user space', () => {
    const block = blocks.create([], { left: 72, right: 400, top: 712, bottom: 688 });

    expect(highlighter.boxOf(block)).toEqual({ left: 72, top: 712, width: 328, height: 24 });
  });

  it('maps every block of a section', () => {
    const built = [
      blocks.create([], { left: 72, right: 300, top: 712, bottom: 688 }),
      blocks.create([], { left: 72, right: 250, top: 676, bottom: 652 }),
    ];

    expect(highlighter.boxesFor(built)).toHaveLength(2);
  });

  it('returns no boxes for a section without blocks', () => {
    expect(highlighter.boxesFor([])).toEqual([]);
  });

  it('never reports a negative size for a degenerate block', () => {
    const inverted = blocks.create([], { left: 400, right: 72, top: 688, bottom: 712 });

    expect(highlighter.boxOf(inverted)).toEqual({ left: 400, top: 688, width: 0, height: 0 });
  });

  it('decides containment with the box top as the upper edge', () => {
    const box = { left: 72, top: 712, width: 328, height: 24 };

    expect(highlighter.contains(box, { x: 100, y: 700 })).toBe(true);
    expect(highlighter.contains(box, { x: 100, y: 712 })).toBe(true);
    expect(highlighter.contains(box, { x: 100, y: 688 })).toBe(true);
    expect(highlighter.contains(box, { x: 100, y: 713 })).toBe(false);
    expect(highlighter.contains(box, { x: 100, y: 687 })).toBe(false);
    expect(highlighter.contains(box, { x: 71, y: 700 })).toBe(false);
    expect(highlighter.contains(box, { x: 401, y: 700 })).toBe(false);
  });
});
