import { AppState, type AppStateStatus } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { queryClient, configureQueryManagers } from './queryClient';
import { ApiError } from '@/shared/utilities/apiError';

it('retries only network and server errors at most twice', () => {
  const retry = queryClient.getDefaultOptions().queries?.retry;
  if (typeof retry !== 'function') throw new Error('Expected a retry function');
  const error = (status: number) =>
    new ApiError({ statusCode: status, code: 'TEST', message: 'Test' });
  expect(retry(0, error(404))).toBe(false);
  expect(retry(1, error(500))).toBe(true);
  expect(retry(2, error(500))).toBe(false);
  expect(retry(0, error(0))).toBe(true);
  expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30_000);
  expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
});

it('tracks native connectivity', () => {
  const unsubscribe = onlineManager.subscribe(() => {});
  const listener = jest.mocked(NetInfo.addEventListener).mock.calls[0]?.[0];
  if (!listener) throw new Error('Missing network listener');
  listener({ isConnected: false } as NetInfoState);
  expect(onlineManager.isOnline()).toBe(false);
  listener({ isConnected: true } as NetInfoState);
  expect(onlineManager.isOnline()).toBe(true);
  unsubscribe();
});

it('tracks native app focus and removes its listener', () => {
  let listener: ((status: AppStateStatus) => void) | undefined;
  const remove = jest.fn();
  const spy = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_event, callback) => {
      listener = callback;
      return { remove };
    });
  configureQueryManagers();
  queryClient.mount();
  if (!listener) throw new Error('Missing focus listener');
  listener('background');
  expect(focusManager.isFocused()).toBe(false);
  listener('active');
  expect(focusManager.isFocused()).toBe(true);
  queryClient.unmount();
  expect(remove).toHaveBeenCalled();
  spy.mockRestore();
});
