import { PasswordException, PasswordResponses } from 'pdfjs-dist';
import { describe, expect, it } from 'vitest';

import { PdfErrorMapper } from './PdfErrorMapper';

describe('PdfErrorMapper', () => {
  it('maps a password exception to the exact Spanish message', () => {
    const error = new PasswordException('no password', PasswordResponses.NEED_PASSWORD);

    expect(new PdfErrorMapper().describe(error)).toEqual({
      kind: 'password',
      message:
        'Este PDF está protegido con contraseña y no se puede leer. No intentamos descifrarlo.',
    });
  });

  it('maps any other load failure to the unreadable message', () => {
    expect(new PdfErrorMapper().describe(new Error('boom'))).toEqual({
      kind: 'unreadable',
      message: 'No se pudo leer el PDF. Verificá que el archivo no esté dañado.',
    });
  });

  it('describes an oversized file with the exact limit', () => {
    expect(new PdfErrorMapper().oversized()).toEqual({
      kind: 'oversized',
      message:
        'El archivo supera el límite de 100 MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.',
    });
  });

  it('uses the configured limit in the oversized message', () => {
    expect(new PdfErrorMapper({ maxBytes: 5 * 1024 * 1024 }).oversized().message).toBe(
      'El archivo supera el límite de 5 MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.',
    );
  });
});
