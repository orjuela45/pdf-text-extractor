import { MAX_PDF_FILE_BYTES } from './constants';

export interface FileSizeGuardConfig {
  readonly maxBytes?: number;
}

export class FileSizeGuard {
  private readonly maxBytes: number;

  constructor(config: FileSizeGuardConfig = {}) {
    this.maxBytes = config.maxBytes ?? MAX_PDF_FILE_BYTES;
  }

  exceeds(size: number): boolean {
    return size > this.maxBytes;
  }
}
