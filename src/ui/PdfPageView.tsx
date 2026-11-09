import { useEffect, useMemo, type MouseEvent, type RefObject } from 'react';
import { CoordinateMapper } from './CoordinateMapper';
import { SectionHighlighter } from './SectionHighlighter';
import { TextLayerBuilder } from './TextLayerBuilder';
import { HIGHLIGHT_LABEL_OFFSET, HIGHLIGHT_LABEL_PREFIX } from './constants';
import type { TextBlock, TextFragment } from '../core/models';
import type { Point } from './models';

export interface PdfPageViewProps {
  readonly width: number;
  readonly height: number;
  readonly transform: readonly number[];
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly textLayerRef: RefObject<HTMLDivElement | null>;
  readonly fragments?: readonly TextFragment[];
  readonly highlighted?: readonly TextBlock[];
  readonly highlightLabel?: string | null;
  readonly onCopyAt: (point: Point) => void;
}

export function PdfPageView({
  width,
  height,
  transform,
  canvasRef,
  textLayerRef,
  fragments = [],
  highlighted = [],
  highlightLabel = null,
  onCopyAt,
}: PdfPageViewProps) {
  const mapper = useMemo(() => new CoordinateMapper(transform), [transform]);
  const textLayerBuilder = useMemo(() => new TextLayerBuilder(), []);
  const scale = useMemo(
    () => Math.hypot(transform[0] as number, transform[1] as number),
    [transform],
  );

  useEffect(() => {
    const container = textLayerRef.current;

    if (container === null) {
      return;
    }

    textLayerBuilder.build(container, fragments, mapper, scale);
  }, [fragments, mapper, scale, textLayerBuilder, textLayerRef]);
  const highlighter = useMemo(() => new SectionHighlighter(), []);
  const boxes = useMemo(() => highlighter.boxesFor(highlighted), [highlighter, highlighted]);

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
      className="pdf-page relative overflow-hidden bg-white shadow-sheet"
      style={{ width, height }}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="block" />
      <div className="pointer-events-none absolute inset-0 z-[1]">
        {boxes.map((box, index) => {
          const topLeft = mapper.toViewport({
            x: box.left,
            y: box.top,
          });
          const corner = mapper.toViewport({
            x: box.left + box.width,
            y: box.top - box.height,
          });

          return (
            <span
              key={index}
              aria-hidden="true"
              className="absolute rounded-sm border border-primary-container/70 bg-primary-container/10"
              style={{
                left: Math.min(topLeft.x, corner.x),
                top: Math.min(topLeft.y, corner.y),
                width: Math.abs(corner.x - topLeft.x),
                height: Math.abs(corner.y - topLeft.y),
              }}
            />
          );
        })}
      </div>
      {highlightLabel !== null && boxes[0] !== undefined ? (
        <span
          role="status"
          className="absolute z-[3] rounded-sm bg-primary-container px-2 py-0.5 font-sans text-[0.6875rem] font-medium text-on-primary shadow-glass"
          style={{
            left: Math.max(0, mapper.toViewport({ x: boxes[0].left, y: boxes[0].top }).x),
            top: Math.max(
              0,
              mapper.toViewport({ x: boxes[0].left, y: boxes[0].top }).y - HIGHLIGHT_LABEL_OFFSET,
            ),
          }}
        >
          {HIGHLIGHT_LABEL_PREFIX}: {highlightLabel}
        </span>
      ) : null}
      <div ref={textLayerRef} className="textLayer" />
    </div>
  );
}
