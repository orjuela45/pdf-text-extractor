import { BlockBuilder } from '../core/layout/BlockBuilder';
import { LineBuilder } from '../core/layout/LineBuilder';
import { SectionBuilder } from '../core/layout/SectionBuilder';
import type {
  PdfDocumentLike,
  ProgressListener,
  QualityReport,
  TextBlock,
  TextLine,
  TextSection,
} from '../core/models';
import { PdfTextExtractor } from '../core/pdf/PdfTextExtractor';
import { QualityReporter } from '../core/report/QualityReporter';
import { TextAssembler } from '../core/text/TextAssembler';
import { BlockHitTester } from './BlockHitTester';
import { ClipboardWriter } from './ClipboardWriter';
import type { CopyOutcome, OutlineEntry, Point, ViewerPage } from './models';
import { OutlineBuilder } from './OutlineBuilder';
import { SectionTextAssembler } from './SectionTextAssembler';

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
  private readonly sectionTexts: SectionTextAssembler;
  private readonly outlineBuilder: OutlineBuilder;

  private pages: ViewerPage[] = [];
  private sections: TextSection[] = [];
  private report: QualityReport | null = null;

  constructor(config: ExtractionSessionConfig = {}) {
    this.lineBuilder = new LineBuilder();
    this.blockBuilder = new BlockBuilder();
    this.assembler = new TextAssembler();
    this.sectionBuilder = new SectionBuilder();
    this.reporter = new QualityReporter();
    this.hitTester = new BlockHitTester();
    this.clipboard = config.clipboard ?? new ClipboardWriter();
    this.sectionTexts = new SectionTextAssembler();
    this.outlineBuilder = new OutlineBuilder(this.sectionTexts);
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
    this.sections = sections;
    this.report = this.reporter.report({ document: model, lines, blocks, sections });
  }

  get viewerPages(): readonly ViewerPage[] {
    return this.pages;
  }

  get qualityReport(): QualityReport | null {
    return this.report;
  }

  get documentSections(): readonly TextSection[] {
    return this.sections;
  }

  get outline(): readonly OutlineEntry[] {
    return this.outlineBuilder.build(this.sections, this.sectionPages());
  }

  private sectionPages(): number[] {
    return this.sections.map((section) => {
      const heading = section.heading;

      if (heading === null) {
        return 0;
      }

      const found = this.pages.findIndex((page) => page.blocks.some((block) => block === heading));

      return found === -1 ? 0 : found + 1;
    });
  }

  headingText(block: TextBlock): string {
    return this.assembler.assembleBlock(block);
  }

  sectionBlocks(index: number): readonly TextBlock[] {
    const section = this.sections[index];

    return section === undefined ? [] : section.blocks;
  }

  sectionHeading(index: number): TextBlock | null {
    const section = this.sections[index];

    return section === undefined ? null : section.heading;
  }

  sectionText(index: number): string | null {
    const section = this.sections[index];

    return section === undefined ? null : this.sectionTexts.section(section);
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

  async copySection(index: number): Promise<CopyOutcome> {
    const text = this.sectionText(index);

    if (text === null || text === '') {
      return { text: null, copied: false };
    }

    return { text, copied: await this.clipboard.write(text) };
  }

  async copyAll(): Promise<CopyOutcome> {
    return await this.copyText(this.sectionTexts.document(this.sections));
  }

  async copyText(text: string): Promise<CopyOutcome> {
    if (text === '') {
      return { text: null, copied: false };
    }

    return { text, copied: await this.clipboard.write(text) };
  }
}
