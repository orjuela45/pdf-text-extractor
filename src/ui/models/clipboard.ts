export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}
