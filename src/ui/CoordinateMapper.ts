import type { Point } from './models';

export class CoordinateMapper {
  private readonly a: number;
  private readonly b: number;
  private readonly c: number;
  private readonly d: number;
  private readonly e: number;
  private readonly f: number;
  private readonly determinant: number;

  constructor(transform: readonly number[]) {
    const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0] = transform;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.determinant = a * d - b * c;
  }

  toViewport(point: Point): Point {
    return {
      x: this.a * point.x + this.c * point.y + this.e,
      y: this.b * point.x + this.d * point.y + this.f,
    };
  }

  toUserSpace(point: Point): Point {
    const dx = point.x - this.e;
    const dy = point.y - this.f;

    return {
      x: (this.d * dx - this.c * dy) / this.determinant,
      y: (-this.b * dx + this.a * dy) / this.determinant,
    };
  }
}
