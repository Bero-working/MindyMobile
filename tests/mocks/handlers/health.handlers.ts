import { http, HttpResponse } from 'msw';
import { TEST_API_URL } from '../constants';
export const healthHandlers = [
  http.get(`${TEST_API_URL}/health/live`, () =>
    HttpResponse.json({ status: 'ok' })
  ),
];
