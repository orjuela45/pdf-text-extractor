import {
  MARKDOWN_HEADING_LEVEL_OFFSET,
  MAX_MARKDOWN_HEADING_LEVEL,
  WORD_PATTERN,
} from './constants';
import { TextAssembler } from '../core/text/TextAssembler';
import type { TextBlock, TextSection } from '../core/models';
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

  plain(sections: readonly TextSection[]): string {
    return sections
      .flatMap((section) => [
        section.heading === null ? '' : this.paragraph(section.heading),
        ...section.blocks.map((block) => this.paragraph(block)),
      ])
      .filter((text) => text !== '')
      .join('\n\n');
  }

  markdown(sections: readonly TextSection[]): string {
    return sections
      .flatMap((section) => this.markdownSection(section))
      .filter((text) => text !== '')
      .join('\n\n');
  }

  words(text: string): number {
    return text.match(WORD_PATTERN)?.length ?? 0;
  }

  private markdownSection(section: TextSection): string[] {
    const parts: string[] = [];

    if (section.heading !== null) {
      const level = Math.min(
        section.level + MARKDOWN_HEADING_LEVEL_OFFSET,
        MAX_MARKDOWN_HEADING_LEVEL,
      );
      parts.push(`${'#'.repeat(level)} ${this.paragraph(section.heading)}`);
    }

    for (const block of section.blocks) {
      parts.push(this.markdownBlock(block));
    }

    return parts;
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
