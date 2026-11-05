// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OutlinePanel } from './OutlinePanel';

const entries = [
  { index: 0, heading: 'Introducción', level: 1, text: 'Introducción\n\nPrimer párrafo' },
  { index: 1, heading: 'Métodos', level: 2, text: 'Métodos\n\nCuerpo de métodos' },
];

describe('OutlinePanel', () => {
  it('lists every section heading and keeps its body out of the DOM until expanded', () => {
    render(<OutlinePanel entries={entries} onCopySection={vi.fn()} onCopyAll={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Introducción' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Métodos' })).toBeInTheDocument();
    expect(screen.queryByText(/Primer párrafo/)).not.toBeInTheDocument();
  });

  it('expands a section on demand with its text and copy action', async () => {
    const onCopySection = vi.fn();
    const user = userEvent.setup();

    render(<OutlinePanel entries={entries} onCopySection={onCopySection} onCopyAll={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Introducción' }));

    expect(screen.getByRole('button', { name: 'Introducción' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText(/Primer párrafo/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copiar sección: Introducción' }));

    expect(onCopySection).toHaveBeenCalledWith(0);
  });

  it('indents each section by its level', () => {
    render(<OutlinePanel entries={entries} onCopySection={vi.fn()} onCopyAll={vi.fn()} />);

    const first = screen.getByRole('button', { name: 'Introducción' }).closest('li');
    const second = screen.getByRole('button', { name: 'Métodos' }).closest('li');

    expect(first?.style.paddingInlineStart).toBe('1rem');
    expect(second?.style.paddingInlineStart).toBe('2rem');
  });

  it('copies the whole document through a keyboard reachable control', async () => {
    const onCopyAll = vi.fn();
    const user = userEvent.setup();

    render(<OutlinePanel entries={entries} onCopySection={vi.fn()} onCopyAll={onCopyAll} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Copiar todo el documento' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onCopyAll).toHaveBeenCalledTimes(1);
  });

  it('states that no sections were detected', () => {
    render(<OutlinePanel entries={[]} onCopySection={vi.fn()} onCopyAll={vi.fn()} />);

    expect(screen.getByText('No se detectaron secciones.')).toBeInTheDocument();
  });
});
