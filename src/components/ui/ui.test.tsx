import '../../../tests/mocks/nativeUi';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TextInput, View } from 'react-native';
import '@/config/i18n.config';
import { Button } from './Button';
import { Input } from './Input';
import { ScreenState } from '../common/ScreenState';
import { CoverImage } from '../common/CoverImage';

describe('shared UI interactions', () => {
  it('uses a supplied image source, keeps the empty artwork slot on failure and recovers when replaced', () => {
    const view = render(
      <CoverImage
        source={{ uri: 'https://example.test/intro.jpg' }}
        label="Introduction"
        testID="intro"
        fallback={<View testID="empty-artwork" />}
      />
    );
    expect(screen.getByTestId('intro-image').props.source).toEqual({
      uri: 'https://example.test/intro.jpg',
    });
    fireEvent(screen.getByTestId('intro-image'), 'error');
    expect(screen.getByTestId('empty-artwork')).toBeTruthy();
    view.rerender(
      <CoverImage
        source={{ uri: 'https://example.test/replacement.jpg' }}
        label="Introduction"
        testID="intro"
        fallback={<View testID="empty-artwork" />}
      />
    );
    expect(screen.queryByTestId('empty-artwork')).toBeNull();
    expect(screen.getByTestId('intro-image')).toBeTruthy();
  });
  it('preserves the caller selected state while enforcing pending and disabled states', () => {
    render(
      <Button
        label="Selected"
        loading
        accessibilityState={{ selected: true, disabled: false }}
      />
    );
    expect(screen.getByRole('button').props.accessibilityState).toEqual({
      selected: true,
      disabled: true,
      busy: true,
    });
  });
  it('blocks pending and disabled buttons and exposes busy state', () => {
    const onPress = jest.fn();
    const view = render(
      <Button
        label="Continue"
        loading
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
    });
    view.rerender(
      <Button
        label="Continue"
        disabled
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
    view.rerender(
      <Button
        label="Continue"
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards the input ref, submit callback and password toggle without editing the value', () => {
    const ref = createRef<TextInput>();
    const onChangeText = jest.fn();
    const onSubmitEditing = jest.fn();
    render(
      <Input
        ref={ref}
        label="Password"
        password
        value=" secret "
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        testID="password"
      />
    );
    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('password').props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByRole('button'));
    expect(screen.getByTestId('password').props.secureTextEntry).toBe(false);
    expect(screen.getByTestId('password').props.value).toBe(' secret ');
    expect(onChangeText).not.toHaveBeenCalled();
    fireEvent(screen.getByTestId('password'), 'submitEditing');
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('retries the failed region only when pressed', () => {
    const onRetry = jest.fn();
    render(
      <ScreenState
        title="Could not load"
        description="Try again"
        onRetry={onRetry}
      />
    );
    expect(onRetry).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps a stable fallback for missing and failed covers and recovers on a new URL', () => {
    const view = render(
      <CoverImage
        uri={null}
        label="Course"
        testID="cover"
      />
    );
    expect(screen.getByTestId('cover-fallback')).toBeTruthy();
    view.rerender(
      <CoverImage
        uri="https://example.test/one.png"
        label="Course"
        testID="cover"
      />
    );
    fireEvent(screen.getByTestId('cover-image'), 'error');
    expect(screen.getByTestId('cover-fallback')).toBeTruthy();
    view.rerender(
      <CoverImage
        uri="https://example.test/two.png"
        label="Course"
        testID="cover"
      />
    );
    expect(screen.getByTestId('cover-image')).toBeTruthy();
  });
});
