import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { useExampleController } from './useExampleController';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import { renderHookWithProviders } from '../../../../tests/utils/renderWithProviders';
import '@/config/i18n.config';

jest.mock('@sohantalukder/rn-kit', () => ({
  useTheme: () => ({ changeTheme: jest.fn() }),
}));

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

it('checks health only when pressed and displays confirmation', async () => {
  const handler = jest.fn(() =>
    HttpResponse.json({ status: 'ok', timestamp: '2026-10-17T07:00:00.000Z' })
  );
  mockServer.use(http.get(`${TEST_API_URL}/health/live`, handler));
  const { result } = renderHookWithProviders(useExampleController);
  expect(handler).not.toHaveBeenCalled();
  const button = result.current.features.find(
    (feature) => feature.testID === 'example-api-check'
  );
  if (!button) throw new Error('Missing API check button');
  await act(async () => button.onPress());
  await waitFor(() =>
    expect(result.current.features[0]?.feedback).toEqual({
      testID: 'example-api-success',
      message: 'Kết nối API thành công. Máy chủ Mindy đang hoạt động.',
    })
  );
  expect(handler).toHaveBeenCalledTimes(1);
});

it('shows a failed health check and allows a successful manual retry', async () => {
  let available = false;
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockServer.use(
    http.get(`${TEST_API_URL}/health/live`, () =>
      available
        ? HttpResponse.json({
            status: 'ok',
            timestamp: '2026-10-17T07:00:00.000Z',
          })
        : HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Unavailable' },
            { status: 503 }
          )
    )
  );
  try {
    const { result } = renderHookWithProviders(useExampleController);
    await act(async () => result.current.features[0]?.onPress());
    await waitFor(() =>
      expect(result.current.features[0]?.feedback).toEqual({
        testID: 'example-api-error',
        message:
          'Không thể kết nối API (UNAVAILABLE, HTTP 503). Vui lòng thử lại.',
      })
    );
    available = true;
    await act(async () => result.current.features[0]?.onPress());
    await waitFor(() =>
      expect(result.current.features[0]?.feedback?.testID).toBe(
        'example-api-success'
      )
    );
  } finally {
    errors.mockRestore();
  }
});
