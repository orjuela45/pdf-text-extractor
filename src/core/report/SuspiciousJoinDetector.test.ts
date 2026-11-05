import { describe, expect, it } from 'vitest';

import { JoinDecisionFactory } from '../../test/JoinDecisionFactory';
import { SuspiciousJoinDetector } from './SuspiciousJoinDetector';

const detector = new SuspiciousJoinDetector();
const decisions = new JoinDecisionFactory();

describe('SuspiciousJoinDetector', () => {
  it('returns nothing for no joins', () => {
    expect(detector.detect([])).toEqual([]);
  });

  it('flags a separator whose advance is narrower than the gap to the next fragment', () => {
    const join = decisions.create({ evaluated: false, gap: 7, threshold: 2.5 });

    expect(detector.detect([join])).toEqual([join]);
  });

  it('ignores a separator that spans the whole gap', () => {
    const join = decisions.create({ evaluated: false, gap: 0, threshold: 2.5 });

    expect(detector.detect([join])).toEqual([]);
  });

  it('ignores a separator that overlaps the next fragment', () => {
    const join = decisions.create({ evaluated: false, gap: -3, threshold: 2.5 });

    expect(detector.detect([join])).toEqual([]);
  });

  it('ignores a join the rule evaluated and resolved on its own', () => {
    const join = decisions.create({ evaluated: true, gap: 9, insertedSeparator: true });

    expect(detector.detect([join])).toEqual([]);
  });

  it('keeps only the suspicious joins of a mixed line', () => {
    const spanning = decisions.create({ evaluated: false, gap: 0 });
    const suspicious = decisions.create({ evaluated: false, gap: 4 });
    const resolved = decisions.create({ evaluated: true, gap: 9, insertedSeparator: true });

    expect(detector.detect([spanning, suspicious, resolved])).toEqual([suspicious]);
  });

  it('does not mutate the joins it is given', () => {
    const join = decisions.create({ evaluated: false, gap: 4 });
    const snapshot = structuredClone(join);

    detector.detect([join]);

    expect(join).toEqual(snapshot);
  });
});
