import type { TextJoinDecision } from '../models';

export class SuspiciousJoinDetector {
  detect(joins: readonly TextJoinDecision[]): TextJoinDecision[] {
    return joins.filter((join) => this.isSuspicious(join));
  }

  private isSuspicious(join: TextJoinDecision): boolean {
    return !join.evaluated && join.gap > 0;
  }
}
