import { BlockBuilder } from '../core/layout/BlockBuilder';
import { LineBuilder } from '../core/layout/LineBuilder';
import { SectionBuilder } from '../core/layout/SectionBuilder';
import type {
  PdfDocumentLike,
  ProgressListener,
  QualityReport,
  TextBlock,
  TextLine,
} from '../core/models';
import { PdfTextExtractor } from '../core/pdf/PdfTextExtractor';
import { QualityReporter } from '../core/report/QualityReporter';
import { TextAssembler } from '../core/text/TextAssembler';
import { BlockHitTester } from './BlockHitTester';
import { ClipboardWriter } from './ClipboardWriter';
import type { CopyOutcome, Point, ViewerPage } from './models';

export interface ExtractionSessionConfig {
  readonly clipboard?: ClipboardWriter;
}

export class ExtractionSession {
  private readonly lineBuilder: LineBuilder;
  private readonly blockBuilder: BlockBuilder;
  private readonly assembler: TextAssembler;
  private readonly sectionBuilder: SectionBuilder;
  private readonly reporter: QualityReporter;
  private readonly hitTester: BlockHitTester;
  private readonly clipboard: ClipboardWriter;

  private pages: ViewerPage[] = [];
  private report: QualityReport | null = null;

  constructor(config: ExtractionSessionConfig = {}) {
    this.lineBuilder = new LineBuilder();
    this.blockBuilder = new BlockBuilder();
    this.assembler = new TextAssembler();
    this.sectionBuilder = new SectionBuilder();
    this.reporter = new QualityReporter();
    this.hitTester = new BlockHitTester();
    this.clipboard = config.clipboard ?? new ClipboardWriter();
  }

  async extract(document: PdfDocumentLike, onProgress?: ProgressListener): Promise<void> {
    const model = await new PdfTextExtractor(onProgress).extract(document);
    const lines: TextLine[][] = [];
    const blocks: TextBlock[][] = [];
    const pages: ViewerPage[] = [];

    for (const [index, page] of model.pages.entries()) {
      const pageLines = this.lineBuilder.build(page.fragments);
      const pageBlocks = this.blockBuilder.build(pageLines);

      lines.push(pageLines);
      blocks.push(pageBlocks);
      pages.push({ index, model: page, blocks: pageBlocks });
    }

    const sections = this.sectionBuilder.build(blocks.flat());

    this.pages = pages;
    this.report = this.reporter.report({ document: model, lines, blocks, sections });
  }

  get viewerPages(): readonly ViewerPage[] {
    return this.pages;
  }

  get qualityReport(): QualityReport | null {
    return this.report;
  }

  async copyBlockAt(pageIndex: number, point: Point): Promise<CopyOutcome> {
    const page = this.pages[pageIndex];

    if (page === undefined) {
      return { text: null, copied: false };
    }

    const block = this.hitTester.find(page.blocks, point);

    if (block === null) {
      return { text: null, copied: false };
    }

    const text = this.assembler.assembleBlock(block);

    return { text, copied: await this.clipboard.write(text) };
  }
}
