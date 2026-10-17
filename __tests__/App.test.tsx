/**
 * @format
 */

import '../tests/mocks/nativeUi';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/';
import { useStore } from '../src/state/store';

describe('App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Session networking is covered by sessionNavigation.test.tsx; keep this render smoke deterministic.
    useStore.setState({
      bootstrapStatus: 'ready',
      sessionUser: null,
      hasSessionHistory: false,
    });
  });
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
