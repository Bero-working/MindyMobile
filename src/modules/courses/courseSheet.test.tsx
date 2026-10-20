import '../../../tests/mocks/nativeUi';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CourseSheet } from './components/CourseSheet';
import '@/config/i18n.config';
import type { Course, CourseClass } from './types/courses.type';
jest.mock('@/components/common/AppSheet', () => ({
  AppSheet: jest.requireActual('react-native').View,
}));
const course: Course = {
  id: 'course',
  code: 'WEB',
  title: 'Web',
  description: null,
  imgUrl: null,
  priceAmount: 1500000,
  category: { id: 'cat', name: 'Coding', slug: 'coding' },
};
const item: CourseClass = {
  id: 'a',
  courseId: 'course',
  code: 'A',
  name: 'Class A',
  startDate: '2026-10-20',
  endDate: '2026-12-20',
  deliveryMode: 'ONLINE',
  availableSeats: 5,
  mentor: { displayName: 'An' },
};
it('picks, unpicks and disables full classes', () => {
  const pick = jest.fn();
  const unpick = jest.fn();
  const view = render(
    <CourseSheet
      course={course}
      classes={[item]}
      selectedClassId={null}
      onPick={pick}
      onUnpick={unpick}
      onAddToCart={jest.fn()}
      onBuy={jest.fn()}
      onClose={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-a'));
  expect(pick).toHaveBeenCalledWith('a');
  view.rerender(
    <CourseSheet
      course={course}
      classes={[item]}
      selectedClassId="a"
      onPick={pick}
      onUnpick={unpick}
      onAddToCart={jest.fn()}
      onBuy={jest.fn()}
      onClose={jest.fn()}
    />
  );
  fireEvent.press(screen.getByTestId('course-sheet-pick-a'));
  expect(unpick).toHaveBeenCalledWith('a');
  view.rerender(
    <CourseSheet
      course={course}
      classes={[{ ...item, availableSeats: 0 }]}
      selectedClassId={null}
      onPick={pick}
      onUnpick={unpick}
      onAddToCart={jest.fn()}
      onBuy={jest.fn()}
      onClose={jest.fn()}
    />
  );
  expect(screen.getByTestId('course-sheet-pick-a')).toBeDisabled();
  expect(screen.getByTestId('course-sheet-buy')).toBeDisabled();
});
it('keeps all selection actions disabled during a mutation', () => {
  render(
    <CourseSheet
      course={course}
      classes={[item]}
      selectedClassId={null}
      pendingClassId="a"
      onPick={jest.fn()}
      onUnpick={jest.fn()}
      onAddToCart={jest.fn()}
      onBuy={jest.fn()}
      onClose={jest.fn()}
    />
  );
  expect(screen.getByTestId('course-sheet-pick-a')).toBeDisabled();
  expect(screen.getByTestId('course-sheet-buy')).toBeDisabled();
});
it('supports empty, error and loading classes', () => {
  const props = {
    course,
    classes: [],
    selectedClassId: null,
    onAddToCart: jest.fn(),
    onPick: jest.fn(),
    onUnpick: jest.fn(),
    onBuy: jest.fn(),
    onClose: jest.fn(),
  };
  const view = render(<CourseSheet {...props} />);
  expect(screen.getByTestId('course-sheet-empty')).toBeTruthy();
  view.rerender(
    <CourseSheet
      {...props}
      status="error"
      onRetry={jest.fn()}
    />
  );
  expect(screen.getByTestId('course-sheet-error')).toBeTruthy();
  view.rerender(
    <CourseSheet
      {...props}
      status="loading"
    />
  );
  expect(screen.getByTestId('course-sheet-loading')).toBeTruthy();
});

it('offers expansion whenever the measured description exceeds four lines, including at large font sizes', () => {
  render(
    <CourseSheet
      course={{
        ...course,
        description: 'A short description that wraps on a narrow screen.',
      }}
      classes={[]}
      selectedClassId={null}
      onPick={jest.fn()}
      onUnpick={jest.fn()}
      onAddToCart={jest.fn()}
      onBuy={jest.fn()}
      onClose={jest.fn()}
    />
  );
  expect(screen.queryByTestId('course-sheet-more')).toBeNull();
  fireEvent(
    screen.getByTestId('course-sheet-description-measure', {
      includeHiddenElements: true,
    }),
    'textLayout',
    {
      nativeEvent: {
        lines: [
          { text: 'A' },
          { text: 'short' },
          { text: 'description' },
          { text: 'that' },
          { text: 'wraps' },
        ],
      },
    }
  );
  fireEvent.press(screen.getByTestId('course-sheet-more'));
  expect(
    screen.getByTestId('course-sheet-description').props.numberOfLines
  ).toBeUndefined();
});

it('shows two measured rows plus half of the third row, with scrolling only for additional classes', () => {
  const props = {
    course,
    classes: [item, { ...item, id: 'b' }, { ...item, id: 'c' }],
    selectedClassId: null,
    onAddToCart: jest.fn(),
    onPick: jest.fn(),
    onUnpick: jest.fn(),
    onBuy: jest.fn(),
    onClose: jest.fn(),
  };
  const view = render(<CourseSheet {...props} />);
  fireEvent(screen.getByTestId('course-sheet-class-a'), 'layout', {
    nativeEvent: { layout: { height: 90 } },
  });
  fireEvent(screen.getByTestId('course-sheet-class-b'), 'layout', {
    nativeEvent: { layout: { height: 110 } },
  });
  fireEvent(screen.getByTestId('course-sheet-class-c'), 'layout', {
    nativeEvent: { layout: { height: 80 } },
  });
  expect(screen.getByTestId('course-sheet-classes-scroll')).toHaveStyle({
    height: 260,
  });
  expect(
    screen.getByTestId('course-sheet-classes-scroll').props.scrollEnabled
  ).toBe(true);
  expect(screen.getByTestId('course-sheet-class-c')).toBeTruthy();
  view.rerender(
    <CourseSheet
      {...props}
      classes={props.classes.slice(0, 2)}
    />
  );
  expect(
    screen.getByTestId('course-sheet-classes-scroll').props.scrollEnabled
  ).toBe(false);
  expect(screen.getByTestId('course-sheet-classes-scroll')).not.toHaveStyle({
    height: 260,
  });
});
