import { readFileSync } from 'fs';
import { resolve } from 'path';
import { colors } from './colors';

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
