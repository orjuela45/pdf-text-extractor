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
