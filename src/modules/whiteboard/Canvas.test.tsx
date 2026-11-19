import { fireEvent, render, screen } from '@testing-library/react-native';
import { BoardCanvas } from './Canvas';

const props = {
  boardId: '00000000-0000-4000-8000-000000000001',
  shapes: [],
  color: '#1D5B57',
  viewport: { x: 0, y: 0, zoom: 2 },
  onViewport: jest.fn(),
  onAdd: jest.fn(),
  onMove: jest.fn(),
  onDelete: jest.fn(),
  onText: jest.fn(),
};
const touch = (x: number, y: number) => ({
  nativeEvent: { locationX: x, locationY: y },
});

it('labels each collaborator cursor with the server-provided name', () => {
  render(
    <BoardCanvas
      {...props}
      editable={false}
      tool="hand"
      cursors={[
        {
          connectionId: 'a',
          identity: { id: '00000000-0000-4000-8000-000000000002', name: 'Lan' },
          x: 40,
          y: 50,
        },
      ]}
    />
  );
  expect(screen.getByTestId('whiteboard-cursor-a')).toBeTruthy();
  // react-native-svg keeps label text on the native TSpan `content` prop.
  expect(
    screen.UNSAFE_getAllByProps({ content: 'Lan' }).length
  ).toBeGreaterThan(0);
});

it('reports the world pen position while drawing, not while panning', () => {
  const onPointer = jest.fn();
  const { rerender } = render(
    <BoardCanvas
      {...props}
      editable
      tool="pen"
      cursors={[]}
      onPointer={onPointer}
    />
  );
  const canvas = screen.getByTestId('whiteboard-canvas');
  fireEvent(canvas, 'responderGrant', touch(20, 30));
  fireEvent(canvas, 'responderMove', touch(40, 60));
  expect(onPointer.mock.calls).toEqual([
    [10, 15],
    [20, 30],
  ]);
  fireEvent(canvas, 'responderRelease');
  onPointer.mockClear();
  rerender(
    <BoardCanvas
      {...props}
      editable
      tool="hand"
      cursors={[]}
      onPointer={onPointer}
    />
  );
  fireEvent(canvas, 'responderGrant', touch(20, 30));
  fireEvent(canvas, 'responderMove', touch(40, 60));
  expect(onPointer).not.toHaveBeenCalled();
});
