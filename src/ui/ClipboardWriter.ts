import type { ClipboardLike } from './models';

export class ClipboardWriter {
  private readonly clipboard: ClipboardLike | undefined;

  constructor(clipboard?: ClipboardLike) {
    this.clipboard = clipboard ?? this.detect();
  }

  async write(text: string): Promise<boolean> {
    if (this.clipboard === undefined) {
      return false;
    }

    try {
      await this.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  private detect(): ClipboardLike | undefined {
    if (typeof navigator === 'undefined') {
      return undefined;
    }

    return navigator.clipboard;
  }
}
