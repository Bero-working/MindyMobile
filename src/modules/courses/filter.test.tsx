import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FilterSheet } from './components/FilterSheet';
import '@/config/i18n.config';
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
it('applies only delivery mode and resets to an omitted optional key', () => {
  const apply = jest.fn();
  const close = jest.fn();
  render(
    <FilterSheet
      onApply={apply}
      onClose={close}
      total={8}
    />
  );
  fireEvent.press(screen.getByTestId('courses-filter-mode-ONLINE'));
  fireEvent.press(screen.getByTestId('courses-filter-apply'));
  expect(apply).toHaveBeenCalledWith({ deliveryMode: 'ONLINE' });
  expect(close).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('courses-filter-reset'));
  expect(apply).toHaveBeenLastCalledWith({});
});
