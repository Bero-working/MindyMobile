import '../../../tests/mocks/nativeUi';
import { render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { SessionSplash } from './SessionSplash';

it('shows the Mindy mascot with an accessible loading label', () => {
  render(<SessionSplash />);
  const root = screen.getByTestId('session-loading', {
    includeHiddenElements: true,
  });
  expect(root.props.accessibilityLabel).toBe('Đang tải');
  expect(
    screen.getByTestId('session-loading-mascot', {
      includeHiddenElements: true,
    })
  ).toBeTruthy();
});
