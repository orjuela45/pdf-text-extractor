import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../../test/BlockFactory';
import { FragmentFactory } from '../../test/FragmentFactory';
import { LineFactory } from '../../test/LineFactory';
import { SectionBuilder } from './SectionBuilder';

const builder = new SectionBuilder();
const blocks = new BlockFactory();
const fragments = new FragmentFactory();
const lines = new LineFactory();

describe('SectionBuilder', () => {
  it('returns no sections when there are no blocks', () => {
    expect(builder.build([])).toEqual([]);
  });

  it('returns one level zero section when nothing looks like a heading', () => {
    const built = [blocks.createWithText('Uno.'), blocks.createWithText('Dos.')];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
    expect(sections[0]?.level).toBe(0);
    expect(sections[0]?.blocks).toHaveLength(2);
  });

  it('opens a section at a block whose font size stands out from the body', () => {
    const built = [
      blocks.createWithText('Introduccion', 18),
      blocks.createWithText('Primer parrafo.'),
      blocks.createWithText('Segundo parrafo.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe(built[0]);
    expect(sections[0]?.blocks).toHaveLength(2);
  });

  it('opens a section at a numbered block even when its font size matches the body', () => {
    const built = [
      blocks.createWithText('1. Introduccion'),
      blocks.createWithText('Cuerpo uno.'),
      blocks.createWithText('Cuerpo dos.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe(built[0]);
    expect(sections[0]?.blocks).toHaveLength(2);
  });

  it('recognises a multi level number, a label and a roman numeral as headings', () => {
    const multiLevel = blocks.createWithText('2.1 Alcance');
    const labelled = blocks.createWithText('Capitulo 2');
    const roman = blocks.createWithText('Parte IV');

    const numberedSections = builder.build([multiLevel, blocks.createWithText('Cuerpo.')]);
    const labelledSections = builder.build([labelled, blocks.createWithText('Cuerpo.')]);
    const romanSections = builder.build([roman, blocks.createWithText('Cuerpo.')]);

    expect(numberedSections[0]?.heading).toBe(multiLevel);
    expect(labelledSections[0]?.heading).toBe(labelled);
    expect(romanSections[0]?.heading).toBe(roman);
  });

  it('does not mistake a sentence for a heading', () => {
    const built = [
      blocks.createWithText('2020 fue un ano dificil.'),
      blocks.createWithText('Parte del texto nunca fue un titulo.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
  });

  it('collects blocks before the first heading as a level zero preamble', () => {
    const built = [
      blocks.createWithText('Portada.'),
      blocks.createWithText('Introduccion', 18),
      blocks.createWithText('Cuerpo uno.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.heading).toBeNull();
    expect(sections[0]?.level).toBe(0);
    expect(sections[0]?.blocks).toHaveLength(1);
    expect(sections[1]?.heading).toBe(built[1]);
    expect(sections[1]?.level).toBe(1);
    expect(sections[1]?.blocks).toHaveLength(1);
  });

  it('omits the preamble when the document opens with a heading', () => {
    const built = [blocks.createWithText('Introduccion', 18), blocks.createWithText('Cuerpo.')];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections.every((section) => section.heading !== null)).toBe(true);
  });

  it('numbers levels by descending heading font size', () => {
    const built = [
      blocks.createWithText('Grande', 20),
      blocks.createWithText('Cuerpo uno.'),
      blocks.createWithText('Mediano', 15),
      blocks.createWithText('Cuerpo dos.'),
      blocks.createWithText('Cuerpo tres.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.level).toBe(1);
    expect(sections[1]?.level).toBe(2);
  });

  it('gives headings of the same size the same level', () => {
    const built = [
      blocks.createWithText('Primero', 18),
      blocks.createWithText('Cuerpo uno.'),
      blocks.createWithText('Segundo', 18),
      blocks.createWithText('Cuerpo dos.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.level).toBe(1);
    expect(sections[1]?.level).toBe(1);
  });

  it('keeps a heading that is followed immediately by another heading', () => {
    const built = [
      blocks.createWithText('Cuerpo previo.'),
      blocks.createWithText('Primero', 18),
      blocks.createWithText('Segundo', 18),
      blocks.createWithText('Cuerpo posterior uno.'),
      blocks.createWithText('Cuerpo posterior dos.'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(3);
    expect(sections[1]?.heading).toBe(built[1]);
    expect(sections[1]?.blocks).toHaveLength(0);
    expect(sections[2]?.heading).toBe(built[2]);
    expect(sections[2]?.blocks).toHaveLength(2);
  });

  it('opens a section at a short line drawn in a different font than the body', () => {
    const built = [
      blocks.createWithText('Resultados del ejercicio', 12, 'g_d0_f1'),
      blocks.createWithText('El texto del parrafo empieza aca.', 12, 'g_d0_f2'),
      blocks.createWithText('Continua en otra linea del cuerpo.', 12, 'g_d0_f2'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe(built[0]);
    expect(sections[0]?.blocks).toHaveLength(2);
  });

  it('opens a section at a wrapped heading of a few words in another font', () => {
    const wrapped = blocks.create(
      [
        lines.create([
          fragments.create({ text: 'Resultados del ejercicio', fontName: 'g_d0_f1', fontSize: 12 }),
        ]),
        lines.create([
          fragments.create({ text: 'anual integrado', fontName: 'g_d0_f1', fontSize: 12 }),
        ]),
      ],
      { fontSize: 12 },
    );
    const built = [
      wrapped,
      blocks.createWithText('El cuerpo del documento uno.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento dos.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento tres.', 12, 'g_d0_f2'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe(wrapped);
  });

  it('does not treat a long line in another font as a heading', () => {
    const built = [
      blocks.createWithText(
        'Una linea larga en otra fuente que no es un titulo sino una cita completa',
        12,
        'g_d0_f1',
      ),
      blocks.createWithText('El cuerpo del documento uno.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento dos.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento tres.', 12, 'g_d0_f2'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
  });

  it('does not treat a long multi line passage in another font as a heading', () => {
    const quote = blocks.create(
      [
        lines.create([
          fragments.create({
            text: 'Primera linea de la cita.',
            fontName: 'g_d0_f1',
            fontSize: 12,
          }),
        ]),
        lines.create([
          fragments.create({
            text: 'Segunda linea de la cita.',
            fontName: 'g_d0_f1',
            fontSize: 12,
          }),
        ]),
      ],
      { fontSize: 12 },
    );
    const built = [
      quote,
      blocks.createWithText('El cuerpo del documento uno.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento dos.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento tres.', 12, 'g_d0_f2'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
  });

  it('does not treat a small note in another font as a heading', () => {
    const built = [
      blocks.createWithText('El cuerpo del documento uno.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento dos.', 12, 'g_d0_f2'),
      blocks.createWithText('una nota', 8, 'g_d0_f1'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
  });

  it('does not treat a block with no text as a heading', () => {
    const built = [
      blocks.createWithText('   ', 12, 'g_d0_f1'),
      blocks.createWithText('El cuerpo del documento uno.', 12, 'g_d0_f2'),
      blocks.createWithText('El cuerpo del documento dos.', 12, 'g_d0_f2'),
    ];

    const sections = builder.build(built);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
  });

  it('honours an explicit heading font size ratio', () => {
    const built = [
      blocks.createWithText('Titulo', 12),
      blocks.createWithText('Cuerpo uno.'),
      blocks.createWithText('Cuerpo dos.'),
    ];

    const byDefault = builder.build(built);
    const strict = new SectionBuilder({ headingFontSizeRatio: 0.5 }).build(built);

    expect(byDefault[0]?.heading).toBe(built[0]);
    expect(strict).toHaveLength(1);
    expect(strict[0]?.heading).toBeNull();
  });

  it('does not mutate the blocks it is given', () => {
    const input = [blocks.createWithText('Introduccion', 18), blocks.createWithText('Cuerpo.')];
    const snapshot = structuredClone(input);

    builder.build(input);

    expect(input).toEqual(snapshot);
  });
});
