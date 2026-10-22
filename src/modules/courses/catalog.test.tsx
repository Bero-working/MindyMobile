import '../../../tests/mocks/nativeUi';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import i18n from '@/config/i18n.config';
import { CoursesScreen } from './CoursesScreen';
import type { CatalogProps, Course } from './types/courses.type';

const course: Course = {
  id: 'c1',
  code: 'WEB',
  title: 'Web',
  description: null,
  imgUrl: null,
  priceAmount: 1500000,
  category: { id: 'cat', name: 'Coding', slug: 'coding' },
};
const props: CatalogProps = {
  courses: { status: 'success', data: [course] },
  recommendations: { status: 'success', data: [course] },
  categories: { status: 'success', data: [{ id: 'cat', name: 'Coding' }] },
  total: 36,
  page: 1,
  categoryId: null,
  cartCount: 0,
  onPage: jest.fn(),
  onCategory: jest.fn(),
  onFilter: jest.fn(),
  onOpenCourse: jest.fn(),
  onCart: jest.fn(),
  onHome: jest.fn(),
};
beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('vi-VN');
});
it('advances recommended courses every three seconds', () => {
  jest.useFakeTimers();
  const view = render(
    <CoursesScreen
      {...props}
      recommendations={{
        status: 'success',
        data: [course, { ...course, id: 'c2' }, { ...course, id: 'c3' }],
      }}
    />
  );
  act(() => jest.advanceTimersByTime(3000));
  expect(
    screen.getByTestId('courses-recommend-dot-1').props.accessibilityState
      .selected
  ).toBe(true);
  act(() => jest.advanceTimersByTime(3000));
  expect(
    screen.getByTestId('courses-recommend-dot-2').props.accessibilityState
      .selected
  ).toBe(true);
  view.unmount();
  jest.useRealTimers();
});
it('hides empty badge, caps it at 9+ and opens recommendations', () => {
  const view = render(<CoursesScreen {...props} />);
  expect(screen.queryByTestId('courses-cart-badge')).toBeNull();
  fireEvent.press(screen.getByTestId('courses-recommend-view-c1'));
  expect(props.onOpenCourse).toHaveBeenCalledWith('c1');
  view.rerender(
    <CoursesScreen
      {...props}
      cartCount={12}
    />
  );
  expect(screen.getByText('9+')).toBeTruthy();
});
it('selects categories and passes the chosen page', () => {
  render(<CoursesScreen {...props} />);
  fireEvent.press(screen.getByTestId('courses-category-cat'));
  expect(props.onCategory).toHaveBeenCalledWith('cat');
  fireEvent.press(screen.getByTestId('courses-page-next'));
  expect(props.onPage).toHaveBeenCalledWith(2);
  expect(screen.getByTestId('courses-page-prev')).toBeDisabled();
});
it('isolates grid errors and retries only that region', () => {
  const retry = jest.fn();
  render(
    <CoursesScreen
      {...props}
      courses={{ status: 'error', data: null, onRetry: retry }}
    />
  );
  expect(screen.getByTestId('courses-recommend')).toBeTruthy();
  fireEvent.press(screen.getByTestId('courses-retry'));
  expect(retry).toHaveBeenCalledTimes(1);
});
it('shows empty and loading states', () => {
  const view = render(
    <CoursesScreen
      {...props}
      courses={{ status: 'success', data: [] }}
    />
  );
  expect(screen.getByTestId('courses-empty')).toBeTruthy();
  view.rerender(
    <CoursesScreen
      {...props}
      courses={{ status: 'loading', data: null }}
    />
  );
  expect(screen.getByTestId('courses-loading')).toBeTruthy();
});
