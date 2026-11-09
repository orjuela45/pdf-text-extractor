// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BlockFactory } from '../test/BlockFactory';
import { OutlinePanel } from './OutlinePanel';

const blocks = new BlockFactory();

const entries = [
  { index: 0, block: blocks.createWithText('ILLUMIA S.A.S.'), text: 'ILLUMIA S.A.S.', page: 1 },
  { index: 1, block: blocks.createWithText('901.897.818-5'), text: '901.897.818-5', page: 1 },
];

const handlers = {
  onSelectBlock: vi.fn(),
  onCopyBlock: vi.fn(),
  onCopyAll: vi.fn(),
};

describe('OutlinePanel', () => {
  it('lists one card per block with its page', () => {
    render(<OutlinePanel entries={entries} {...handlers} />);

    expect(screen.getByRole('button', { name: /^ILLUMIA S\.A\.S\./ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^901\.897\.818-5/ })).toBeInTheDocument();
    expect(screen.getAllByText('Pág. 1')).toHaveLength(2);
  });

  it('shows the whole block text, not a section body', () => {
    render(<OutlinePanel entries={entries} {...handlers} />);

    expect(screen.getByText('ILLUMIA S.A.S.')).toBeInTheDocument();
  });

  it('selects a block without copying it', async () => {
    const onSelectBlock = vi.fn();
    const onCopyBlock = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectBlock={onSelectBlock}
        onCopyBlock={onCopyBlock}
        onCopyAll={vi.fn()}
      />,
    );

    const card = screen.getByRole('button', { name: /^ILLUMIA S\.A\.S\./ });

    await user.click(card);

    expect(onSelectBlock).toHaveBeenCalledWith(0);
    expect(onCopyBlock).not.toHaveBeenCalled();
    expect(card).toHaveAttribute('aria-current', 'true');
  });

  it('copies a block through its own control without selecting it', async () => {
    const onSelectBlock = vi.fn();
    const onCopyBlock = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectBlock={onSelectBlock}
        onCopyBlock={onCopyBlock}
        onCopyAll={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copiar el bloque: 901.897.818-5' }));

    expect(onCopyBlock).toHaveBeenCalledWith(1);
    expect(onSelectBlock).not.toHaveBeenCalled();
  });

  it('offers a switch between the whole document and the current page', () => {
    render(<OutlinePanel entries={entries} mode="document" {...handlers} />);

    expect(screen.getByRole('tab', { name: 'Todo' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Página' })).toHaveAttribute('aria-selected', 'false');
  });

  it('reports the chosen scope back', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel entries={entries} mode="document" onModeChange={onModeChange} {...handlers} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Página' }));

    expect(onModeChange).toHaveBeenCalledWith('page');
  });

  it('clamps the card text so every card keeps about the same height', () => {
    const long = {
      ...entries[0]!,
      text: 'Primera linea\nSegunda linea\nTercera linea\nCuarta linea\nQuinta linea',
    };

    render(<OutlinePanel entries={[long]} {...handlers} />);

    const preview = screen.getByTestId('block-card-text');

    expect(preview.className).toContain('line-clamp-3');
  });

  it('keeps the full text in the card title so nothing is lost', () => {
    const long = {
      ...entries[0]!,
      text: 'Primera linea\nSegunda linea\nTercera linea\nCuarta linea',
    };

    render(<OutlinePanel entries={[long]} {...handlers} />);

    expect(screen.getByTestId('block-card-text')).toHaveAttribute(
      'title',
      'Primera linea Segunda linea Tercera linea Cuarta linea',
    );
  });

  it('copies the whole block even when the card only shows part of it', async () => {
    const onCopyBlock = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectBlock={vi.fn()}
        onCopyBlock={onCopyBlock}
        onCopyAll={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Copiar el bloque: 901.897.818-5' }));

    expect(onCopyBlock).toHaveBeenCalledWith(1);
  });

  it('marks the selected block with a visible label', async () => {
    const user = userEvent.setup();

    render(<OutlinePanel entries={entries} {...handlers} />);

    expect(screen.queryByText('Seleccionado')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^ILLUMIA S\.A\.S\./ }));

    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
  });

  it('indents nothing, because blocks are a flat list', () => {
    render(<OutlinePanel entries={entries} {...handlers} />);

    const first = screen.getByRole('button', { name: /^ILLUMIA S\.A\.S\./ });

    expect(first.parentElement?.style.marginInlineStart).toBe('');
  });

  it('copies the whole document through a keyboard reachable control', async () => {
    const onCopyAll = vi.fn();
    const user = userEvent.setup();

    render(
      <OutlinePanel
        entries={entries}
        onSelectBlock={vi.fn()}
        onCopyBlock={vi.fn()}
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

    render(<OutlinePanel entries={entries} report={report} {...handlers} />);

    expect(screen.getByRole('status')).toHaveTextContent('La página 2 no tiene texto extraíble');
  });

  it('says there are no blocks on a page with no text', () => {
    render(<OutlinePanel entries={[]} {...handlers} />);

    expect(screen.getByText('No se detectaron bloques en esta página.')).toBeInTheDocument();
  });
});
