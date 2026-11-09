import type { TextFragment } from '../core/models';
import { CoordinateMapper } from './CoordinateMapper';

export class TextLayerBuilder {
  build(
    container: HTMLElement,
    fragments: readonly TextFragment[],
    mapper: CoordinateMapper,
    scale: number,
  ): void {
    const spans: HTMLSpanElement[] = [];

    for (const fragment of fragments) {
      if (fragment.text === '') {
        continue;
      }

      const span = document.createElement('span');
      span.textContent = fragment.text;

      const start = mapper.toViewport({ x: fragment.x, y: fragment.y });
      const end = mapper.toViewport({
        x: fragment.x + fragment.width,
        y: fragment.y + fragment.height,
      });
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);

      span.style.left = `${left}px`;
      span.style.top = `${top}px`;
      span.style.width = `${Math.abs(end.x - start.x)}px`;
      span.style.height = `${Math.abs(end.y - start.y)}px`;
      span.style.fontSize = `${fragment.fontSize * scale}px`;
      span.style.fontFamily = fragment.fontName;
      spans.push(span);
    }

    container.replaceChildren(...spans);
  }
}
