import { describe, expect, it } from 'vitest';

import { CoordinateMapper } from './CoordinateMapper';

describe('CoordinateMapper', () => {
  it('maps user space to the viewport with the identity transform', () => {
    const mapper = new CoordinateMapper([1, 0, 0, 1, 0, 0]);

    expect(mapper.toViewport({ x: 72, y: 700 })).toEqual({ x: 72, y: 700 });
  });

  it('flips the y axis the way a pdf.js viewport does', () => {
    const mapper = new CoordinateMapper([1, 0, 0, -1, 0, 792]);

    expect(mapper.toViewport({ x: 0, y: 0 })).toEqual({ x: 0, y: 792 });
    expect(mapper.toViewport({ x: 0, y: 792 })).toEqual({ x: 0, y: 0 });
    expect(mapper.toViewport({ x: 72, y: 700 })).toEqual({ x: 72, y: 92 });
  });

  it('scales with the viewport scale', () => {
    const mapper = new CoordinateMapper([2, 0, 0, -2, 0, 1584]);

    expect(mapper.toViewport({ x: 72, y: 700 })).toEqual({ x: 144, y: 184 });
  });

  it('maps viewport points back to user space', () => {
    const mapper = new CoordinateMapper([1, 0, 0, -1, 0, 792]);
    const origin = mapper.toUserSpace({ x: 0, y: 792 });
    const point = mapper.toUserSpace({ x: 72, y: 92 });

    expect(origin.x).toBeCloseTo(0, 10);
    expect(origin.y).toBeCloseTo(0, 10);
    expect(point.x).toBeCloseTo(72, 10);
    expect(point.y).toBeCloseTo(700, 10);
  });

  it('round trips a rotated transform in both directions', () => {
    const mapper = new CoordinateMapper([0, 1, 1, 0, 0, 0]);
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 72, y: 700 },
    ];

    for (const point of points) {
      const back = mapper.toUserSpace(mapper.toViewport(point));

      expect(back.x).toBeCloseTo(point.x, 10);
      expect(back.y).toBeCloseTo(point.y, 10);
    }
  });
});
