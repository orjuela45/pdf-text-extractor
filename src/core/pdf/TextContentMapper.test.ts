import { describe, expect, it } from 'vitest';

import { RawItemFactory } from '../../test/RawItemFactory';
import type { RawTextContentItem } from '../models';
import { TextContentMapper } from './TextContentMapper';

const mapper = new TextContentMapper();
const items = new RawItemFactory();

describe('TextContentMapper', () => {
  describe('map', () => {
    it('returns no fragments for empty content', () => {
      expect(mapper.map([])).toEqual([]);
    });

    it('skips marked-content markers while keeping every character', () => {
      const content: RawTextContentItem[] = [
        { type: 'beginMarkedContent' },
        items.create('hola'),
        items.create(' mundo'),
        { type: 'endMarkedContent' },
      ];

      const fragments = mapper.map(content);

      expect(fragments).toHaveLength(2);
      expect(fragments.map((fragment) => fragment.text).join('')).toBe('hola mundo');
    });

    it('keeps whitespace-only runs instead of discarding their advance width', () => {
      const fragments = mapper.map([
        items.create('hola'),
        items.create(' '),
        items.create('mundo'),
      ]);

      expect(fragments).toHaveLength(3);
      expect(fragments[1]?.text).toBe(' ');
    });

    it('reads the baseline origin from matrix cells e and f', () => {
      const [fragment] = mapper.map([items.create('x', { transform: [12, 0, 0, 12, 72, 640] })]);

      expect(fragment?.x).toBe(72);
      expect(fragment?.y).toBe(640);
    });

    it('reads the font size as hypot(c, d), so a rotated matrix still reports it', () => {
      const [upright] = mapper.map([items.create('x', { transform: [12, 0, 0, 12, 72, 640] })]);
      const [rotated] = mapper.map([items.create('x', { transform: [0, 12, -12, 0, 72, 640] })]);

      expect(upright?.fontSize).toBe(12);
      expect(rotated?.fontSize).toBe(12);
    });

    it('falls back to left-to-right only for directions it does not recognise', () => {
      const directions = ['bogus', 'rtl', 'ttb'].map(
        (dir) => mapper.map([items.create('x', { dir })])[0]?.direction,
      );

      expect(directions).toEqual(['ltr', 'rtl', 'ttb']);
    });

    it('degrades a single bad cell instead of the whole fragment, and never loses text', () => {
      const fragments = mapper.map([
        items.create('hola', { transform: [10, 0, 0, 10] }),
        items.create('mundo', { transform: [10, 0, 0, 10, Number.NaN, 700] }),
      ]);

      expect(fragments.map((fragment) => fragment.text).join('')).toBe('holamundo');
      expect(fragments[0]?.x).toBe(0);
      expect(fragments[0]?.y).toBe(0);
      expect(fragments[0]?.fontSize).toBe(10);
      expect(fragments[1]?.x).toBe(0);
      expect(fragments[1]?.y).toBe(700);
      expect(fragments[1]?.fontSize).toBe(10);
    });
  });
});
