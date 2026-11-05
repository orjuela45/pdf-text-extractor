import { describe, expect, it } from 'vitest';

import type { TextSection } from '../core/models';
import { SectionFactory } from '../test/SectionFactory';
import { SectionTextAssembler } from './SectionTextAssembler';

const sections = new SectionFactory();

describe('SectionTextAssembler', () => {
  it('assembles the heading plus its blocks with a blank line between them', () => {
    const section: TextSection = {
      heading: sections.createHeading('Introducción', 18),
      level: 1,
      blocks: [sections.createBody('Primer párrafo'), sections.createBody('Segundo párrafo')],
    };

    expect(new SectionTextAssembler().section(section)).toBe(
      'Introducción\n\nPrimer párrafo\n\nSegundo párrafo',
    );
  });

  it('reports no heading for a section without one', () => {
    const assembler = new SectionTextAssembler();

    expect(assembler.heading(sections.create({ heading: null }))).toBeNull();
    expect(assembler.section(sections.create({ heading: null }))).toBe('Primer párrafo');
  });

  it('treats an empty heading as no heading', () => {
    const assembler = new SectionTextAssembler();
    const section = sections.create({ heading: sections.createHeading('', 18) });

    expect(assembler.heading(section)).toBeNull();
    expect(assembler.section(section)).toBe('Primer párrafo');
  });

  it('joins every section into the whole document text', () => {
    const first = sections.create({ level: 1 });
    const second = sections.create({
      heading: sections.createHeading('Métodos', 14),
      level: 2,
      blocks: [sections.createBody('Cuerpo de métodos')],
    });

    expect(new SectionTextAssembler().document([first, second])).toBe(
      'Título\n\nPrimer párrafo\n\nMétodos\n\nCuerpo de métodos',
    );
  });

  it('returns empty text for a document with no content', () => {
    const assembler = new SectionTextAssembler();

    expect(assembler.section(sections.create({ heading: null, blocks: [] }))).toBe('');
    expect(assembler.document([])).toBe('');
    expect(assembler.document([sections.create({ heading: null, blocks: [] })])).toBe('');
  });
});
