import { describe, expect, it } from 'vitest';

import { SectionFactory } from '../test/SectionFactory';
import { BlockFactory } from '../test/BlockFactory';
import { LineFactory } from '../test/LineFactory';
import { FragmentFactory } from '../test/FragmentFactory';
import { DocumentTextWriter } from './DocumentTextWriter';

const writer = new DocumentTextWriter();
const sections = new SectionFactory();
const blocks = new BlockFactory();
const lines = new LineFactory();
const fragments = new FragmentFactory();

const para = (text: string) =>
  blocks.create([lines.create([fragments.create({ text, x: 72, width: text.length * 5 })])]);

const section = (
  heading: ReturnType<typeof para> | null,
  body: ReturnType<typeof para>[],
  level: number,
) => sections.create({ heading, blocks: body, level });

describe('DocumentTextWriter', () => {
  describe('paragraph', () => {
    it('assembles a block through the shared spacing rule', () => {
      const block = blocks.create([
        lines.create([
          fragments.create({ text: 'pone', x: 72, width: 20 }),
          fragments.create({ text: 'algunas', x: 95, width: 35 }),
        ]),
      ]);

      expect(writer.paragraph(block)).toBe('pone algunas');
    });
  });

  describe('plain', () => {
    it('returns one paragraph per block with a heading when present', () => {
      const heading = para('Introduccion');
      const body = para('Primer parrafo.');
      const built = [section(heading, [body], 1)];

      expect(writer.plain(built)).toBe('Introduccion\n\nPrimer parrafo.');
    });

    it('returns an empty string when there are no sections', () => {
      expect(writer.plain([])).toBe('');
    });

    it('skips an untitled preamble heading without leaving a blank line', () => {
      const built = [section(null, [para('Portada.')], 0)];

      expect(writer.plain(built)).toBe('Portada.');
    });
  });

  describe('markdown', () => {
    it('turns a level one heading into an h2, because the document is not the page title', () => {
      const built = [section(para('Introduccion'), [para('Cuerpo.')], 1)];

      expect(writer.markdown(built)).toBe('## Introduccion\n\nCuerpo.');
    });

    it('nests deeper headings by section level', () => {
      const built = [
        section(para('Grande'), [para('Cuerpo uno.')], 1),
        section(para('Mediano'), [para('Cuerpo dos.')], 2),
      ];

      expect(writer.markdown(built)).toBe('## Grande\n\nCuerpo uno.\n\n### Mediano\n\nCuerpo dos.');
    });

    it('never emits more than six hashes', () => {
      const built = [section(para('Muy profundo'), [], 9)];

      expect(writer.markdown(built)).toBe('###### Muy profundo');
    });

    it('renders a list block as markdown bullets when every line is a bullet', () => {
      const list = blocks.create([
        lines.create([fragments.create({ text: '- uno', x: 72, width: 25 })]),
        lines.create([fragments.create({ text: '- dos', x: 72, y: 688, width: 25 })]),
      ]);
      const built = [section(para('Lista'), [list], 1)];

      expect(writer.markdown(built)).toBe('## Lista\n\n- uno\n- dos');
    });

    it('leaves a paragraph whose lines are not bullets as prose', () => {
      const body = blocks.create([
        lines.create([fragments.create({ text: 'una linea', x: 72, width: 50 })]),
        lines.create([fragments.create({ text: 'y otra', x: 72, y: 688, width: 35 })]),
      ]);
      const built = [section(null, [body], 0)];

      expect(writer.markdown(built)).toBe('una linea y otra');
    });
  });

  describe('words', () => {
    it('counts words, not fragments or lines', () => {
      expect(writer.words('uno dos tres')).toBe(3);
    });

    it('counts a hyphenated compound as one word', () => {
      expect(writer.words('franco-aleman')).toBe(1);
    });

    it('does not count punctuation, numbers alone or bare symbols', () => {
      expect(writer.words('hola, mundo! --- …')).toBe(2);
    });

    it('returns zero for empty text', () => {
      expect(writer.words('')).toBe(0);
    });
  });

  describe('view', () => {
    it('selects the writer for the requested view', () => {
      const built = [section(para('Titulo'), [para('Cuerpo.')], 1)];

      expect(writer.view(built, 'plain')).toBe('Titulo\n\nCuerpo.');
      expect(writer.view(built, 'markdown')).toBe('## Titulo\n\nCuerpo.');
    });
  });
});
