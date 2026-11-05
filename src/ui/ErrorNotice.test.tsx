// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASSWORD_ERROR_MESSAGE, UNREADABLE_ERROR_MESSAGE } from './constants';
import { ErrorNotice } from './ErrorNotice';

describe('ErrorNotice', () => {
  it('shows the password message for an encrypted PDF', () => {
    render(<ErrorNotice error={{ kind: 'password', message: PASSWORD_ERROR_MESSAGE }} />);

    expect(screen.getByRole('alert')).toHaveTextContent(PASSWORD_ERROR_MESSAGE);
  });

  it('shows the oversized message', () => {
    render(
      <ErrorNotice
        error={{
          kind: 'oversized',
          message:
            'El archivo supera el límite de 100 MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.',
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El archivo supera el límite de 100 MB. Procesar un PDF tan grande en el navegador puede agotar la memoria; elegí uno más liviano.',
    );
  });

  it('shows the unreadable message for any other failure', () => {
    render(<ErrorNotice error={{ kind: 'unreadable', message: UNREADABLE_ERROR_MESSAGE }} />);

    expect(screen.getByRole('alert')).toHaveTextContent(UNREADABLE_ERROR_MESSAGE);
  });
});
