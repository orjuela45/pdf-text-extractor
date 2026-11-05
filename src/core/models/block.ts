import type { TextLine } from './text';

export interface TextBlock {
  readonly lines: readonly TextLine[];
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly fontSize: number;
}

export interface BlockBuilderConfig {
  readonly lineGapRatio?: number;
  readonly indentToleranceRatio?: number;
  readonly fontSizeToleranceRatio?: number;
}
