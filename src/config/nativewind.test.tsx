import { readFileSync } from 'fs';
import { resolve } from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { render, setupAllComponents } from 'react-native-css-interop/test';
import { View } from 'react-native';

it('compiles the project tokens and applies NativeWind styles to a View', async () => {
  setupAllComponents();
  const css = readFileSync(resolve(__dirname, '../../global.css'), 'utf8');
  const compiled = await postcss([
    tailwindcss({ config: resolve(__dirname, '../../tailwind.config.js') }),
  ]).process(css, { from: undefined });
  const { getByTestId } = render(
    <View
      testID="mint-view"
      className="bg-mint"
    />,
    { css: compiled.css }
  );
  expect(getByTestId('mint-view')).toHaveStyle({
    backgroundColor: 'rgba(51, 138, 133, 1)',
  });
});
