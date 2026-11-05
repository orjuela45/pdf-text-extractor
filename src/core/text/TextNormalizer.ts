import { UNICODE_REPLACEMENTS } from '../constants';
import type { TextFragment } from '../models';

export class TextNormalizer {
  normalize(text: string): string {
    let result = '';

    for (const character of text) {
      const replacement = UNICODE_REPLACEMENTS.get(character);

      result += replacement ?? character;
    }

    return result;
  }

  normalizeFragment(fragment: TextFragment): TextFragment {
    return { ...fragment, text: this.normalize(fragment.text) };
  }
}
