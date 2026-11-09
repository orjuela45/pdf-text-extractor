import { describe, expect, it } from 'vitest';

import { SectionFactory } from '../test/SectionFactory';
import { OutlineBuilder } from './OutlineBuilder';

const sections = new SectionFactory();

describe('OutlineBuilder', () => {
  it('lists every section with its heading text, level and assembled content', () => {
    const first = sections.create({ level: 1 });
    const second = sections.create({
      heading: sections.createHeading('Métodos', 14),
      level: 2,
      blocks: [sections.createBody('Cuerpo de métodos')],
    });

    expect(new OutlineBuilder().build([first, second])).toEqual([
      { index: 0, heading: 'Título', level: 1, text: 'Título\n\nPrimer párrafo', page: 0 },
      {
        index: 1,
        heading: 'Métodos',
        level: 2,
        text: 'Métodos\n\nCuerpo de métodos',
        page: 0,
      },
    ]);
  });

  it('carries the page numbers it is given, in section order', () => {
    const entries = new OutlineBuilder().build(
      [sections.create({ level: 1 }), sections.create({ level: 1 })],
      [2, 7],
    );

    expect(entries.map((entry) => entry.page)).toEqual([2, 7]);
  });

  it('reports page zero when no page number is known for a section', () => {
    const entry = new OutlineBuilder().build([sections.create({ level: 1 })])[0];

    expect(entry?.page).toBe(0);
  });

  it('labels a section without a heading as untitled', () => {
    const entry = new OutlineBuilder().build([sections.create({ heading: null })])[0];

    expect(entry?.heading).toBe('Sin título');
    expect(entry?.text).toBe('Primer párrafo');
  });

  it('builds an empty outline when there are no sections', () => {
    expect(new OutlineBuilder().build([])).toEqual([]);
  });
});
