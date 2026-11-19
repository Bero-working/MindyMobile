import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import {
  attendanceItem,
  attendanceSummary,
} from '../../../tests/fixtures/attendance';
import { enrollmentDto } from '../../../tests/fixtures/learning';
import type { Enrollment } from '../my-classes/types';
import {
  AttendanceClassesScreen,
  AttendanceHistoryScreen,
} from './AttendanceScreens';

const paging = {
  hasMore: false,
  loadingMore: false,
  loadMoreError: false,
  onLoadMore: jest.fn(),
  refreshing: false,
  onRefresh: jest.fn(),
};
const props = {
  ...paging,
  className: 'WEB-01',
  courseTitle: 'Lập trình Web',
  history: { status: 'success' as const, data: [attendanceItem()] },
  summary: { status: 'success' as const, data: attendanceSummary() },
  timeZone: 'Asia/Ho_Chi_Minh',
  period: 'ALL' as const,
  onPeriod: jest.fn(),
  onBack: jest.fn(),
};

it('opens a completed class without requiring current full class access', () => {
  const row: Enrollment = {
    ...enrollmentDto(),
    enrollmentStatus: 'COMPLETED' as const,
    accessMode: 'NONE' as const,
    canViewClass: false,
    classStatus: 'COMPLETED',
    deliveryMode: 'ONLINE',
    accessReason: 'ENROLLMENT_COMPLETED',
    canViewSchedule: false,
    order: null,
  };
  const open = jest.fn();
  render(
    <AttendanceClassesScreen
      {...paging}
      classes={{ status: 'success', data: [row] }}
      onOpen={open}
      onBack={jest.fn()}
      onExplore={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId(`attendance-class-${row.classId}`));
  expect(open).toHaveBeenCalledWith(row);
  expect(screen.getByText('Đã hoàn thành')).toBeTruthy();
});

it('uses the server summary and timezone and calls period and pagination actions', () => {
  const period = jest.fn(),
    more = jest.fn();
  render(
    <AttendanceHistoryScreen
      {...props}
      onPeriod={period}
      hasMore
      onLoadMore={more}
    />
  );
  expect(screen.getByText('75%')).toBeTruthy();
  expect(screen.getByText('08:00 – 10:00')).toBeTruthy();
  expect(screen.getByTestId('attendance-count-present').props.children).toBe(
    '3'
  );
  fireEvent.press(screen.getByTestId('attendance-period-30'));
  expect(period).toHaveBeenCalledWith('30');
  fireEvent.press(screen.getByTestId('attendance-load-more'));
  expect(more).toHaveBeenCalledTimes(1);
});

it('separates an absent physical record from credited makeup attendance', () => {
  const item = {
    ...attendanceItem(),
    attendanceStatus: 'ABSENT' as const,
    attendanceApplicability: 'MAKEUP_CREDITED' as const,
    creditedAttendanceStatus: 'PRESENT' as const,
  };
  render(
    <AttendanceHistoryScreen
      {...props}
      history={{ status: 'success', data: [item] }}
    />
  );
  expect(screen.getAllByText('Vắng')).toHaveLength(2);
  expect(screen.getByText('Kết quả được tính: Có mặt')).toBeTruthy();
  expect(
    screen.getByText('Kết quả chuyên cần được lấy từ buổi học bù.')
  ).toBeTruthy();
});

it('does not label future sessions absent or show a fabricated zero rate', () => {
  const item = {
    ...attendanceItem(),
    sessionStatus: 'SCHEDULED' as const,
    attendanceStatus: null,
    attendanceApplicability: 'NOT_STARTED' as const,
    creditedAttendanceStatus: null,
    creditSessionId: null,
    excluded: true,
  };
  render(
    <AttendanceHistoryScreen
      {...props}
      history={{ status: 'success', data: [item] }}
      summary={{
        status: 'success',
        data: { ...attendanceSummary(), rate: null, finalizedEligibleCount: 0 },
      }}
    />
  );
  expect(screen.getByText('Chưa bắt đầu')).toBeTruthy();
  expect(screen.getByText('Chưa có tỷ lệ')).toBeTruthy();
  expect(screen.queryByText('0%')).toBeNull();
});

it('keeps history visible when only the summary fails and exposes its retry', () => {
  const retry = jest.fn();
  render(
    <AttendanceHistoryScreen
      {...props}
      summary={{
        status: 'error',
        data: null,
        error: { code: 'NETWORK_ERROR', requestId: 'summary-req' },
        onRetry: retry,
      }}
    />
  );
  expect(screen.getByText('Session 1')).toBeTruthy();
  expect(screen.getByText(/summary-req/)).toBeTruthy();
  fireEvent.press(screen.getByTestId('attendance-summary-retry'));
  expect(retry).toHaveBeenCalledTimes(1);
});

it('shows loading, empty and failed history with a retry', () => {
  const retry = jest.fn();
  const view = render(
    <AttendanceHistoryScreen
      {...props}
      history={{ status: 'loading', data: null }}
    />
  );
  expect(screen.getByTestId('attendance-loading')).toBeTruthy();
  view.rerender(
    <AttendanceHistoryScreen
      {...props}
      history={{ status: 'success', data: [] }}
    />
  );
  expect(screen.getByTestId('attendance-history-empty')).toBeTruthy();
  view.rerender(
    <AttendanceHistoryScreen
      {...props}
      history={{ status: 'error', data: null, onRetry: retry }}
    />
  );
  fireEvent.press(screen.getByTestId('attendance-retry'));
  expect(retry).toHaveBeenCalledTimes(1);
});

it('uses the round sub-page header, segmented periods and a dated session card', () => {
  const back = jest.fn();
  render(
    <AttendanceHistoryScreen
      {...props}
      onBack={back}
    />
  );
  expect(screen.queryByText('Quay lại')).toBeNull();
  fireEvent.press(screen.getByTestId('attendance-history-back'));
  expect(back).toHaveBeenCalledTimes(1);
  expect(
    screen.getByTestId('attendance-period-ALL').props.accessibilityState
  ).toEqual({ selected: true });
  expect(screen.getByTestId('attendance-rate-bar')).toBeTruthy();
  const item = attendanceItem();
  expect(
    screen.getByTestId(
      `attendance-session-date-${item.sessionId}-${item.enrollmentId}`
    )
  ).toBeTruthy();
  expect(screen.getByText('01')).toBeTruthy();
});
