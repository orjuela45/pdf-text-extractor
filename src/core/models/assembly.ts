export interface TextAssemblerConfig {
  readonly spaceGapToleranceRatio?: number;
}

export interface TextJoinDecision {
  readonly previousText: string;
  readonly nextText: string;
  readonly gap: number;
  readonly threshold: number;
  readonly fontSize: number;
  readonly evaluated: boolean;
  readonly insertedSeparator: boolean;
  readonly crossesFontBoundary: boolean;
}

export interface LineAssembly {
  readonly text: string;
  readonly joins: readonly TextJoinDecision[];
}
