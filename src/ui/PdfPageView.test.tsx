// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PdfPageView } from './PdfPageView';

const canvasRef = createRef<HTMLCanvasElement>();
const textLayerRef = createRef<HTMLDivElement>();

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PdfPageView', () => {
  it('converts a click to PDF user-space coordinates', () => {
    const onCopyAt = vi.fn();
    const { container } = render(
      <PdfPageView
        width={612}
        height={792}
        transform={[1, 0, 0, -1, 0, 792]}
        canvasRef={canvasRef}
        textLayerRef={textLayerRef}
        onCopyAt={onCopyAt}
      />,
    );

    const page = container.querySelector('.pdf-page');

    fireEvent.click(page as Element, { clientX: 110, clientY: 87 });

    expect(onCopyAt).toHaveBeenCalledWith({ x: 110, y: 705 });
  });

  it('ignores a click that ends a native text selection', () => {
    const onCopyAt = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'texto seleccionado',
    } as unknown as Selection);

    const { container } = render(
      <PdfPageView
        width={612}
        height={792}
        transform={[1, 0, 0, -1, 0, 792]}
        canvasRef={canvasRef}
        textLayerRef={textLayerRef}
        onCopyAt={onCopyAt}
      />,
    );

    const page = container.querySelector('.pdf-page');

    fireEvent.click(page as Element, { clientX: 110, clientY: 87 });

    expect(onCopyAt).not.toHaveBeenCalled();
  });
});
