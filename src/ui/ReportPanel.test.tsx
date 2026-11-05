// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { QualityReport } from '../core/models';
import { ReportPanel } from './ReportPanel';

const baseReport: QualityReport = {
  pagesWithoutText: [],
  suspiciousJoins: [],
  stats: {
    pages: 3,
    pagesWithoutText: 0,
    fragments: 12,
    lines: 8,
    blocks: 4,
    sections: 2,
    characters: 120,
  },
};

describe('ReportPanel', () => {
  it('warns about the pages where no text could be extracted', () => {
    render(
      <ReportPanel
        report={{ ...baseReport, pagesWithoutText: [2, 4], stats: { ...baseReport.stats } }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este PDF tiene 2 página(s) sin texto extraíble (3, 5).',
    );
  });

  it('reports when every page had text', () => {
    render(<ReportPanel report={baseReport} />);

    expect(screen.getByText('Se encontró texto en todas las páginas.')).toBeInTheDocument();
    expect(
      screen.getByText('120 caracteres, 4 párrafos, 2 secciones y 3 páginas.'),
    ).toBeInTheDocument();
  });
});
