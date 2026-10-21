import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { ScheduleScreen } from './ScheduleScreen';
import type { ScheduleProps } from './types';
import { learningFixtures } from '../preview/learningFixtures';
const props: ScheduleProps = {
  sessions: { status: 'success', data: [] },
  anchorDay: '2027-01-01',
  today: '2027-01-01',
  timeZone: 'Asia/Ho_Chi_Minh',
  onWeek: jest.fn(),
  onTab: jest.fn(),
};
it('changes weeks across years and selects an empty day', () => {
  render(<ScheduleScreen {...props} />);
  fireEvent.press(screen.getByTestId('schedule-next-week'));
  expect(props.onWeek).toHaveBeenCalledWith('2027-01-04');
  fireEvent.press(screen.getByTestId('schedule-day-2027-01-02'));
  expect(screen.getByTestId('schedule-empty-day')).toBeTruthy();
  fireEvent.press(screen.getByTestId('schedule-today'));
  expect(props.onWeek).toHaveBeenCalledWith('2027-01-01');
});

it('keeps the whole week and presents sessions as read-only content', () => {
  const fixtures = learningFixtures('2026-10-20');
  render(
    <ScheduleScreen
      {...props}
      today="2026-10-20"
      anchorDay="2026-10-20"
      sessions={{ status: 'success', data: fixtures.schedule }}
    />
  );
  fireEvent.press(screen.getByTestId('schedule-day-2026-10-20'));
  expect(screen.getByTestId('schedule-session-cash-session')).toBeTruthy();
  const row = screen.getByTestId('schedule-session-full-session');
  expect(row.props.onPress).toBeUndefined();
  expect(row.props.accessibilityRole).not.toBe('button');
});

it('selects today when returning from a different week', () => {
  const view = render(
    <ScheduleScreen
      {...props}
      anchorDay="2027-01-08"
    />
  );
  fireEvent.press(screen.getByTestId('schedule-today'));
  view.rerender(
    <ScheduleScreen
      {...props}
      anchorDay="2027-01-01"
    />
  );
  expect(
    screen.getByTestId('schedule-day-2027-01-01').props.accessibilityState
      .selected
  ).toBe(true);
});
