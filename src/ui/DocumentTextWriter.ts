import {
  MARKDOWN_HEADING_LEVEL_OFFSET,
  MAX_MARKDOWN_HEADING_LEVEL,
  WORD_PATTERN,
} from './constants';
import { TextAssembler } from '../core/text/TextAssembler';
import type { TextBlock, TextSection } from '../core/models';
import type { TextPart } from './models/view';
import type { TextView } from './models/view';

export class DocumentTextWriter {
  private readonly assembler: TextAssembler;

  constructor(assembler: TextAssembler = new TextAssembler()) {
    this.assembler = assembler;
  }

  paragraph(block: TextBlock): string {
    return this.assembler.assembleBlock(block);
  }

  bulletCandidates(block: TextBlock): readonly string[] {
    return block.lines.map((line) => this.assembler.assembleLine(line));
  }

  plainParts(sections: readonly TextSection[]): TextPart[] {
    return sections.flatMap((section) => [
      {
        block: section.heading,
        text: section.heading === null ? '' : this.paragraph(section.heading),
      },
      ...section.blocks.map((block) => ({ block, text: this.paragraph(block) })),
    ]);
  }

  markdownParts(sections: readonly TextSection[]): TextPart[] {
    return sections.flatMap((section) => [
      {
        block: section.heading,
        text:
          section.heading === null
            ? ''
            : `${'#'.repeat(
                Math.min(section.level + MARKDOWN_HEADING_LEVEL_OFFSET, MAX_MARKDOWN_HEADING_LEVEL),
              )} ${this.paragraph(section.heading)}`,
      },
      ...section.blocks.map((block) => ({ block, text: this.markdownBlock(block) })),
    ]);
  }

  parts(sections: readonly TextSection[], view: TextView): TextPart[] {
    const all = view === 'markdown' ? this.markdownParts(sections) : this.plainParts(sections);

    return all.filter((part) => part.text !== '');
  }

  plain(sections: readonly TextSection[]): string {
    return this.plainParts(sections)
      .map((part) => part.text)
      .filter((text) => text !== '')
      .join('\n\n');
  }

  markdown(sections: readonly TextSection[]): string {
    return this.markdownParts(sections)
      .map((part) => part.text)
      .filter((text) => text !== '')
      .join('\n\n');
  }

  words(text: string): number {
    return text.match(WORD_PATTERN)?.length ?? 0;
  }

  private markdownBlock(block: TextBlock): string {
    const bullets = this.bulletCandidates(block);

    if (bullets.length > 1 && bullets.every((line) => this.isBullet(line))) {
      return bullets.map((line) => `- ${this.stripBullet(line)}`).join('\n');
    }

    return this.paragraph(block);
  }

  private isBullet(line: string): boolean {
    return /^[-•·*]\s+/.test(line);
  }

  private stripBullet(line: string): string {
    return line.replace(/^[-•·*]\s+/, '');
  }

  view(sections: readonly TextSection[], view: TextView): string {
    return view === 'markdown' ? this.markdown(sections) : this.plain(sections);
  }
}
