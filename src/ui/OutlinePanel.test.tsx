// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OutlinePanel } from './OutlinePanel';

const entries = [
  { index: 0, heading: 'Introducción', level: 1, text: 'Introducción\n\nPrimer párrafo', page: 1 },
  { index: 1, heading: 'Métodos', level: 2, text: 'Métodos\n\nCuerpo de métodos', page: 3 },
];

describe('OutlinePanel', () => {
  it('lists every section as a card with its page and a text preview', () => {
    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /^Introducción/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Métodos/ })).toBeInTheDocument();
    expect(screen.getByText('Pág. 1')).toBeInTheDocument();
    expect(screen.getByText('Pág. 3')).toBeInTheDocument();
    expect(screen.getByText(/Primer párrafo/)).toBeInTheDocument();
  });

  it('selects a section without copying it when its card is chosen', async () => {
    const onSelectSection = vi.fn();
    const onCopySection = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={onSelectSection}
        onCopySection={onCopySection}
        onCopyAll={vi.fn()}
      />,
    );

    const card = screen.getByRole('button', { name: /^Introducción/ });

    await user.click(card);

    expect(onSelectSection).toHaveBeenCalledWith(0);
    expect(onCopySection).not.toHaveBeenCalled();
    expect(card).toHaveAttribute('aria-current', 'true');
  });

  it('copies a section through its own control without selecting it', async () => {
    const onSelectSection = vi.fn();
    const onCopySection = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={onSelectSection}
        onCopySection={onCopySection}
        onCopyAll={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copiar la sección: Métodos' }));

    expect(onCopySection).toHaveBeenCalledWith(1);
    expect(onSelectSection).not.toHaveBeenCalled();
  });

  it('indents each section by its level', () => {
    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={vi.fn()}
      />,
    );

    const first = screen.getByRole('button', { name: /^Introducción/ }).parentElement;
    const second = screen.getByRole('button', { name: /^Métodos/ }).parentElement;

    expect(first?.style.marginInlineStart).toBe('0rem');
    expect(second?.style.marginInlineStart).toBe('1rem');
  });

  it('marks the selected section with a visible label, not only a border tint', async () => {
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={vi.fn()}
      />,
    );

    expect(screen.queryByText('Seleccionada')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Introducción/ }));

    expect(screen.getByText('Seleccionada')).toBeInTheDocument();
  });

  it('copies the whole document through a keyboard reachable control', async () => {
    const onCopyAll = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={onCopyAll}
      />,
    );

    const button = screen.getByRole('button', { name: 'Copiar todo el documento' });

    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onCopyAll).toHaveBeenCalledTimes(1);
  });

  it('names the pages with no extractable text when the report says so', () => {
    const report = {
      pagesWithoutText: [1],
      suspiciousJoins: [],
      stats: {
        pages: 2,
        pagesWithoutText: 1,
        fragments: 0,
        lines: 0,
        blocks: 0,
        sections: 0,
        characters: 0,
      },
    };

    render(
      <OutlinePanel
        entries={entries}
        report={report}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('La página 2 no tiene texto extraíble');
  });

  it('states that no sections were detected', () => {
    render(
      <OutlinePanel
        entries={[]}
        onSelectSection={vi.fn()}
        onCopySection={vi.fn()}
        onCopyAll={vi.fn()}
      />,
    );

    expect(screen.getByText('No se detectaron secciones.')).toBeInTheDocument();
  });
});
