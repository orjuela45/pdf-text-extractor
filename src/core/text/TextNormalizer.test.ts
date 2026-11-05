import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../../test/FragmentFactory';
import { TextNormalizer } from './TextNormalizer';

const normalizer = new TextNormalizer();
const fragments = new FragmentFactory();

describe('TextNormalizer', () => {
  describe('normalize', () => {
    it('expands typographic ligatures', () => {
      const ligatures: readonly (readonly [string, string])[] = [
        ['\ufb00', 'ff'],
        ['\ufb01', 'fi'],
        ['\ufb02', 'fl'],
        ['\ufb03', 'ffi'],
        ['\ufb04', 'ffl'],
        ['\ufb06', 'st'],
      ];

      for (const [ligature, expansion] of ligatures) {
        expect(normalizer.normalize(`a${ligature}b`)).toBe(`a${expansion}b`);
      }
    });

    it('folds non-breaking and typographic spaces onto a plain space', () => {
      const spaces = ['\u00a0', '\u2007', '\u2009', '\u202f', '\u3000'];

      for (const space of spaces) {
        expect(normalizer.normalize(`a${space}b`)).toBe('a b');
      }
    });

    it('removes characters that are invisible when pasted', () => {
      const invisible = ['\u00ad', '\u200b', '\u200c', '\u200d', '\u2060', '\ufeff'];

      for (const character of invisible) {
        expect(normalizer.normalize(`a${character}b`)).toBe('ab');
      }
    });

    it('leaves ordinary text alone, including characters NFKC would rewrite', () => {
      const text = '¿Qué tal? — «citas» ½ ① 2³';

      expect(normalizer.normalize(text)).toBe(text);
    });

    it('walks by code point, so astral characters survive intact', () => {
      expect(normalizer.normalize('a😀b')).toBe('a😀b');
    });

    it('returns an empty string for empty input', () => {
      expect(normalizer.normalize('')).toBe('');
    });
  });

  describe('normalizeFragment', () => {
    it('changes the text and nothing else', () => {
      const fragment = fragments.create({
        text: 'a\ufb01b',
        x: 72,
        y: 700,
        width: 20,
        fontSize: 12,
      });

      const normalized = normalizer.normalizeFragment(fragment);

      expect(normalized.text).toBe('afib');
      expect(normalized.x).toBe(fragment.x);
      expect(normalized.y).toBe(fragment.y);
      expect(normalized.width).toBe(fragment.width);
      expect(normalized.fontSize).toBe(fragment.fontSize);
      expect(normalized.fontName).toBe(fragment.fontName);
      expect(normalized.direction).toBe(fragment.direction);
      expect(normalized.hasEOL).toBe(fragment.hasEOL);
    });
  });
});
