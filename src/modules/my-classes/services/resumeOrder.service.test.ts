import { http, HttpResponse } from 'msw';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';
import {
  enrollmentDto,
  learningId,
  learningPage,
} from '../../../../tests/fixtures/learning';
import { verifiedResumeOrder } from './resumeOrder.service';
import { apiOrder } from '../../../../tests/fixtures/commerce';
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
it.each([true, false])(
  'checks latest enrollment review=%s and order before any link action',
  async (review) => {
    let orders = 0;
    const orderId = learningId(600);
    mockServer.use(
      http.get(TEST_API_URL + '/me/classes', () =>
        HttpResponse.json(
          learningPage([
            {
              ...enrollmentDto(),
              accessMode: 'NONE',
              accessReason: 'PENDING_PAYOS',
              enrollmentStatus: 'PENDING_PAYMENT',
              canViewClass: false,
              canViewSchedule: false,
              order: {
                orderId,
                orderCode: 'PAYOS',
                orderStatus: 'PENDING',
                paymentType: 'PAYOS',
                expiresAt: '2026-11-01T00:00:00Z',
                paidAt: null,
                requiresReview: review,
              },
            },
          ])
        )
      ),
      http.get(TEST_API_URL + '/me/orders/:id', () => {
        orders++;
        return HttpResponse.json({
          ...apiOrder(),
          id: orderId,
          status: 'EXPIRED',
          payment: null,
        });
      })
    );
    await expect(verifiedResumeOrder(orderId)).rejects.toMatchObject({
      code: 'PAYMENT_ORDER_INVALID',
    });
    expect(orders).toBe(review ? 0 : 1);
  }
);
