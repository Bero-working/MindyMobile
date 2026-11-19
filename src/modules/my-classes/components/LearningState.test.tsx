import '../../../../tests/mocks/nativeUi';
import { render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { LearningState } from './LearningLayout';

it('pads the loading skeleton for full-bleed screens', () => {
  const view = render(
    <LearningState
      region={{ status: 'loading', data: null }}
      prefix="account"
      empty={false}
      inset
    >
      {null}
    </LearningState>
  );
  expect(
    screen.getByTestId('account-loading').props.className.split(' ')
  ).toContain('p-[16px]');
  view.rerender(
    <LearningState
      region={{ status: 'loading', data: null }}
      prefix="orders"
      empty={false}
    >
      {null}
    </LearningState>
  );
  expect(
    screen.getByTestId('orders-loading').props.className.split(' ')
  ).not.toContain('p-[16px]');
});
