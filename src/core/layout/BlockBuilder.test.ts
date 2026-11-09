import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { LineFactory } from '../../test/LineFactory';
import { BlockBuilder } from './BlockBuilder';

const builder = new BlockBuilder();
const fragments = new FragmentFactory();
const lines = new LineFactory();

describe('BlockBuilder', () => {
  it('returns no blocks when there are no lines', () => {
    expect(builder.build([])).toEqual([]);
  });

  it('keeps a paragraph of evenly led lines in one block', () => {
    const blocks = builder.build([
      lines.createAt(72, 700),
      lines.createAt(72, 688),
      lines.createAt(72, 676),
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.lines).toHaveLength(3);
  });

  it('starts a block when the vertical gap is wider than the leading', () => {
    const blocks = builder.build([
      lines.createAt(72, 700),
      lines.createAt(72, 688),
      lines.createAt(72, 660),
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks[1]?.lines).toHaveLength(1);
  });

  it('keeps lines whose gap equals the paragraph leading in one block', () => {
    const blocks = builder.build([lines.createAt(72, 700), lines.createAt(72, 684)]);

    expect(blocks).toHaveLength(1);
  });

  it('starts a block when the font size changes', () => {
    const blocks = builder.build([lines.createAt(72, 740, 18), lines.createAt(72, 722, 10)]);

    expect(blocks).toHaveLength(2);
  });

  it('starts a block when a line is indented past the block margin', () => {
    const blocks = builder.build([
      lines.createAt(72, 700),
      lines.createAt(72, 688),
      lines.createAt(90, 676),
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks[1]?.lines).toHaveLength(1);
  });

  it('keeps a paragraph whose first line is indented whole', () => {
    const blocks = builder.build([
      lines.createAt(90, 700),
      lines.createAt(72, 688),
      lines.createAt(72, 676),
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.lines).toHaveLength(3);
  });

  it('starts a new indented paragraph after one that was also indented', () => {
    const blocks = builder.build([
      lines.createAt(90, 700),
      lines.createAt(72, 688),
      lines.createAt(72, 676),
      lines.createAt(90, 664),
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.lines).toHaveLength(3);
    expect(blocks[1]?.lines).toHaveLength(1);
  });

  it('reports the block box from its lines', () => {
    const blocks = builder.build([
      lines.create([fragments.create({ text: 'uno', x: 100, y: 700, width: 50, fontSize: 10 })]),
      lines.create([fragments.create({ text: 'dos', x: 100, y: 688, width: 80, fontSize: 10 })]),
    ]);

    expect(blocks[0]?.left).toBe(100);
    expect(blocks[0]?.right).toBe(180);
    expect(blocks[0]?.top).toBe(710);
    expect(blocks[0]?.bottom).toBe(688);
  });

  it('reports the largest font size of the block as its dominant size', () => {
    const blocks = builder.build([lines.createAt(72, 700, 10), lines.createAt(72, 688, 11)]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.fontSize).toBe(11);
  });

  it('honours explicit ratios', () => {
    const byGap = [lines.createAt(72, 700), lines.createAt(72, 675)];
    const byIndent = [lines.createAt(72, 700), lines.createAt(90, 688)];
    const bySize = [lines.createAt(72, 700, 10), lines.createAt(72, 688, 14)];

    expect(new BlockBuilder().build(byGap)).toHaveLength(2);
    expect(new BlockBuilder({ lineGapRatio: 3 }).build(byGap)).toHaveLength(1);
    expect(new BlockBuilder().build(byIndent)).toHaveLength(2);
    expect(new BlockBuilder({ indentToleranceRatio: 5 }).build(byIndent)).toHaveLength(1);
    expect(new BlockBuilder().build(bySize)).toHaveLength(2);
    expect(new BlockBuilder({ fontSizeToleranceRatio: 1 }).build(bySize)).toHaveLength(1);
  });

  it('does not mutate the lines it is given', () => {
    const input = [lines.createAt(72, 700), lines.createAt(72, 688)];
    const snapshot = structuredClone(input);

    builder.build(input);

    expect(input).toEqual(snapshot);
  });
});
