import { apiInstances } from '@/config/http/apiInstance.config';
import { assignmentsService } from './assignments.service';

jest.mock('@/config/http/apiInstance.config', () => ({
  apiInstances: { service: { get: jest.fn() } },
}));
const classId = '00000000-0000-4000-8000-000000000001';
const sessionId = '00000000-0000-4000-8000-000000000002';
const id = '00000000-0000-4000-8000-000000000003';
const item = {
  id,
  sessionId,
  type: 'QUIZ',
  purpose: 'HOMEWORK',
  title: 'JSX',
  description: 'Chọn đáp án đúng',
  maxScore: '10.00',
  dueAt: null,
  timeLimitMinutes: 15,
  maxAttempts: 1,
  status: 'PUBLISHED',
  revision: 1,
};
const get = jest.mocked(apiInstances.service.get);
beforeEach(() => get.mockReset());

it('requests only the selected session with pagination and cancellation', async () => {
  get.mockResolvedValue({ items: [item], total: 21, page: 2, pageSize: 20 });
  const signal = new AbortController().signal;
  const result = await assignmentsService.list(classId, sessionId, 2, signal);
  expect(get).toHaveBeenCalledWith(`me/classes/${classId}/assignments`, {
    params: { sessionId, page: 2, pageSize: 20 },
    signal,
  });
  expect(result.items[0]?.type).toBe('QUIZ');
});

it.each([
  { ...item, sessionId: classId },
  { ...item, status: 'DRAFT' },
  { ...item, dueAt: 'invalid' },
])(
  'rejects unrelated, unpublished or malformed assignments',
  async (invalid) => {
    get.mockResolvedValue({
      items: [invalid],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    await expect(
      assignmentsService.list(classId, sessionId, 1)
    ).rejects.toMatchObject({ code: 'INVALID_ASSIGNMENT_RESPONSE' });
  }
);

it('rejects broken pagination instead of requesting pages forever', async () => {
  get.mockResolvedValue({ items: [], total: 21, page: 2, pageSize: 20 });
  await expect(
    assignmentsService.list(classId, sessionId, 2)
  ).rejects.toMatchObject({ code: 'INVALID_ASSIGNMENT_RESPONSE' });
});
