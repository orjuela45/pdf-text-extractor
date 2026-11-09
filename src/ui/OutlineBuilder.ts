import type { TextSection } from '../core/models';
import { UNTITLED_SECTION_HEADING } from './constants';
import type { OutlineEntry } from './models';
import { SectionTextAssembler } from './SectionTextAssembler';

export class OutlineBuilder {
  private readonly texts: SectionTextAssembler;

  constructor(texts: SectionTextAssembler = new SectionTextAssembler()) {
    this.texts = texts;
  }

  build(sections: readonly TextSection[], pageOf: readonly number[] = []): OutlineEntry[] {
    return sections.map((section, index) => ({
      index,
      heading: this.texts.heading(section) ?? UNTITLED_SECTION_HEADING,
      level: section.level,
      text: this.texts.section(section),
      page: pageOf[index] ?? 0,
    }));
  }
}
