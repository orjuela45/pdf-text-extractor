import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { ColumnDetector } from './ColumnDetector';

const detector = new ColumnDetector();
const fragments = new FragmentFactory();

const left = (y: number, width = 120) =>
  fragments.create({ text: 'izquierda', x: 72, y, width, fontSize: 12 });
const right = (y: number, width = 120) =>
  fragments.create({ text: 'derecha', x: 330, y, width, fontSize: 12 });

describe('ColumnDetector', () => {
  describe('detect', () => {
    it('reports a single column when there are no fragments', () => {
      expect(detector.detect([], 12)).toEqual({ columnCount: 1, cuts: [] });
    });

    it('reports a single column for a stack that shares one left edge', () => {
      const stacked = [left(700), left(686), left(672)];

      expect(detector.detect(stacked, 12).columnCount).toBe(1);
    });

    it('splits two stacks whose gap is wider than the ratio allows', () => {
      const stacked = [left(700), left(686), right(700), right(686)];

      const layout = detector.detect(stacked, 12);

      expect(layout.columnCount).toBe(2);
      expect(layout.cuts).toHaveLength(1);
      expect(layout.cuts[0]).toBeGreaterThan(192);
      expect(layout.cuts[0]).toBeLessThan(330);
    });

    it('keeps one column when a single fragment straddles the gap', () => {
      const straddling = fragments.create({
        text: 'titular',
        x: 72,
        y: 740,
        width: 400,
        fontSize: 12,
      });
      const stacked = [straddling, left(700), left(686), right(700), right(686)];

      expect(detector.detect(stacked, 12).columnCount).toBe(1);
    });

    it('keeps one column when the split would leave a side empty', () => {
      const stacked = [left(700), right(700)];

      expect(detector.detect(stacked, 12).columnCount).toBe(1);
    });

    it('ignores gaps that are narrow relative to the body size', () => {
      const twoWords = [
        fragments.create({ text: 'palabras', x: 72, y: 700, width: 46, fontSize: 12 }),
        fragments.create({ text: 'pegadas', x: 148, y: 700, width: 46, fontSize: 12 }),
      ];

      expect(detector.detect(twoWords, 12).columnCount).toBe(1);
    });

    it('honours an explicit column gap ratio', () => {
      const stacked = [left(700), left(686), right(700), right(686)];

      expect(new ColumnDetector().detect(stacked, 12).columnCount).toBe(2);
      expect(new ColumnDetector({ columnGapRatio: 20 }).detect(stacked, 12).columnCount).toBe(1);
    });
  });
});
