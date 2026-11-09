// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SectionFactory } from '../test/SectionFactory';
import { TextPanel } from './TextPanel';

const sections = new SectionFactory();

const built = [sections.create({ heading: sections.createHeading('Introduccion'), level: 1 })];

describe('TextPanel', () => {
  it('shows the plain text by default', () => {
    render(<TextPanel sections={built} onCopy={vi.fn()} />);

    expect(screen.getByText(/Primer párrafo/)).toBeInTheDocument();
  });

  it('switches to markdown when the tab is chosen', async () => {
    const user = userEvent.setup();

    render(<TextPanel sections={built} onCopy={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));

    expect(screen.getByText(/## Introduccion/)).toBeInTheDocument();
  });

  it('counts the words of the current view and announces it', async () => {
    render(<TextPanel sections={built} onCopy={vi.fn()} />);

    const count = screen.getByText(/palabras|palabra$/);

    expect(count.textContent).toMatch(/\d+ palabras?/);
  });

  it('copies what the current view shows', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();

    render(<TextPanel sections={built} onCopy={onCopy} />);
    await user.click(screen.getByRole('button', { name: 'Copiar texto' }));

    expect(onCopy).toHaveBeenCalledWith(expect.stringContaining('Primer párrafo'));
    expect(onCopy).toHaveBeenCalledWith(expect.not.stringContaining('##'));
  });

  it('copies markdown when markdown is the active view', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();

    render(<TextPanel sections={built} onCopy={onCopy} />);
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));
    await user.click(screen.getByRole('button', { name: 'Copiar texto' }));

    expect(onCopy).toHaveBeenCalledWith(expect.stringContaining('## Introduccion'));
  });

  it('says so when there is nothing to show', () => {
    render(<TextPanel sections={[]} onCopy={vi.fn()} />);

    expect(screen.getByText('Todavía no hay texto extraído.')).toBeInTheDocument();
  });

  it('says plainly that the document has no detected structure in markdown', async () => {
    const user = userEvent.setup();
    const flat = [sections.create({ heading: null, level: 0 })];

    render(<TextPanel sections={flat} onCopy={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));

    expect(screen.getByText(/no tiene títulos detectados/i)).toBeInTheDocument();
  });

  it('scrolls the right panel to the selected block', async () => {
    const block = sections.createBody('Bloque elegido');
    const scrollIntoView = vi.fn();
    const original = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = scrollIntoView;

    try {
      const { rerender } = render(
        <TextPanel sections={built} onCopy={vi.fn()} activeBlock={null} scrollTarget={null} />,
      );

      rerender(
        <TextPanel sections={built} onCopy={vi.fn()} activeBlock={block} scrollTarget={0} />,
      );

      expect(scrollIntoView).toHaveBeenCalled();
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('reports back once the scroll was handled', async () => {
    const block = sections.createBody('Bloque elegido');
    const onScrollHandled = vi.fn();
    const original = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = vi.fn();

    try {
      render(
        <TextPanel
          sections={built}
          onCopy={vi.fn()}
          activeBlock={block}
          scrollTarget={0}
          onScrollHandled={onScrollHandled}
        />,
      );

      expect(onScrollHandled).toHaveBeenCalledTimes(1);
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('marks the active block in the text', () => {
    const block = sections.createBody('Primer párrafo');

    render(<TextPanel sections={built} onCopy={vi.fn()} activeBlock={block} />);

    expect(document.querySelector('[data-block-anchor]')).not.toBeNull();
  });

  it('does not claim a missing structure when a heading was detected', async () => {
    const user = userEvent.setup();

    render(<TextPanel sections={built} onCopy={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));

    expect(screen.queryByText(/no tiene títulos detectados/i)).not.toBeInTheDocument();
  });

  it('marks the active tab as selected for assistive technology', async () => {
    const user = userEvent.setup();

    render(<TextPanel sections={built} onCopy={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Plano' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Markdown' }));
    expect(screen.getByRole('tab', { name: 'Markdown' })).toHaveAttribute('aria-selected', 'true');
  });
});
