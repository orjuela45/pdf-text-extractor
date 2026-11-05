// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { FakeClipboard } from '../test/FakeClipboard';
import { SessionDocuments } from '../test/SessionDocuments';
import { ClipboardWriter } from './ClipboardWriter';
import { ExtractionSession } from './ExtractionSession';
import type { CopyOutcome, Point } from './models';
import { PdfPageView } from './PdfPageView';

interface ClickToCopyProbeProps {
  readonly session: ExtractionSession;
}

function ClickToCopyProbe({ session }: ClickToCopyProbeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [outcome, setOutcome] = useState<CopyOutcome>({ text: null, copied: false });

  const handleCopyAt = (point: Point): void => {
    void session.copyBlockAt(0, point).then(setOutcome);
  };

  return (
    <>
      <PdfPageView
        width={612}
        height={792}
        transform={[1, 0, 0, -1, 0, 792]}
        canvasRef={canvasRef}
        textLayerRef={textLayerRef}
        onCopyAt={handleCopyAt}
      />
      <p data-testid="outcome">{outcome.text ?? 'nada'}</p>
    </>
  );
}

describe('click to copy', () => {
  it('copies the corrected paragraph under the click through the viewer', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(new SessionDocuments().createSeparatedParagraphs());

    const { container } = render(<ClickToCopyProbe session={session} />);

    fireEvent.click(container.querySelector('.pdf-page') as Element, {
      clientX: 110,
      clientY: 87,
    });

    await waitFor(() => {
      expect(screen.getByTestId('outcome')).toHaveTextContent('Primer párrafo completo');
    });
    expect(clipboard.written).toEqual(['Primer párrafo completo']);
  });

  it('does not copy anything for a click between paragraphs', async () => {
    const clipboard = new FakeClipboard();
    const session = new ExtractionSession({ clipboard: new ClipboardWriter(clipboard) });

    await session.extract(new SessionDocuments().createSeparatedParagraphs());

    const { container } = render(<ClickToCopyProbe session={session} />);

    fireEvent.click(container.querySelector('.pdf-page') as Element, {
      clientX: 110,
      clientY: 112,
    });

    await waitFor(() => {
      expect(screen.getByTestId('outcome')).toHaveTextContent('nada');
    });
    expect(clipboard.written).toEqual([]);
  });
});
