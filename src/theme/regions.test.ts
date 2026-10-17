import { vars } from 'nativewind';
import { regionVars } from './regions';
it.each([
  ['home', ['forest', 'muted', 'foreground', 'muted-foreground'], '0 0 0'],
  [
    'cart',
    [
      'foreground',
      'card-foreground',
      'popover-foreground',
      'secondary-foreground',
      'accent-foreground',
      'muted-foreground',
    ],
    '0 0 0',
  ],
  [
    'courseDetail',
    ['forest', 'muted', 'mint', 'foreground', 'muted-foreground'],
    '0 0 0',
  ],
  [
    'catalog',
    ['forest', 'muted', 'mint', 'foreground', 'muted-foreground'],
    '38 38 38',
  ],
] as const)('sets all %s region tokens', (region, keys, value) => {
  expect(regionVars[region]).toEqual(
    vars(Object.fromEntries(keys.map((key) => [`--${key}`, value])))
  );
});
