// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { FragmentFactory } from '../test/FragmentFactory';
import { CoordinateMapper } from './CoordinateMapper';
import { TextLayerBuilder } from './TextLayerBuilder';

const builder = new TextLayerBuilder();
const fragments = new FragmentFactory();

const container = (): HTMLElement => document.createElement('div');

describe('TextLayerBuilder', () => {
  it('writes one span per non-empty fragment', () => {
    const host = container();

    builder.build(
      host,
      [
        fragments.create({ text: 'uno' }),
        fragments.create({ text: '' }),
        fragments.create({ text: 'dos' }),
      ],
      new CoordinateMapper([1, 0, 0, 1, 0, 0]),
      1,
    );

    expect(host.querySelectorAll('span')).toHaveLength(2);
    expect(host.textContent).toBe('unodos');
  });

  it('positions a span from the fragment box, flipped for the y-down viewport', () => {
    const host = container();

    builder.build(
      host,
      [fragments.create({ text: 'hola', x: 72, y: 700, width: 20, height: 10, fontSize: 10 })],
      new CoordinateMapper([1, 0, 0, -1, 0, 792]),
      1,
    );

    const span = host.querySelector('span');
    expect(span?.style.left).toBe('72px');
    expect(span?.style.top).toBe('82px');
    expect(span?.style.width).toBe('20px');
    expect(span?.style.height).toBe('10px');
    expect(span?.style.fontSize).toBe('10px');
  });

  it('keeps the box axis aligned when the page is rotated a quarter turn', () => {
    const host = container();

    builder.build(
      host,
      [fragments.create({ text: 'rotado', x: 72, y: 700, width: 20, height: 10, fontSize: 10 })],
      new CoordinateMapper([0, 1, -1, 0, 612, 0]),
      1,
    );

    const span = host.querySelector('span');
    expect(span?.style.width).toBe('10px');
    expect(span?.style.height).toBe('20px');
  });

  it('scales the font size with the render scale', () => {
    const host = container();

    builder.build(
      host,
      [fragments.create({ text: 'a', fontSize: 12 })],
      new CoordinateMapper([2, 0, 0, -2, 0, 1584]),
      2,
    );

    expect(host.querySelector('span')?.style.fontSize).toBe('24px');
  });

  it('replaces whatever the container held before', () => {
    const host = container();
    host.append(document.createElement('em'));

    builder.build(
      host,
      [fragments.create({ text: 'nuevo' })],
      new CoordinateMapper([1, 0, 0, -1, 0, 0]),
      1,
    );

    expect(host.querySelector('em')).toBeNull();
    expect(host.querySelectorAll('span')).toHaveLength(1);
  });

  it('empties the container when there are no fragments', () => {
    const host = container();
    host.append(document.createElement('span'));

    builder.build(host, [], new CoordinateMapper([1, 0, 0, -1, 0, 0]), 1);

    expect(host.querySelectorAll('span')).toHaveLength(0);
  });
});
