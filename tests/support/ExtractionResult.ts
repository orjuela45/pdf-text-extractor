import type { PdfDocumentModel, TextBlock, TextLine, TextSection } from '../../src/core/models';
import { TextAssembler } from '../../src/core/text/TextAssembler';

export class ExtractionResult {
  readonly document: PdfDocumentModel;
  readonly lines: readonly (readonly TextLine[])[];
  readonly blocks: readonly (readonly TextBlock[])[];
  readonly sections: readonly TextSection[];

  private readonly assembler: TextAssembler;

  constructor(
    document: PdfDocumentModel,
    lines: readonly (readonly TextLine[])[],
    blocks: readonly (readonly TextBlock[])[],
    sections: readonly TextSection[],
    assembler: TextAssembler,
  ) {
    this.document = document;
    this.lines = lines;
    this.blocks = blocks;
    this.sections = sections;
    this.assembler = assembler;
  }

  fragmentTexts(pageIndex: number): string[] {
    return this.document.pages[pageIndex]?.fragments.map((fragment) => fragment.text) ?? [];
  }

  lineTexts(pageIndex: number): string[] {
    return this.lines[pageIndex]?.map((line) => this.assembler.assembleLine(line)) ?? [];
  }

  blockTexts(pageIndex: number): string[] {
    return this.blocks[pageIndex]?.map((block) => this.assembler.assembleBlock(block)) ?? [];
  }

  sectionHeadingTexts(): string[] {
    return this.sections.map((section) =>
      section.heading === null ? '' : this.assembler.assembleBlock(section.heading),
    );
  }

  sectionBodyTexts(): string[][] {
    return this.sections.map((section) =>
      section.blocks.map((block) => this.assembler.assembleBlock(block)),
    );
  }
}
