import type { TextAssemblerConfig, TextJoinDecision } from './assembly';
import type { TextBlock } from './block';
import type { PdfDocumentModel } from './page';
import type { TextSection } from './section';
import type { TextLine } from './text';

export interface QualityReporterConfig {
  readonly assembler?: TextAssemblerConfig;
}

export interface QualityReportInput {
  readonly document: PdfDocumentModel;
  readonly lines: readonly (readonly TextLine[])[];
  readonly blocks: readonly (readonly TextBlock[])[];
  readonly sections: readonly TextSection[];
}

export interface SuspiciousJoin extends TextJoinDecision {
  readonly pageIndex: number;
  readonly lineIndex: number;
}

export interface ExtractionStats {
  readonly pages: number;
  readonly pagesWithoutText: number;
  readonly fragments: number;
  readonly lines: number;
  readonly blocks: number;
  readonly sections: number;
  readonly characters: number;
}

export interface QualityReport {
  readonly pagesWithoutText: readonly number[];
  readonly suspiciousJoins: readonly SuspiciousJoin[];
  readonly stats: ExtractionStats;
}
