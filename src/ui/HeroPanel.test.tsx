// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HERO_HEADLINE } from './constants';
import { HeroPanel } from './HeroPanel';

describe('HeroPanel', () => {
  it('states the headline as the page heading', () => {
    render(<HeroPanel />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HERO_HEADLINE);
  });

  it('lists every feature chip', () => {
    render(<HeroPanel />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('promises only what the app does: no accounts, no servers, nothing stored', () => {
    render(<HeroPanel />);

    expect(screen.getByText(/el archivo nunca se sube/)).toBeInTheDocument();
  });

  it('does not claim a neural engine, OCR or encryption that the app does not have', () => {
    const { container } = render(<HeroPanel />);
    const text = container.textContent ?? '';

    expect(text).not.toMatch(/neuronal|OCR|cifrad/i);
  });
});
