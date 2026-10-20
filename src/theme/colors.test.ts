import { readFileSync } from 'fs';
import { resolve } from 'path';
import { colors } from './colors';

it('includes the approved phase two design tokens', () => {
  expect(colors).toMatchObject({
    ember: '#C2410C',
    ribbon: '#EC4A3C',
    ribbonDeep: '#C8281D',
    ribbonFold: '#8E1A12',
  });
});

it('keeps all native colors in sync with CSS tokens', () => {
  const css = readFileSync(resolve(__dirname, '../../global.css'), 'utf8');
  for (const [key, hex] of Object.entries(colors)) {
    const token = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const rgb = hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((part) => parseInt(part, 16))
      .join(' ');
    expect(css).toContain(`--${token}: ${rgb};`);
  }
});
