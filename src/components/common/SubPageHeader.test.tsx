import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import '@/config/i18n.config';
import { SubPageHeader } from './SubPageHeader';

it('renders a round back button, centred title and optional trailing slot', () => {
  const back = jest.fn();
  const view = render(
    <SubPageHeader
      title="Tiêu đề"
      prefix="demo"
      onBack={back}
    />
  );
  fireEvent.press(screen.getByTestId('demo-back'));
  expect(back).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('header')).toBeTruthy();
  expect(screen.getByTestId('demo-header-spacer')).toBeTruthy();
  view.rerender(
    <SubPageHeader
      title="Tiêu đề"
      prefix="demo"
      onBack={back}
      trailing={<Text>X</Text>}
    />
  );
  expect(screen.queryByTestId('demo-header-spacer')).toBeNull();
  expect(screen.getByText('X')).toBeTruthy();
});
