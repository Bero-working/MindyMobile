import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '@/config/i18n.config';
import { MyClassesScreen, type MyClassesProps } from './MyClassesScreen';
import { learningFixtures } from '../preview/learningFixtures';
const fixtures = learningFixtures('2026-10-20');
const props: MyClassesProps = {
  enrollments: { status: 'success', data: fixtures.current },
  view: 'current',
  expanded: ['web', 'web-next'],
  onView: jest.fn(),
  onToggle: jest.fn(),
  onOpen: jest.fn(),
  onResume: jest.fn(),
  onBack: jest.fn(),
  onExplore: jest.fn(),
  onTab: jest.fn(),
  origin: 'home',
  timeZone: 'Asia/Ho_Chi_Minh',
};
beforeEach(() => jest.clearAllMocks());
it('opens FULL and preview, resumes only the correct existing order', () => {
  render(<MyClassesScreen {...props} />);
  fireEvent.press(screen.getByTestId('my-classes-open-full'));
  expect(props.onOpen).toHaveBeenLastCalledWith('full');
  fireEvent.press(screen.getByTestId('my-classes-open-cash'));
  expect(props.onOpen).toHaveBeenLastCalledWith('cash');
  fireEvent.press(screen.getByTestId('my-classes-resume-pending'));
  expect(props.onResume).toHaveBeenCalledWith('preview-existing-order');
  expect(screen.queryByTestId('my-classes-resume-review')).toBeNull();
  expect(screen.queryByTestId('my-classes-open-pending')).toBeNull();
});
it('retains loaded rows when loading more fails and retries the footer', () => {
  const load = jest.fn();
  render(
    <MyClassesScreen
      {...props}
      hasMore
      loadMoreError
      onLoadMore={load}
    />
  );
  expect(screen.getByTestId('my-classes-enrollment-full')).toBeTruthy();
  fireEvent.press(screen.getByTestId('my-classes-load-more'));
  expect(load).toHaveBeenCalledTimes(1);
});
it('hides the history shortcut and announces expanded state', () => {
  render(<MyClassesScreen {...props} />);
  expect(screen.queryByTestId('my-classes-view-history')).toBeNull();
  expect(
    screen.getByTestId('my-classes-course-web').props.accessibilityState
      .expanded
  ).toBe(true);
  fireEvent.press(screen.getByTestId('my-classes-course-web'));
  expect(props.onToggle).toHaveBeenCalledWith('web');
});
it('does not open history enrollments without access', () => {
  render(
    <MyClassesScreen
      {...props}
      enrollments={{ status: 'success', data: fixtures.history }}
      expanded={['history']}
      view="history"
    />
  );
  fixtures.history.forEach((row) => {
    expect(
      screen.queryByTestId(`my-classes-open-${row.enrollmentId}`)
    ).toBeNull();
    expect(
      screen.queryByTestId(`my-classes-resume-${row.enrollmentId}`)
    ).toBeNull();
  });
});
