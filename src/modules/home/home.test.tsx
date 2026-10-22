import '../../../tests/mocks/nativeUi';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import i18n from '@/config/i18n.config';
import { StudentHome } from './StudentHome';
import type { HomeProps, HomeCourse } from './types/home.type';

const course: HomeCourse = {
  id: 'course-1',
  code: 'WEB101',
  title: 'A long course title with Vietnamese: Lập trình web',
  description: null,
  imgUrl: null,
  priceAmount: 0,
  category: { id: 'category-1', name: 'Coding', slug: 'coding' },
};
const session = {
  classId: 'class-1',
  sessionId: 'session-1',
  sessionTitle: 'HTML',
  className: 'Web',
  startsAt: '2026-10-18T01:00:00Z',
  accessMode: 'CASH_PREVIEW' as const,
};
const props: HomeProps = {
  displayName: 'An',
  courses: { status: 'success', data: [course] },
  schedule: { status: 'success', data: session },
  timeZone: 'Asia/Ho_Chi_Minh',
  asOf: '2026-10-17T08:00:00Z',
};
beforeEach(async () => {
  await i18n.changeLanguage('vi-VN');
});

it('uses the supplied timezone and server asOf to display only an upcoming session', () => {
  const view = render(<StudentHome {...props} />);
  expect(screen.getByText(/08:00/)).toBeTruthy();
  view.rerender(
    <StudentHome
      {...props}
      asOf="2026-10-19T00:00:00Z"
    />
  );
  expect(screen.queryByTestId('home-next-session')).toBeNull();
  expect(screen.queryByTestId('home-join-class-button')).toBeNull();
});

it('renders all 2a sections, zero price, nullable covers and at most four courses', () => {
  render(
    <StudentHome
      {...props}
      courses={{
        status: 'success',
        data: Array.from({ length: 5 }, (_, index) => ({
          ...course,
          id: `c${index}`,
        })),
      }}
    />
  );
  for (const id of [
    'home-header',
    'home-next-session',
    'home-featured-courses',
    'home-intro-carousel',
    'home-compiler-section',
    'home-about-carousel',
    'home-footer',
  ])
    expect(screen.getByTestId(id)).toBeTruthy();
  expect(
    screen.getByText(i18n.t('home.greeting', { name: 'An' }))
  ).toBeTruthy();
  expect(screen.getAllByText('0 VND')).toHaveLength(4);
  expect(screen.queryByTestId('home-course-c4')).toBeNull();
  expect(screen.getByTestId('home-cover-c0-fallback')).toBeTruthy();
});

it('shows the course title once when its cover is unavailable', () => {
  render(<StudentHome {...props} />);
  expect(screen.getAllByText(course.title)).toHaveLength(1);
});

it('reserves the design image area when introduction artwork is unavailable', () => {
  render(<StudentHome {...props} />);
  expect(
    screen.getByTestId('home-intro-image-0', { includeHiddenElements: true })
      .props.importantForAccessibility
  ).toBe('no-hide-descendants');
});

it('shows approved course promises outside preview and no invented image icons', () => {
  render(<StudentHome {...props} />);
  fireEvent.press(screen.getByTestId('home-intro-dot-2'));
  expect(screen.getByText('Dự án đầu tiên sau 4 tuần.')).toBeTruthy();
  expect(screen.getByText('hotro@mindycoding.vn · 1900 0000')).toBeTruthy();
  expect(screen.queryByText(i18n.t('home.sections.about'))).toBeNull();
});

it('does not send My classes to Account when the destination is unavailable', () => {
  const onTab = jest.fn();
  render(
    <StudentHome
      {...props}
      actions={{ onTab }}
    />
  );
  const classes = screen.getByRole('link', { name: 'Lớp của tôi' });
  expect(classes).toBeDisabled();
  fireEvent.press(classes);
  expect(onTab).not.toHaveBeenCalled();
});

it('shows the compact header after scrolling and returns Home to the top', () => {
  const onTab = jest.fn();
  render(
    <StudentHome
      {...props}
      actions={{ onTab }}
    />
  );
  expect(screen.queryByTestId('home-compact-header')).toBeNull();
  fireEvent.scroll(screen.getByTestId('home-content'), {
    nativeEvent: { contentOffset: { y: 180 } },
  });
  expect(screen.getByTestId('home-compact-header')).toBeTruthy();
  expect(screen.queryByTestId('home-tab-home')).toBeNull();
  fireEvent.scroll(screen.getByTestId('home-content'), {
    nativeEvent: { contentOffset: { y: 170 } },
  });
  fireEvent.press(screen.getByTestId('home-tab-home'));
  expect(onTab).not.toHaveBeenCalled();
});

it('keeps the compact header mounted for transitions and disables hidden controls', () => {
  render(<StudentHome {...props} />);
  expect(
    screen.getByTestId('home-compact-header', { includeHiddenElements: true })
      .props.pointerEvents
  ).toBe('none');
  expect(screen.queryByTestId('home-compact-logo')).toBeNull();
  fireEvent.scroll(screen.getByTestId('home-content'), {
    nativeEvent: { contentOffset: { y: 180 } },
  });
  expect(screen.getByTestId('home-compact-header').props.pointerEvents).toBe(
    'auto'
  );
  fireEvent.scroll(screen.getByTestId('home-content'), {
    nativeEvent: { contentOffset: { y: 100 } },
  });
  expect(
    screen.getByTestId('home-compact-header', { includeHiddenElements: true })
      .props.pointerEvents
  ).toBe('none');
  expect(screen.queryByTestId('home-compact-logo')).toBeNull();
});

it('localizes a recognized region error code instead of showing only the generic error', () => {
  render(
    <StudentHome
      {...props}
      courses={{
        status: 'error',
        data: null,
        error: { code: 'NETWORK_ERROR' },
      }}
    />
  );
  expect(screen.getByText(i18n.t('errors.NETWORK_UNAVAILABLE'))).toBeTruthy();
});

it('opens the course from both tile and arrow and and forwards schedule identifiers and access mode', () => {
  const onCourse = jest.fn();
  const onSelectCourse = jest.fn();
  const onSession = jest.fn();
  render(
    <StudentHome
      {...props}
      actions={{ onCourse, onSelectCourse, onSession }}
    />
  );
  fireEvent.press(screen.getByTestId('home-course-open-course-1'));
  expect(onCourse).toHaveBeenCalledWith('course-1');
  expect(onSelectCourse).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('home-course-course-1'));
  expect(onCourse).toHaveBeenCalledWith('course-1');
  fireEvent.press(screen.getByTestId('home-join-class-button'));
  expect(onSession).toHaveBeenCalledWith({
    classId: 'class-1',
    sessionId: 'session-1',
    accessMode: 'CASH_PREVIEW',
  });
});

it('keeps successful regions while another region fails and retries only that region', () => {
  const retry = jest.fn();
  render(
    <StudentHome
      {...props}
      schedule={{
        status: 'error',
        data: null,
        error: { code: 'FAILED', requestId: 'schedule-ref' },
        onRetry: retry,
      }}
    />
  );
  expect(screen.getByTestId('home-course-course-1')).toBeTruthy();
  expect(screen.getByText(/schedule-ref/)).toBeTruthy();
  fireEvent.press(screen.getByTestId('home-schedule-retry-button'));
  expect(retry).toHaveBeenCalledTimes(1);
});

it('renders loading, empty and error states without inventing courses; preserves stale data', () => {
  const view = render(
    <StudentHome
      {...props}
      courses={{ status: 'loading', data: null }}
    />
  );
  expect(screen.getByTestId('home-loading')).toBeTruthy();
  view.rerender(
    <StudentHome
      {...props}
      courses={{ status: 'success', data: [] }}
    />
  );
  expect(screen.getByTestId('home-empty')).toBeTruthy();
  expect(screen.queryByTestId('home-course-course-1')).toBeNull();
  view.rerender(
    <StudentHome
      {...props}
      courses={{ status: 'error', data: null, error: { code: 'FAILED' } }}
    />
  );
  expect(screen.getByTestId('home-error')).toBeTruthy();
  view.rerender(
    <StudentHome
      {...props}
      courses={{ status: 'loading', data: [course] }}
    />
  );
  expect(screen.queryByTestId('home-loading')).toBeNull();
  expect(screen.getByTestId('home-course-course-1')).toBeTruthy();
});

it('changes carousel selection by dots and swipes and does not invoke a CTA on selection', () => {
  const onIntro = jest.fn();
  render(
    <StudentHome
      {...props}
      actions={{ onIntro }}
    />
  );
  expect(
    screen.getByTestId('home-intro-dot-0').props.accessibilityState.selected
  ).toBe(true);
  fireEvent.press(screen.getByTestId('home-intro-dot-2'));
  expect(
    screen.getByTestId('home-intro-dot-2').props.accessibilityState.selected
  ).toBe(true);
  expect(onIntro).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('home-intro-action-2'));
  expect(onIntro).toHaveBeenCalledWith(2);
  fireEvent(screen.getByTestId('home-about-scroll'), 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: 320 },
      layoutMeasurement: { width: 320 },
    },
  });
  expect(
    screen.getByTestId('home-about-dot-1').props.accessibilityState.selected
  ).toBe(true);
});

it('automatically advances both Home carousels after three seconds', () => {
  jest.useFakeTimers();
  const view = render(<StudentHome {...props} />);
  for (const kind of ['intro', 'about'])
    fireEvent(screen.getByTestId(`home-${kind}-viewport`), 'layout', {
      nativeEvent: { layout: { width: 320 } },
    });
  act(() => jest.advanceTimersByTime(3000));
  for (const kind of ['intro', 'about'])
    expect(
      screen.getByTestId(`home-${kind}-dot-1`).props.accessibilityState.selected
    ).toBe(true);
  view.unmount();
  jest.useRealTimers();
});

it('disables unavailable destinations and marks Home as the selected middle tab', () => {
  render(<StudentHome {...props} />);
  expect(screen.getByTestId('home-course-open-course-1')).toBeDisabled();
  expect(screen.getByTestId('home-compiler-button')).toBeDisabled();
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.props.testID)).toEqual([
    'home-tab-courses',
    'home-tab-schedule',
    'home-tab-home',
    'home-tab-notifications',
    'home-tab-account',
  ]);
  expect(
    screen.getByTestId('home-tab-home').props.accessibilityState.selected
  ).toBe(true);
});

it('locks duplicate refreshes and retains data during refresh', async () => {
  let finish: (() => void) | undefined;
  const onRefresh = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  render(
    <StudentHome
      {...props}
      onRefresh={onRefresh}
    />
  );
  act(() => {
    const refresh =
      screen.getByTestId('home-content').props.refreshControl.props.onRefresh;
    refresh();
    refresh();
  });
  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('home-course-course-1')).toBeTruthy();
  await act(async () => finish?.());
  await waitFor(() =>
    expect(
      screen.getByTestId('home-content').props.refreshControl.props.refreshing
    ).toBe(false)
  );
});
