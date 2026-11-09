import {
  PDFDict,
  PDFDocument,
  PDFName,
  StandardFonts,
  beginText,
  concatTransformationMatrix,
  degrees,
  endText,
  setFontAndSize,
  setTextMatrix,
  showText,
} from 'pdf-lib';
import type { PDFFont, PDFPage } from 'pdf-lib';

export class PdfFixtureFactory {
  async separatedWords(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'palabras', 72, 700, 12);
    this.draw(page, font, 'pegadas', 148, 700, 12);
    return await document.save();
  }

  async gluedRuns(): Promise<Uint8Array> {
    const document = await PDFDocument.create({ updateMetadata: false });
    const page = document.addPage([612, 792]);
    const left = await document.embedStandardFont(StandardFonts.Helvetica);
    const right = await document.embedStandardFont(StandardFonts.TimesRoman);
    const firstWidth = left.widthOfTextAtSize('pala', 12);
    this.draw(page, left, 'pala', 72, 700, 12);
    this.draw(page, right, 'bras', 72 + firstWidth, 700, 12);
    return await document.save();
  }

  async ligatureAndNbsp(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'o#cina\u00a0re~ejo', 72, 700, 12);
    await font.embed();

    const cmap = `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<00> <FF>
endcodespacerange
2 beginbfchar
<23> <FB01>
<7E> <FB02>
endbfchar
endcmap
CMapName currentdict /CMap defineresource pop
end
end`;

    const toUnicode = document.context.register(document.context.flateStream(cmap));
    document.context.lookup(font.ref, PDFDict).set(PDFName.of('ToUnicode'), toUnicode);

    return await document.save();
  }

  async paragraphs(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'Primera linea indentada', 90, 700, 12);
    this.draw(page, font, 'segunda linea del parrafo', 72, 686, 12);
    this.draw(page, font, 'Segundo parrafo', 72, 650, 12);
    return await document.save();
  }

  async headings(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, '1. Introduccion', 72, 720, 18);
    this.draw(page, font, 'Texto de introduccion uno', 72, 690, 12);
    this.draw(page, font, 'Texto de introduccion dos', 72, 676, 12);
    this.draw(page, font, 'Metodos', 72, 640, 14);
    this.draw(page, font, 'Texto de metodos uno', 72, 610, 12);
    this.draw(page, font, 'Texto de metodos dos', 72, 596, 12);
    return await document.save();
  }

  async hyphenatedBreak(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'extra-', 72, 700, 12);
    this.draw(page, font, 'ordinario', 72, 686, 12);
    return await document.save();
  }

  async separatorNarrowerThanGap(): Promise<Uint8Array> {
    const document = await PDFDocument.create({ updateMetadata: false });
    const page = document.addPage([612, 792]);
    const left = await document.embedStandardFont(StandardFonts.Helvetica);
    const right = await document.embedStandardFont(StandardFonts.TimesRoman);
    const leftKey = page.node.newFontDictionary(left.name, left.ref);
    const rightKey = page.node.newFontDictionary(right.name, right.ref);
    const scale = 3;
    const leftWidth = left.widthOfTextAtSize('pala', 12);

    page.pushOperators(
      concatTransformationMatrix(scale, 0, 0, scale, 0, 0),
      beginText(),
      setFontAndSize(leftKey, 12),
      setTextMatrix(1, 0, 0, 1, 72 / scale, 700 / scale),
      showText(left.encodeText('pala')),
      setFontAndSize(rightKey, 12),
      setTextMatrix(1, 0, 0, 1, 72 / scale + leftWidth + 2, 700 / scale),
      showText(right.encodeText('bras')),
      endText(),
    );

    return await document.save();
  }

  async twoColumns(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'columna izquierda uno', 72, 700, 12);
    this.draw(page, font, 'columna izquierda dos', 72, 686, 12);
    this.draw(page, font, 'columna derecha uno', 330, 700, 12);
    this.draw(page, font, 'columna derecha dos', 330, 686, 12);
    return await document.save();
  }

  async hyphenCompound(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    this.draw(page, font, 'El acuerdo fue franco-', 72, 700, 12);
    this.draw(page, font, 'aleman y beneficioso', 72, 686, 12);
    return await document.save();
  }

  async twoColumnTable(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    const rows: readonly (readonly [string, string])[] = [
      ['Concepto', 'Importe'],
      ['Ingresos', '1.250'],
      ['Costes', '840'],
    ];

    rows.forEach(([left, right], index) => {
      const y = 700 - index * 14;
      this.draw(page, font, left, 72, y, 12);
      this.draw(page, font, right, 400, y, 12);
    });

    return await document.save();
  }

  async boldHeadings(): Promise<Uint8Array> {
    const document = await PDFDocument.create({ updateMetadata: false });
    const page = document.addPage([612, 792]);
    const body = await document.embedStandardFont(StandardFonts.Helvetica);
    const bold = await document.embedStandardFont(StandardFonts.HelveticaBold);

    this.draw(page, bold, 'Resultados del ejercicio', 72, 700, 12);
    this.draw(page, body, 'El texto del parrafo empieza aca', 72, 670, 12);
    this.draw(page, body, 'y sigue en la linea del cuerpo', 72, 656, 12);
    this.draw(page, bold, 'Metodologia', 72, 610, 12);
    this.draw(page, body, 'La segunda seccion del cuerpo', 72, 580, 12);
    this.draw(page, body, 'con otra linea de parrafo', 72, 566, 12);

    return await document.save();
  }

  async noTextLayer(): Promise<Uint8Array> {
    const { document, page } = await this.createPage();
    page.drawRectangle({ x: 72, y: 700, width: 200, height: 40 });
    return await document.save();
  }

  async rotatedPage(): Promise<Uint8Array> {
    const { document, page, font } = await this.createPage();
    page.setRotation(degrees(90));
    this.draw(page, font, 'parrafo rotado', 72, 700, 12);
    return await document.save();
  }

  async threePages(): Promise<Uint8Array> {
    const document = await PDFDocument.create({ updateMetadata: false });
    const font = await document.embedStandardFont(StandardFonts.Helvetica);

    const lines = ['primera pagina', 'segunda pagina', 'tercera pagina'];

    for (const text of lines) {
      const page = document.addPage([612, 792]);
      this.draw(page, font, text, 72, 700, 12);
    }

    return await document.save();
  }

  private async createPage(): Promise<{ document: PDFDocument; page: PDFPage; font: PDFFont }> {
    const document = await PDFDocument.create({ updateMetadata: false });
    const page = document.addPage([612, 792]);
    const font = await document.embedStandardFont(StandardFonts.Helvetica);

    return { document, page, font };
  }

  private draw(
    page: PDFPage,
    font: PDFFont,
    text: string,
    x: number,
    y: number,
    size: number,
  ): void {
    page.drawText(text, { x, y, size, font });
  }
}
