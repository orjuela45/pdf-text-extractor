import { BlockBuilder } from '../../src/core/layout/BlockBuilder';
import { LineBuilder } from '../../src/core/layout/LineBuilder';
import { SectionBuilder } from '../../src/core/layout/SectionBuilder';
import type { TextBlock, TextLine } from '../../src/core/models';
import { PdfDocumentLoader } from '../../src/core/pdf/PdfDocumentLoader';
import { PdfTextExtractor } from '../../src/core/pdf/PdfTextExtractor';
import { TextAssembler } from '../../src/core/text/TextAssembler';
import { ExtractionResult } from './ExtractionResult';

export class ExtractionPipeline {
  private readonly loader: PdfDocumentLoader;
  private readonly extractor: PdfTextExtractor;
  private readonly lineBuilder: LineBuilder;
  private readonly blockBuilder: BlockBuilder;
  private readonly assembler: TextAssembler;
  private readonly sectionBuilder: SectionBuilder;

  constructor(workerSrc: string) {
    this.loader = new PdfDocumentLoader(workerSrc);
    this.extractor = new PdfTextExtractor();
    this.lineBuilder = new LineBuilder();
    this.blockBuilder = new BlockBuilder();
    this.assembler = new TextAssembler();
    this.sectionBuilder = new SectionBuilder();
  }

  async run(data: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = Uint8Array.from(data).buffer;
    const document = await this.extractor.extract(await this.loader.load(arrayBuffer));
    const lines: TextLine[][] = document.pages.map((page) =>
      this.lineBuilder.build(page.fragments),
    );
    const blocks: TextBlock[][] = lines.map((pageLines) => this.blockBuilder.build(pageLines));
    const sections = this.sectionBuilder.build(blocks.flat());

    return new ExtractionResult(document, lines, blocks, sections, this.assembler);
  }
}
