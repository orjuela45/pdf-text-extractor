import { describe, expect, it } from 'vitest';

import { FileSizeGuard } from './FileSizeGuard';

describe('FileSizeGuard', () => {
  it('rejects a file larger than the default limit', () => {
    expect(new FileSizeGuard().exceeds(100 * 1024 * 1024 + 1)).toBe(true);
  });

  it('accepts a file at exactly the default limit', () => {
    expect(new FileSizeGuard().exceeds(100 * 1024 * 1024)).toBe(false);
  });

  it('honours an explicit limit', () => {
    const guard = new FileSizeGuard({ maxBytes: 10 });

    expect(guard.exceeds(11)).toBe(true);
    expect(guard.exceeds(10)).toBe(false);
  });
});
