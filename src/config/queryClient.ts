// src/config/queryClient.ts
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';

import { ApiError } from '@/shared/utilities/apiError';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

export const configureQueryManagers = (): void => {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true);
    })
  );

  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        handleFocus(status === 'active');
      }
    );
    return () => subscription.remove();
  });
};

configureQueryManagers();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Chỉ retry lỗi mạng / 5xx, không retry 4xx.
      retry: (failureCount, error) =>
        (error.status === 0 || error.status >= 500) && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});
