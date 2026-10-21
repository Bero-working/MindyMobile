import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/state/store';
import { ApiError } from '@/shared/utilities/apiError';
import { authService } from '../services/auth.service';
import type { LoginValues } from '../types/auth.type';

export function useAuthSession() {
  const generation = useStore((state) => state.generation);
  const status = useStore((state) => state.bootstrapStatus);
  const user = useStore((state) => state.sessionUser);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['auth', 'me', generation],
    queryFn: ({ signal }) => authService.me(signal),
    enabled: status === 'idle',
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    if (status !== 'idle') return;
    if (query.isSuccess)
      useStore.getState().acceptSession(query.data, generation);
    else if (query.isError && query.error.status === 401)
      useStore.getState().acceptSession(null, generation);
  }, [
    generation,
    status,
    query.isSuccess,
    query.data,
    query.isError,
    query.error,
  ]);
  useEffect(() => {
    if (status === 'ready' && !user) client.clear();
  }, [client, status, user]);
  return {
    pending: status === 'idle' && !query.isError,
    error:
      status === 'idle' && query.isError && query.error.status !== 401
        ? query.error
        : null,
    retry: query.refetch,
  };
}

export function useAuthActions() {
  const client = useQueryClient();
  const login = useMutation({
    retry: false,
    gcTime: 0,
    mutationFn: async (values: LoginValues) => {
      const generation = useStore.getState().generation;
      const result = await authService.login(values);
      if (useStore.getState().generation !== generation)
        throw new ApiError({
          statusCode: 401,
          code: 'SESSION_CHANGED',
          message: 'Session changed',
        });
      if (result.user.role !== 'STUDENT') {
        await authService.logout();
        throw new ApiError({
          statusCode: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        });
      }
      await client.cancelQueries();
      if (useStore.getState().generation !== generation)
        throw new ApiError({
          statusCode: 401,
          code: 'SESSION_CHANGED',
          message: 'Session changed',
        });
      client.clear();
      useStore.getState().acceptSession(result.user, generation);
      return result;
    },
  });
  const register = useMutation({
    mutationFn: authService.register,
    retry: false,
    gcTime: 0,
  });
  const resend = useMutation({
    mutationFn: authService.resend,
    retry: false,
    gcTime: 0,
  });
  const logout = useMutation({
    retry: false,
    gcTime: 0,
    mutationFn: async () => {
      const generation = useStore.getState().generation;
      await authService.logout();
      if (useStore.getState().generation !== generation) return;
      useStore.getState().logout();
      await client.cancelQueries();
      client.clear();
    },
  });
  return {
    login: login.mutateAsync,
    register: register.mutateAsync,
    resend: resend.mutateAsync,
    signOut: logout.mutateAsync,
    signingOut: logout.isPending,
    logoutError: logout.error,
  };
}
