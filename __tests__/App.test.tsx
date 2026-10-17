/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import App from '../src/';

describe('App', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  test('renders correctly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer?.root.findByProps({ testID: 'app-root' })).toBeTruthy();
    await ReactTestRenderer.act(() => renderer?.unmount());
  });
});
