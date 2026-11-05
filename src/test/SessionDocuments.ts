import { FakePdfDocument } from './FakePdfDocument';
import { FakePdfPage } from './FakePdfPage';
import { RawItemFactory } from './RawItemFactory';

export class SessionDocuments {
  private readonly raw = new RawItemFactory();

  createSeparatedParagraphs(): FakePdfDocument {
    return new FakePdfDocument([
      new FakePdfPage({
        items: [
          this.raw.create('Primer párrafo completo', {
            transform: [10, 0, 0, 10, 100, 700],
            width: 140,
          }),
          this.raw.create('Segundo párrafo aparte', {
            transform: [10, 0, 0, 10, 100, 650],
            width: 130,
          }),
        ],
      }),
    ]);
  }

  createHeadings(): FakePdfDocument {
    const rows: readonly [string, number, number][] = [
      ['1. Introduccion', 18, 720],
      ['Texto de introduccion uno', 12, 690],
      ['Texto de introduccion dos', 12, 676],
      ['Metodos', 14, 640],
      ['Texto de metodos uno', 12, 610],
      ['Texto de metodos dos', 12, 596],
    ];

    return new FakePdfDocument([
      new FakePdfPage({
        items: rows.map(([text, size, y]) =>
          this.raw.create(text, {
            transform: [size, 0, 0, size, 100, y],
            width: text.length * 5,
            height: size,
          }),
        ),
      }),
    ]);
  }

  createTwoLineParagraph(): FakePdfDocument {
    return new FakePdfDocument([
      new FakePdfPage({
        items: [
          this.raw.create('Hola', { transform: [10, 0, 0, 10, 100, 700], width: 20 }),
          this.raw.create('mundo', { transform: [10, 0, 0, 10, 100, 688], width: 25 }),
        ],
      }),
    ]);
  }
}
