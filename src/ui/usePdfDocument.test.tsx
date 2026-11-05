// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { PasswordException, PasswordResponses } from 'pdfjs-dist';
import { describe, expect, it, vi } from 'vitest';

import { PdfDocumentLoader } from '../core/pdf/PdfDocumentLoader';
import { ExtractionSession } from './ExtractionSession';
import { PdfDocumentSession } from './PdfDocumentSession';
import { usePdfDocument } from './usePdfDocument';

class SessionHarness {
  readonly loader = new PdfDocumentLoader('/virtual/pdf.worker.mjs');

  create(): PdfDocumentSession {
    return new PdfDocumentSession(this.loader, new ExtractionSession());
  }

  failWith(error: unknown): void {
    vi.spyOn(this.loader, 'load').mockRejectedValue(error);
  }
}

function createFile(name: string, size: number): File {
  return { name, size, arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) } as unknown as File;
}

describe('usePdfDocument errors', () => {
  it('reports an encrypted PDF with the password message instead of an empty viewer', async () => {
    const harness = new SessionHarness();
    harness.failWith(new PasswordException('need password', PasswordResponses.NEED_PASSWORD));
    const { result } = renderHook(() => usePdfDocument(harness.create()));

    await act(async () => {
      await result.current.open(createFile('protegido.pdf', 1024));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      kind: 'password',
      message:
        'Este PDF está protegido con contraseña y no se puede leer. No intentamos descifrarlo.',
    });
  });

  it('reports any other load failure as unreadable', async () => {
    const harness = new SessionHarness();
    harness.failWith(new Error('boom'));
    const { result } = renderHook(() => usePdfDocument(harness.create()));

    await act(async () => {
      await result.current.open(createFile('roto.pdf', 1024));
    });

    expect(result.current.error).toEqual({
      kind: 'unreadable',
      message: 'No se pudo leer el PDF. Verificá que el archivo no esté dañado.',
    });
  });

  it('refuses a file over the size limit before touching the loader', async () => {
    const harness = new SessionHarness();
    const load = vi.spyOn(harness.loader, 'load');
    const { result } = renderHook(() => usePdfDocument(harness.create()));

    await act(async () => {
      await result.current.open(createFile('enorme.pdf', 101 * 1024 * 1024));
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual({
      kind: 'oversized',
      message:
        'El archivo supera el límite de 100 MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.',
    });
    expect(load).not.toHaveBeenCalled();
  });
});
