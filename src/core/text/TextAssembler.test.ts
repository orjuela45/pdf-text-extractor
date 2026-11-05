import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { LineFactory } from '../../test/LineFactory';
import { TextAssembler } from './TextAssembler';

const assembler = new TextAssembler();
const fragments = new FragmentFactory();
const lines = new LineFactory();

describe('TextAssembler', () => {
  describe('assembleLine', () => {
    it('returns an empty string for a line without fragments', () => {
      expect(assembler.assembleLine(lines.create([]))).toBe('');
    });

    it('inserts a space when the gap is wider than the tolerance', () => {
      const line = lines.create([
        fragments.create({ text: 'pone', x: 72, width: 20 }),
        fragments.create({ text: 'algunas', x: 95, width: 35 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('pone algunas');
    });

    it('keeps kerned fragments joined when the gap stays inside the tolerance', () => {
      const line = lines.create([
        fragments.create({ text: 'ho', x: 72, width: 10 }),
        fragments.create({ text: 'la', x: 83, width: 10 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola');
    });

    it('scales the tolerance with the font size', () => {
      const small = lines.create([
        fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 }),
        fragments.create({ text: 'b', x: 88, width: 10, fontSize: 10 }),
      ]);
      const large = lines.create([
        fragments.create({ text: 'a', x: 72, width: 40, fontSize: 40 }),
        fragments.create({ text: 'b', x: 118, width: 40, fontSize: 40 }),
      ]);

      expect(assembler.assembleLine(small)).toBe('a b');
      expect(assembler.assembleLine(large)).toBe('ab');
    });

    it('never doubles a separator when the space fragment is narrower than the gap', () => {
      const line = lines.create([
        fragments.create({ text: 'hola', x: 72, width: 20 }),
        fragments.create({ text: ' ', x: 92, width: 1 }),
        fragments.create({ text: 'mundo', x: 100, width: 25 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola mundo');
    });

    it('never doubles a separator when the next fragment leads with a space', () => {
      const line = lines.create([
        fragments.create({ text: 'hola', x: 72, width: 20 }),
        fragments.create({ text: ' mundo', x: 100, width: 35 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola mundo');
    });

    it('treats a negative gap as no separator', () => {
      const line = lines.create([
        fragments.create({ text: 'ho', x: 72, width: 12 }),
        fragments.create({ text: 'la', x: 80, width: 10 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola');
    });

    it('measures the gap across an empty fragment instead of stopping at it', () => {
      const line = lines.create([
        fragments.create({ text: 'hola', x: 72, width: 20 }),
        fragments.create({ text: '', x: 92, width: 3 }),
        fragments.create({ text: 'mundo', x: 95, width: 25 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola mundo');
    });

    it('recognises a non-breaking space as a separator that already exists', () => {
      const line = lines.create([
        fragments.create({ text: 'hola', x: 72, width: 20 }),
        fragments.create({ text: '\u00a0', x: 92, width: 3 }),
        fragments.create({ text: 'mundo', x: 95, width: 25 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola mundo');
    });

    it('drops whitespace that hangs off either end of the line', () => {
      const line = lines.create([
        fragments.create({ text: ' ', x: 72, width: 3 }),
        fragments.create({ text: 'hola', x: 75, width: 20 }),
        fragments.create({ text: ' ', x: 95, width: 3 }),
      ]);

      expect(assembler.assembleLine(line)).toBe('hola');
    });

    it('honours an explicit gap tolerance ratio', () => {
      const line = lines.create([
        fragments.create({ text: 'a', x: 72, width: 10 }),
        fragments.create({ text: 'b', x: 88, width: 10 }),
      ]);

      expect(new TextAssembler().assembleLine(line)).toBe('a b');
      expect(new TextAssembler({ spaceGapToleranceRatio: 1 }).assembleLine(line)).toBe('ab');
    });

    it('does not mutate the line it is given', () => {
      const line = lines.create([
        fragments.create({ text: 'a\ufb01b', x: 72, width: 20 }),
        fragments.create({ text: 'c', x: 95, width: 10 }),
      ]);
      const snapshot = structuredClone(line);

      assembler.assembleLine(line);

      expect(line).toEqual(snapshot);
    });
  });

  describe('assembleLines', () => {
    it('joins lines with a newline and returns nothing for no lines', () => {
      const first = lines.create([fragments.create({ text: 'uno', x: 72, width: 15 })]);
      const second = lines.create([fragments.create({ text: 'dos', x: 72, y: 688, width: 15 })]);

      expect(assembler.assembleLines([first, second])).toBe('uno\ndos');
      expect(assembler.assembleLines([])).toBe('');
    });
  });
});
