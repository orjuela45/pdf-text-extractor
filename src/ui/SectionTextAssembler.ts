import type { TextAssemblerConfig, TextSection } from '../core/models';
import { TextAssembler } from '../core/text/TextAssembler';

export class SectionTextAssembler {
  private readonly assembler: TextAssembler;

  constructor(config: TextAssemblerConfig = {}) {
    this.assembler = new TextAssembler(config);
  }

  heading(section: TextSection): string | null {
    if (section.heading === null) {
      return null;
    }

    const text = this.assembler.assembleBlock(section.heading);

    return text === '' ? null : text;
  }

  section(section: TextSection): string {
    const parts: string[] = [];
    const heading = this.heading(section);

    if (heading !== null) {
      parts.push(heading);
    }

    for (const block of section.blocks) {
      const text = this.assembler.assembleBlock(block);

      if (text !== '') {
        parts.push(text);
      }
    }

    return parts.join('\n\n');
  }

  document(sections: readonly TextSection[]): string {
    return sections
      .map((section) => this.section(section))
      .filter((text) => text !== '')
      .join('\n\n');
  }
}
