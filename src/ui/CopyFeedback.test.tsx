// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CopyFeedback } from './CopyFeedback';

describe('CopyFeedback', () => {
  it('renders nothing when the copy succeeded, because the bar confirms it', () => {
    const { container } = render(
      <CopyFeedback outcome={{ text: 'Hola mundo', copied: true }} onDismiss={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('offers a selectable box when the clipboard is unavailable', () => {
    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: false }} onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hola mundo');
  });

  it('explains the failure without claiming the copy worked', () => {
    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: false }} onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo copiar automáticamente');
  });

  it('selects the fallback text so it can be copied by hand', () => {
    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: false }} onDismiss={vi.fn()} />);

    const box = screen.getByRole('textbox');

    expect(box).toHaveValue('Hola mundo');
    expect(box).toHaveFocus();
  });

  it('dismisses through its own control', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: false }} onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when there is nothing to report', () => {
    const { container } = render(
      <CopyFeedback outcome={{ text: null, copied: false }} onDismiss={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
