import { describe, expect, it } from 'vitest';

import {
  isBlank,
  isTextItem,
  toFragment,
  toFragments,
  type RawTextContentItem,
  type RawTextItem,
} from './text-content';

function item(text: string, overrides: Partial<RawTextItem> = {}): RawTextItem {
  return {
    str: text,
    dir: 'ltr',
    transform: [10, 0, 0, 10, 100, 700],
    width: text.length * 5,
    height: 10,
    fontName: 'g_d0_f1',
    hasEOL: false,
    ...overrides,
  };
}

describe('isTextItem', () => {
  it('separates real text runs from marked-content markers', () => {
    expect(isTextItem(item('hola'))).toBe(true);
    expect(isTextItem({ type: 'beginMarkedContent' })).toBe(false);
  });
});

describe('toFragments', () => {
  it('skips marked-content markers while keeping every character', () => {
    const items: RawTextContentItem[] = [
      { type: 'beginMarkedContent' },
      item('hola'),
      item(' mundo'),
      { type: 'endMarkedContent' },
    ];

    const fragments = toFragments(items);

    expect(fragments).toHaveLength(2);
    expect(fragments.map((fragment) => fragment.text).join('')).toBe('hola mundo');
  });
});

describe('toFragment', () => {
  it('reads the baseline origin from matrix cells e and f', () => {
    const fragment = toFragment(item('x', { transform: [12, 0, 0, 12, 72, 640] }));

    expect(fragment.x).toBe(72);
    expect(fragment.y).toBe(640);
  });

  it('reads the font size as hypot(c, d), so a rotated matrix still reports it', () => {
    const upright = toFragment(item('x', { transform: [12, 0, 0, 12, 72, 640] }));
    const rotated = toFragment(item('x', { transform: [0, 12, -12, 0, 72, 640] }));

    expect(upright.fontSize).toBe(12);
    expect(rotated.fontSize).toBe(12);
  });

  it('keeps whitespace-only runs instead of discarding their advance width', () => {
    const fragments = toFragments([item('hola'), item(' '), item('mundo')]);

    expect(fragments).toHaveLength(3);
    expect(fragments[1]?.text).toBe(' ');
  });

  it('falls back to left-to-right only for directions it does not recognise', () => {
    expect(toFragment(item('x', { dir: 'bogus' })).direction).toBe('ltr');
    expect(toFragment(item('x', { dir: 'rtl' })).direction).toBe('rtl');
    expect(toFragment(item('x', { dir: 'ttb' })).direction).toBe('ttb');
  });

  it('degrades a single bad cell instead of the whole fragment, and never loses text', () => {
    const fragments = toFragments([
      item('hola', { transform: [10, 0, 0, 10] }),
      item('mundo', { transform: [10, 0, 0, 10, Number.NaN, 700] }),
    ]);

    expect(fragments.map((fragment) => fragment.text).join('')).toBe('holamundo');
    // A truncated matrix has no origin at all, so both axes fall back to zero.
    expect(fragments[0]?.x).toBe(0);
    expect(fragments[0]?.y).toBe(0);
    expect(fragments[0]?.fontSize).toBe(10);
    // A non-finite cell only ruins its own axis: the readable origin survives.
    expect(fragments[1]?.x).toBe(0);
    expect(fragments[1]?.y).toBe(700);
    expect(fragments[1]?.fontSize).toBe(10);
  });
});

describe('isBlank', () => {
  it('treats non-breaking spaces and tabs as blank, but not punctuation', () => {
    expect(isBlank(toFragment(item(' ')))).toBe(true);
    expect(isBlank(toFragment(item('\u00a0')))).toBe(true);
    expect(isBlank(toFragment(item('\t')))).toBe(true);
    expect(isBlank(toFragment(item('.')))).toBe(false);
  });
});
