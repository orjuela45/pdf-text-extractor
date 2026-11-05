// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dropzone } from './Dropzone';

const file = new File(['%PDF-1.4'], 'documento.pdf', { type: 'application/pdf' });

describe('Dropzone', () => {
  it('delivers the dropped file', () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} />);

    fireEvent.drop(screen.getByRole('region', { name: 'Zona para cargar el PDF' }), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('delivers the file chosen through the picker', async () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} />);

    await userEvent.upload(screen.getByLabelText('Elegir PDF'), file);

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('does not report a file while disabled', () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled />);

    fireEvent.drop(screen.getByRole('region', { name: 'Zona para cargar el PDF' }), {
      dataTransfer: { files: [file], types: ['Files'] },
    });

    expect(onFile).not.toHaveBeenCalled();
  });
});
