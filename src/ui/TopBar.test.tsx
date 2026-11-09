// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TopBar } from './TopBar';

const base = {
  fileName: null,
  fileSize: null,
  page: 1,
  pageCount: 0,
  zoom: 1,
  onPageChange: vi.fn(),
  onZoomChange: vi.fn(),
};

describe('TopBar', () => {
  it('has its own file input so loading keeps working without the drop zone', async () => {
    const onFile = vi.fn();
    const user = userEvent.setup();
    const file = new File(['%PDF'], 'documento.pdf', { type: 'application/pdf' });

    render(<TopBar {...base} onFile={onFile} />);

    await user.upload(screen.getByLabelText('Cargar PDF'), file);

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('opens its own file input from the load button', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const user = userEvent.setup();

    render(<TopBar {...base} onFile={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Cargar PDF' }));

    expect(click).toHaveBeenCalled();

    click.mockRestore();
  });
});
