import type { ClipboardLike } from '../ui/models';

export class FakeClipboard implements ClipboardLike {
  readonly written: string[] = [];

  private readonly succeeds: boolean;

  constructor(succeeds = true) {
    this.succeeds = succeeds;
  }

  async writeText(text: string): Promise<void> {
    if (!this.succeeds) {
      throw new Error('Clipboard write rejected');
    }

    this.written.push(text);
  }
}
