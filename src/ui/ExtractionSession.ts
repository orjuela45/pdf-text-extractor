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
import { SectionTextAssembler } from './SectionTextAssembler';
import { PageBlockOutlineBuilder } from './PageBlockOutlineBuilder';
import { DocumentOutlineBuilder } from './DocumentOutlineBuilder';

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
  private readonly pageBlocks: PageBlockOutlineBuilder;
  private readonly documentBlocks: DocumentOutlineBuilder;

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
    this.pageBlocks = new PageBlockOutlineBuilder(this.assembler);
    this.documentBlocks = new DocumentOutlineBuilder(this.assembler);
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

  outlineFor(pageIndex: number): readonly OutlineEntry[] {
    return this.pageBlocks.build(this.pages, pageIndex);
  }

  get documentOutline(): readonly OutlineEntry[] {
    return this.documentBlocks.build(this.pages);
  }

  pageOfBlock(block: TextBlock): number {
    const found = this.pages.findIndex((page) =>
      page.blocks.some((candidate) => candidate === block),
    );

    return found === -1 ? 1 : found + 1;
  }

  blockText(block: TextBlock): string {
    return this.assembler.assembleBlock(block);
  }

  outlineBlock(pageIndex: number, index: number): TextBlock | null {
    const entry = this.outlineFor(pageIndex)[index];

    return entry === undefined ? null : entry.block;
  }

  async copyOutlineBlock(pageIndex: number, index: number): Promise<CopyOutcome> {
    const block = this.outlineBlock(pageIndex, index);

    if (block === null) {
      return { text: null, copied: false };
    }

    return await this.copyText(this.blockText(block));
  }

  async copyBlock(block: TextBlock): Promise<CopyOutcome> {
    return await this.copyText(this.blockText(block));
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
    const section = this.sections[index];

    if (section === undefined) {
      return { text: null, copied: false };
    }

    const text = this.sectionTexts.section(section);

    if (text === '') {
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
