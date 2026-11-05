import { describe, expect, it } from 'vitest';

import { BlockFactory } from '../../test/BlockFactory';
import { FragmentFactory } from '../../test/FragmentFactory';
import { LineFactory } from '../../test/LineFactory';
import { PageFactory } from '../../test/PageFactory';
import { SectionBuilder } from '../layout/SectionBuilder';
import type { TextBlock, TextSection } from '../models';
import { QualityReporter } from './QualityReporter';

const reporter = new QualityReporter();
const pages = new PageFactory();
const fragments = new FragmentFactory();
const lines = new LineFactory();
const blocks = new BlockFactory();
const sectionBuilder = new SectionBuilder();

describe('QualityReporter', () => {
  describe('pagesWithoutText', () => {
    it('flags a page without any fragments', () => {
      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([])] },
        lines: [[]],
        blocks: [[]],
        sections: [],
      });

      expect(report.pagesWithoutText).toEqual([0]);
      expect(report.stats.pagesWithoutText).toBe(1);
    });

    it('keeps a page that produced text off the list', () => {
      const fragment = fragments.create({ text: 'hola', x: 72, width: 20 });
      const line = lines.create([fragment]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([fragment])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.pagesWithoutText).toEqual([]);
    });

    it('flags a page whose only fragment is whitespace', () => {
      const fragment = fragments.create({ text: ' ', x: 72, width: 3 });
      const line = lines.create([fragment]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([fragment])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.pagesWithoutText).toEqual([0]);
    });

    it('treats a page with no line entry as having no text', () => {
      const report = reporter.report({
        document: { pageCount: 2, pages: [pages.create([]), pages.create([])] },
        lines: [[]],
        blocks: [[]],
        sections: [],
      });

      expect(report.pagesWithoutText).toEqual([0, 1]);
      expect(report.stats.pagesWithoutText).toBe(2);
    });
  });

  describe('stats', () => {
    it('reports the exact aggregate shape of the document', () => {
      const first = fragments.create({ text: 'hola', x: 72, width: 20 });
      const second = fragments.create({ text: 'mundo', x: 100, width: 25 });
      const third = fragments.create({ text: 'adios', x: 72, width: 25 });
      const firstLine = lines.create([first, second]);
      const secondLine = lines.create([third]);
      const pageBlocks: TextBlock[][] = [
        [blocks.create([firstLine])],
        [blocks.create([secondLine])],
      ];
      const sections: TextSection[] = sectionBuilder.build(pageBlocks.flat());

      const report = reporter.report({
        document: {
          pageCount: 2,
          pages: [pages.create([first, second]), pages.create([third])],
        },
        lines: [[firstLine], [secondLine]],
        blocks: pageBlocks,
        sections,
      });

      expect(report.stats).toEqual({
        pages: 2,
        pagesWithoutText: 0,
        fragments: 3,
        lines: 2,
        blocks: 2,
        sections: 1,
        characters: 15,
      });
    });

    it('counts the assembled text rather than the raw fragments', () => {
      const first = fragments.create({ text: '  hola', x: 72, width: 30 });
      const second = fragments.create({ text: 'mundo  ', x: 110, width: 40 });
      const line = lines.create([first, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, second])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.stats.characters).toBe(10);
    });
  });

  describe('suspiciousJoins', () => {
    it('positions a suspicious join by page and line and carries the decision', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const space = fragments.create({ text: ' ', x: 82, width: 1, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontSize: 10 });
      const line = lines.create([first, space, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, space, second])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.suspiciousJoins).toEqual([
        {
          pageIndex: 0,
          lineIndex: 0,
          previousText: ' ',
          nextText: 'b',
          gap: 7,
          threshold: 2.5,
          fontSize: 10,
          evaluated: false,
          insertedSeparator: false,
          crossesFontBoundary: false,
        },
      ]);
    });

    it('leaves a join the rule could evaluate and resolve on its own out of the report', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontSize: 10 });
      const line = lines.create([first, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, second])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.suspiciousJoins).toEqual([]);
    });

    it('leaves a separator that already spans the gap out of the report', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const space = fragments.create({ text: ' ', x: 82, width: 5, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 87, width: 10, fontSize: 10 });
      const line = lines.create([first, space, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, space, second])] },
        lines: [[line]],
        blocks: [[blocks.create([line])]],
        sections: [],
      });

      expect(report.suspiciousJoins).toEqual([]);
    });

    it('reports the line index inside the page', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const space = fragments.create({ text: ' ', x: 82, width: 1, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontSize: 10 });
      const quiet = lines.create([fragments.create({ text: 'c', x: 72, width: 10 })]);
      const noisy = lines.create([first, space, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, space, second])] },
        lines: [[quiet, noisy]],
        blocks: [[]],
        sections: [],
      });

      expect(report.suspiciousJoins.map((join) => join.lineIndex)).toEqual([1]);
    });

    it('reports the page index of a suspicious join on a later page', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const space = fragments.create({ text: ' ', x: 82, width: 1, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontSize: 10 });
      const line = lines.create([first, space, second]);

      const report = reporter.report({
        document: { pageCount: 2, pages: [pages.create([]), pages.create([])] },
        lines: [[], [line]],
        blocks: [[], []],
        sections: [],
      });

      expect(report.suspiciousJoins.map((join) => join.pageIndex)).toEqual([1]);
    });

    it('annotates a suspicious join that crosses a font boundary', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontName: 'g_d0_f1' });
      const space = fragments.create({ text: ' ', x: 82, width: 1, fontName: 'g_d0_f1' });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontName: 'g_d0_f2' });
      const line = lines.create([first, space, second]);

      const report = reporter.report({
        document: { pageCount: 1, pages: [pages.create([first, space, second])] },
        lines: [[line]],
        blocks: [[]],
        sections: [],
      });

      expect(report.suspiciousJoins[0]?.crossesFontBoundary).toBe(true);
    });

    it('honours an explicit assembler configuration', () => {
      const first = fragments.create({ text: 'a', x: 72, width: 10, fontSize: 10 });
      const second = fragments.create({ text: 'b', x: 90, width: 10, fontSize: 10 });
      const line = lines.create([first, second]);
      const input = {
        document: { pageCount: 1, pages: [pages.create([first, second])] },
        lines: [[line]],
        blocks: [[]],
        sections: [],
      };
      const tolerant = new QualityReporter({ assembler: { spaceGapToleranceRatio: 1 } });

      expect(reporter.report(input).stats.characters).toBe(3);
      expect(tolerant.report(input).stats.characters).toBe(2);
    });
  });
});
