import { PasswordException } from 'pdfjs-dist';
import { MAX_PDF_FILE_BYTES, PASSWORD_ERROR_MESSAGE, UNREADABLE_ERROR_MESSAGE } from './constants';
import type { PdfErrorState } from './models';

export interface PdfErrorMapperConfig {
  readonly maxBytes?: number;
}

export class PdfErrorMapper {
  private readonly maxBytes: number;

  constructor(config: PdfErrorMapperConfig = {}) {
    this.maxBytes = config.maxBytes ?? MAX_PDF_FILE_BYTES;
  }

  describe(error: unknown): PdfErrorState {
    if (error instanceof PasswordException) {
      return { kind: 'password', message: PASSWORD_ERROR_MESSAGE };
    }

    return { kind: 'unreadable', message: UNREADABLE_ERROR_MESSAGE };
  }

  oversized(): PdfErrorState {
    const megabytes = Math.round(this.maxBytes / (1024 * 1024));

    return {
      kind: 'oversized',
      message: `El archivo supera el límite de ${megabytes} MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.`,
    };
  }
}
