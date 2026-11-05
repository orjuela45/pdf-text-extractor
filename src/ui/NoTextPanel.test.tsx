// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NoTextPanel } from './NoTextPanel';

describe('NoTextPanel', () => {
  it('makes the missing text layer explicit instead of leaving an empty viewer', () => {
    render(<NoTextPanel />);

    expect(
      screen.getByRole('heading', { name: 'Este PDF no tiene texto extraíble' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no hace OCR/)).toBeInTheDocument();
  });
});
