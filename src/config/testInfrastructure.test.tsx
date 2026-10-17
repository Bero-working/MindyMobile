import { useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { apiInstances } from './http/apiInstance.config';
import { mockServer } from '../../tests/mocks/server';
import { TEST_API_URL } from '../../tests/mocks/constants';
import { renderHookWithProviders } from '../../tests/utils/renderWithProviders';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('runs a query through providers and the MSW server', async () => {
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, () =>
      HttpResponse.json({ status: 'ok' })
    )
  );
  const { result } = renderHookWithProviders(() =>
    useQuery({
      queryKey: ['health'],
      queryFn: () =>
        apiInstances.service.get<{ status: string }>('health/live'),
    })
  );
  await waitFor(() => expect(result.current.data).toEqual({ status: 'ok' }));
});

it('rejects requests without a matching MSW handler', async () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await expect(
      apiInstances.service.get('unhandled-test-request')
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(errors).toHaveBeenCalledWith(
      expect.stringContaining(
        '[MSW] Error: intercepted a request without a matching request handler:'
      )
    );
  } finally {
    errors.mockRestore();
  }
});
