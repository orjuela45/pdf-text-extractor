import type { TextJoinDecision } from '../core/models';

export class JoinDecisionFactory {
  create(overrides: Partial<TextJoinDecision> = {}): TextJoinDecision {
    return {
      previousText: 'a',
      nextText: 'b',
      gap: 2.5,
      threshold: 2.5,
      fontSize: 10,
      evaluated: true,
      insertedSeparator: false,
      crossesFontBoundary: false,
      ...overrides,
    };
  }
}
