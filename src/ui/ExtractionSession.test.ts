import { describe, expect, it } from 'vitest';

import { FakeClipboard } from '../test/FakeClipboard';
import { SessionDocuments } from '../test/SessionDocuments';
import { ClipboardWriter } from './ClipboardWriter';
import { ExtractionSession } from './ExtractionSession';

const documents = new SessionDocuments();

describe('ExtractionSession', () => {
  it('copies the corrected text of the paragraph under the point', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(documents.createSeparatedParagraphs());

    const outcome = await session.copyBlockAt(0, { x: 110, y: 705 });

    expect(outcome).toEqual({ text: 'Primer párrafo completo', copied: true });
    expect(clipboard.written).toEqual(['Primer párrafo completo']);
  });

  it('assembles a multi-line paragraph instead of dumping its fragments', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createTwoLineParagraph());

    const outcome = await session.copyBlockAt(0, { x: 110, y: 705 });

    expect(outcome).toEqual({ text: 'Hola mundo', copied: true });
  });

  it('returns no text for a click that lands between paragraphs', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createSeparatedParagraphs());

    expect(await session.copyBlockAt(0, { x: 110, y: 680 })).toEqual({
      text: null,
      copied: false,
    });
  });

  it('returns no text for a page that does not exist', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createSeparatedParagraphs());

    expect(await session.copyBlockAt(7, { x: 110, y: 705 })).toEqual({ text: null, copied: false });
  });

  it('keeps the text but reports failure when the clipboard rejects', async () => {
    const session = new ExtractionSession({
      clipboard: new ClipboardWriter(new FakeClipboard(false)),
    });

    await session.extract(documents.createSeparatedParagraphs());

    expect(await session.copyBlockAt(0, { x: 110, y: 705 })).toEqual({
      text: 'Primer párrafo completo',
      copied: false,
    });
  });

  it('builds one viewer page per document page with its blocks', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createSeparatedParagraphs());

    expect(session.viewerPages).toHaveLength(1);
    expect(session.viewerPages[0]?.index).toBe(0);
    expect(session.viewerPages[0]?.blocks).toHaveLength(2);
  });

  it('reports the extraction quality of the document', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createSeparatedParagraphs());

    expect(session.qualityReport?.stats).toEqual({
      pages: 1,
      pagesWithoutText: 0,
      fragments: 2,
      lines: 2,
      blocks: 2,
      sections: 1,
      characters: 45,
    });
  });

  it('exposes one outline entry per block of the requested page', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createHeadings());

    expect(session.outlineFor(0).map((entry) => entry.text)).toEqual([
      '1. Introduccion',
      'Texto de introduccion uno Texto de introduccion dos',
      'Metodos',
      'Texto de metodos uno Texto de metodos dos',
    ]);
    expect(session.outlineFor(0).map((entry) => entry.page)).toEqual([1, 1, 1, 1]);
  });

  it('returns no outline entries for a page that does not exist', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createHeadings());

    expect(session.outlineFor(7)).toEqual([]);
  });

  it('copies a single outline block on its own', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(documents.createHeadings());

    const outcome = await session.copyOutlineBlock(0, 0);

    expect(outcome).toEqual({ text: '1. Introduccion', copied: true });
    expect(clipboard.written).toEqual(['1. Introduccion']);
  });

  it('exposes the block behind an outline entry so it can be highlighted', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createHeadings());

    expect(session.outlineBlock(0, 0)).toBe(session.outlineFor(0)[0]?.block);
    expect(session.outlineBlock(0, 99)).toBeNull();
  });

  it('copies a section as its heading plus its assembled blocks', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(documents.createHeadings());

    const outcome = await session.copySection(0);

    expect(outcome).toEqual({
      text: '1. Introduccion\n\nTexto de introduccion uno Texto de introduccion dos',
      copied: true,
    });
    expect(clipboard.written).toEqual([
      '1. Introduccion\n\nTexto de introduccion uno Texto de introduccion dos',
    ]);
  });

  it('copies the whole document text', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(documents.createHeadings());

    const outcome = await session.copyAll();

    expect(outcome).toEqual({
      text: '1. Introduccion\n\nTexto de introduccion uno Texto de introduccion dos\n\nMetodos\n\nTexto de metodos uno Texto de metodos dos',
      copied: true,
    });
    expect(clipboard.written).toHaveLength(1);
  });

  it('returns no text for a section that does not exist', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createHeadings());

    expect(await session.copySection(9)).toEqual({ text: null, copied: false });
  });

  it('returns no text for an outline block that does not exist', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    await session.extract(documents.createHeadings());

    expect(await session.copyOutlineBlock(0, 99)).toEqual({ text: null, copied: false });
    expect(await session.copyOutlineBlock(7, 0)).toEqual({ text: null, copied: false });
  });

  it('returns no text when there is nothing extracted yet', async () => {
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(new FakeClipboard()) });

    expect(await session.copyAll()).toEqual({ text: null, copied: false });
  });
});
