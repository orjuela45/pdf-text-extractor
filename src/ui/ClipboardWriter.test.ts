// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { FakeClipboard } from '../test/FakeClipboard';
import { ClipboardWriter } from './ClipboardWriter';

describe('ClipboardWriter', () => {
  it('writes the text and reports success', async () => {
    const clipboard = new FakeClipboard();
    const writer = new ClipboardWriter(clipboard);

    expect(await writer.write('texto corregido')).toBe(true);
    expect(clipboard.written).toEqual(['texto corregido']);
  });

  it('reports failure when the clipboard rejects the write', async () => {
    const writer = new ClipboardWriter(new FakeClipboard(false));

    expect(await writer.write('texto corregido')).toBe(false);
  });

  it('reports failure when the clipboard is not available', async () => {
    const writer = new ClipboardWriter();

    expect(await writer.write('texto corregido')).toBe(false);
  });
});
