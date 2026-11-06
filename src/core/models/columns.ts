export interface FragmentSpan {
  readonly left: number;
  readonly right: number;
}

export interface ColumnLayout {
  readonly columnCount: number;
  readonly cuts: readonly number[];
}

export interface ColumnDetectorConfig {
  readonly columnGapRatio?: number;
}

export interface ColumnAwareLineBuilderConfig {
  readonly baselineToleranceRatio?: number;
  readonly columnGapRatio?: number;
}
