import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { LineFactory } from '../../test/LineFactory';
import { TableRowDetector } from './TableRowDetector';

const detector = new TableRowDetector();
const fragments = new FragmentFactory();
const lines = new LineFactory();

const row = (left: string, right: string, rightX = 400) =>
  lines.create([
    fragments.create({ text: left, x: 72, width: 51, fontSize: 12 }),
    fragments.create({ text: ' ', x: 123, width: rightX - 143, fontSize: 12 }),
    fragments.create({ text: right, x: rightX, width: 41, fontSize: 12 }),
  ]);

describe('TableRowDetector', () => {
  it('recognises a row whose columns are far apart', () => {
    expect(detector.isTableRow(row('Concepto', 'Importe'))).toBe(true);
  });

  it('recognises a row whose right column is narrow', () => {
    expect(detector.isTableRow(row('Costes', '840'))).toBe(true);
  });

  it('does not call an ordinary sentence a table row', () => {
    const sentence = lines.create([
      fragments.create({ text: 'pone', x: 72, width: 20, fontSize: 12 }),
      fragments.create({ text: 'algunas', x: 95, width: 35, fontSize: 12 }),
      fragments.create({ text: 'palabras', x: 133, width: 40, fontSize: 12 }),
    ]);

    expect(detector.isTableRow(sentence)).toBe(false);
  });

  it('ignores the whitespace runs when measuring the gaps', () => {
    const under = lines.create([
      fragments.create({ text: 'izquierda', x: 72, width: 60, fontSize: 12 }),
      fragments.create({ text: 'derecha', x: 140, width: 50, fontSize: 12 }),
    ]);

    expect(detector.isTableRow(under)).toBe(false);
  });

  it('scales the threshold with the font size, so the same gap means less in bigger text', () => {
    const small = lines.create([
      fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 }),
      fragments.create({ text: 'b', x: 130, width: 10, fontSize: 10 }),
    ]);
    const large = lines.create([
      fragments.create({ text: 'a', x: 72, width: 10, fontSize: 40 }),
      fragments.create({ text: 'b', x: 130, width: 10, fontSize: 40 }),
    ]);

    expect(detector.isTableRow(small)).toBe(true);
    expect(detector.isTableRow(large)).toBe(false);
  });

  it('honours an explicit table gap ratio', () => {
    const gap = lines.create([
      fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 }),
      fragments.create({ text: 'b', x: 130, width: 10, fontSize: 10 }),
    ]);

    expect(new TableRowDetector().isTableRow(gap)).toBe(true);
    expect(new TableRowDetector({ tableGapRatio: 6 }).isTableRow(gap)).toBe(false);
  });

  it('returns false for a line without fragments', () => {
    expect(detector.isTableRow(lines.create([]))).toBe(false);
  });
});
