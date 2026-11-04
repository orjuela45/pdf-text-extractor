import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { LineBuilder } from './LineBuilder';

const builder = new LineBuilder();
const fragments = new FragmentFactory();

describe('LineBuilder', () => {
  it('returns no lines when there are no fragments', () => {
    expect(builder.build([])).toEqual([]);
  });

  it('groups fragments that share a baseline into a single line', () => {
    const lines = builder.build([
      fragments.create({ text: 'hola', x: 72, y: 700 }),
      fragments.create({ text: 'mundo', x: 120, y: 700 }),
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]?.fragments.map((fragment) => fragment.text)).toEqual(['hola', 'mundo']);
  });

  it('starts a new line when the vertical jump exceeds the tolerance', () => {
    const lines = builder.build([
      fragments.create({ text: 'primera', y: 700 }),
      fragments.create({ text: 'segunda', y: 688 }),
    ]);

    expect(lines.map((line) => line.fragments.map((fragment) => fragment.text))).toEqual([
      ['primera'],
      ['segunda'],
    ]);
  });

  it('orders lines from the top of the page downwards', () => {
    const lines = builder.build([
      fragments.create({ text: 'abajo', y: 100 }),
      fragments.create({ text: 'arriba', y: 700 }),
      fragments.create({ text: 'medio', y: 400 }),
    ]);

    expect(lines.map((line) => line.fragments.map((fragment) => fragment.text))).toEqual([
      ['arriba'],
      ['medio'],
      ['abajo'],
    ]);
  });

  it('sorts the fragments of a line left to right whatever their input order', () => {
    const lines = builder.build([
      fragments.create({ text: 'derecha', x: 500, y: 700 }),
      fragments.create({ text: 'izquierda', x: 72, y: 700 }),
      fragments.create({ text: 'centro', x: 300, y: 700 }),
    ]);

    expect(lines[0]?.fragments.map((fragment) => fragment.text)).toEqual([
      'izquierda',
      'centro',
      'derecha',
    ]);
  });

  it('keeps a superscript on the line it belongs to', () => {
    const lines = builder.build([
      fragments.create({ text: 'x', x: 200, y: 712, fontSize: 6 }),
      fragments.create({ text: 'cuerpo', x: 72, y: 710, fontSize: 10 }),
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]?.fragments.map((fragment) => fragment.text)).toEqual(['cuerpo', 'x']);
  });

  it('anchors the line on its highest baseline and reports the dominant font size', () => {
    const lines = builder.build([
      fragments.create({ text: 'x', x: 200, y: 712, fontSize: 6 }),
      fragments.create({ text: 'cuerpo', x: 72, y: 710, fontSize: 10 }),
    ]);

    expect(lines[0]?.baseline).toBe(712);
    expect(lines[0]?.fontSize).toBe(10);
  });

  it('scales the tolerance with the dominant font size', () => {
    const small = builder.build([
      fragments.create({ text: 'a', y: 700 }),
      fragments.create({ text: 'b', y: 710 }),
    ]);
    const large = builder.build([
      fragments.create({ text: 'a', y: 700, fontSize: 40 }),
      fragments.create({ text: 'b', y: 710, fontSize: 40 }),
    ]);

    expect(small).toHaveLength(2);
    expect(large).toHaveLength(1);
  });

  it('honours an explicit baseline tolerance ratio', () => {
    const candidates = [
      fragments.create({ text: 'a', y: 700 }),
      fragments.create({ text: 'b', y: 705 }),
    ];

    expect(new LineBuilder().build(candidates)).toHaveLength(2);
    expect(new LineBuilder({ baselineToleranceRatio: 1 }).build(candidates)).toHaveLength(1);
  });

  it('keeps whitespace-only fragments, which carry the advance width', () => {
    const lines = builder.build([
      fragments.create({ text: 'hola', x: 72, y: 700 }),
      fragments.create({ text: ' ', x: 92, y: 700 }),
      fragments.create({ text: 'mundo', x: 97, y: 700 }),
    ]);

    expect(lines[0]?.fragments.map((fragment) => fragment.text)).toEqual(['hola', ' ', 'mundo']);
  });

  it('does not mutate the fragments it is given', () => {
    const input = [
      fragments.create({ text: 'derecha', x: 500, y: 700 }),
      fragments.create({ text: 'izquierda', x: 72, y: 700 }),
    ];
    const snapshot = structuredClone(input);

    builder.build(input);

    expect(input).toEqual(snapshot);
  });
});
