import type { TextBlock } from './block';

export interface TextSection {
  readonly heading: TextBlock | null;
  readonly level: number;
  readonly blocks: readonly TextBlock[];
}

export interface SectionBuilderConfig {
  readonly headingFontSizeRatio?: number;
}
