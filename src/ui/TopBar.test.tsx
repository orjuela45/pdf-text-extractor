// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { COPY_CONFIRMATION_LABEL } from './constants';
import { TopBar } from './TopBar';

const base = {
  fileName: null,
  fileSize: null,
  page: 1,
  pageCount: 0,
  zoom: 1,
  onPageChange: vi.fn(),
  onZoomChange: vi.fn(),
  onFile: vi.fn(),
};

describe('TopBar', () => {
  it('shows nothing about copying by default', () => {
    render(<TopBar {...base} />);

    expect(screen.queryByText(COPY_CONFIRMATION_LABEL)).not.toBeInTheDocument();
  });

  it('confirms a copy in the bar without adding anything to the page body', () => {
    render(<TopBar {...base} copyConfirmed />);

    expect(screen.getByText(COPY_CONFIRMATION_LABEL)).toBeInTheDocument();
  });

  it('announces the confirmation politely for assistive technology', () => {
    render(<TopBar {...base} copyConfirmed />);

    expect(screen.getByRole('status')).toHaveTextContent(COPY_CONFIRMATION_LABEL);
  });

  it('has its own file input so loading keeps working without the drop zone', async () => {
    render(<TopBar {...base} />);

    expect(screen.getByLabelText('Cargar PDF')).toBeInTheDocument();
  });
});
