import type {
  QualityReport,
  QualityReportInput,
  QualityReporterConfig,
  SuspiciousJoin,
} from '../models';
import { TextAssembler } from '../text/TextAssembler';
import { SuspiciousJoinDetector } from './SuspiciousJoinDetector';

export class QualityReporter {
  private readonly assembler: TextAssembler;
  private readonly detector: SuspiciousJoinDetector;

  constructor(config: QualityReporterConfig = {}) {
    this.assembler = new TextAssembler(config.assembler);
    this.detector = new SuspiciousJoinDetector();
  }

  report(input: QualityReportInput): QualityReport {
    const pagesWithoutText: number[] = [];
    const suspiciousJoins: SuspiciousJoin[] = [];
    let fragments = 0;
    let lines = 0;
    let characters = 0;

    for (const [pageIndex, page] of input.document.pages.entries()) {
      const pageLines = input.lines[pageIndex] ?? [];
      let pageText = '';

      for (const [lineIndex, line] of pageLines.entries()) {
        const assembly = this.assembler.assembleLineWithDecisions(line);

        pageText += assembly.text;
        lines += 1;
        characters += assembly.text.length;

        for (const join of this.detector.detect(assembly.joins)) {
          suspiciousJoins.push({ ...join, pageIndex, lineIndex });
        }
      }

      if (pageText === '') {
        pagesWithoutText.push(pageIndex);
      }

      fragments += page.fragments.length;
    }

    return {
      pagesWithoutText,
      suspiciousJoins,
      stats: {
        pages: input.document.pageCount,
        pagesWithoutText: pagesWithoutText.length,
        fragments,
        lines,
        blocks: input.blocks.flat().length,
        sections: input.sections.length,
        characters,
      },
    };
  }
}
