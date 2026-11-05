// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CopyFeedback } from './CopyFeedback';

describe('CopyFeedback', () => {
  it('shows the copied text after a successful copy', () => {
    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: true }} onDismiss={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Hola mundo');
  });

  it('offers a selectable box when the clipboard is unavailable', () => {
    render(<CopyFeedback outcome={{ text: 'Hola mundo', copied: false }} onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hola mundo');
  });

  it('renders nothing when there is no paragraph to report', () => {
    const { container } = render(
      <CopyFeedback outcome={{ text: null, copied: false }} onDismiss={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
