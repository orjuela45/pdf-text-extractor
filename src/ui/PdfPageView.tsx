import { useMemo, type MouseEvent, type RefObject } from 'react';
import { CoordinateMapper } from './CoordinateMapper';
import type { Point } from './models';

export interface PdfPageViewProps {
  readonly width: number;
  readonly height: number;
  readonly transform: readonly number[];
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly textLayerRef: RefObject<HTMLDivElement | null>;
  readonly onCopyAt: (point: Point) => void;
}

export function PdfPageView({
  width,
  height,
  transform,
  canvasRef,
  textLayerRef,
  onCopyAt,
}: PdfPageViewProps) {
  const mapper = useMemo(() => new CoordinateMapper(transform), [transform]);

  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    const selection = window.getSelection();

    if (selection !== null && selection.toString() !== '') {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    onCopyAt(mapper.toUserSpace({ x: event.clientX - rect.left, y: event.clientY - rect.top }));
  };

  return (
    <div
      className="pdf-page relative overflow-hidden bg-white shadow-md ring-1 ring-slate-200 dark:ring-slate-800"
      style={{ width, height }}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="block" />
      <div ref={textLayerRef} className="textLayer" />
    </div>
  );
}
