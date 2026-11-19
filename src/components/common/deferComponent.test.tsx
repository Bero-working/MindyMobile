import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { deferComponent } from './deferComponent';

it('loads only when shown, preserves state on rerender, and reuses the module after reopening', () => {
  const load = jest.fn(
    () =>
      function Counter({ label }: { label: string }) {
        const [count, setCount] = useState(0);
        return (
          <Pressable
            testID="counter"
            onPress={() => setCount(count + 1)}
          >
            <Text>{`${label}: ${count}`}</Text>
          </Pressable>
        );
      }
  );
  const DeferredCounter = deferComponent(load);
  function Host({ visible, label }: { visible: boolean; label: string }) {
    return visible ? <DeferredCounter label={label} /> : null;
  }
  const view = render(
    <Host
      visible={false}
      label="First"
    />
  );
  expect(load).not.toHaveBeenCalled();

  view.rerender(
    <Host
      visible
      label="First"
    />
  );
  fireEvent.press(screen.getByTestId('counter'));
  view.rerender(
    <Host
      visible
      label="Updated"
    />
  );
  expect(screen.getByText('Updated: 1')).toBeTruthy();
  expect(load).toHaveBeenCalledTimes(1);

  view.rerender(
    <Host
      visible={false}
      label="Updated"
    />
  );
  view.rerender(
    <Host
      visible
      label="Reopened"
    />
  );
  expect(screen.getByText('Reopened: 0')).toBeTruthy();
  expect(load).toHaveBeenCalledTimes(1);
});
