// tests/utils/renderWithProviders.tsx
import type { ReactElement, ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';

import { createTestQueryClient } from './createTestQueryClient';
export { createTestQueryClient } from './createTestQueryClient';

const createWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: createWrapper(createTestQueryClient()) });

export const renderHookWithProviders = <Result,>(hook: () => Result) =>
  renderHook(hook, { wrapper: createWrapper(createTestQueryClient()) });
