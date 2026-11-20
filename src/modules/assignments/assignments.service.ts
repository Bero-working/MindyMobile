import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';
import { ApiError } from '@/shared/utilities/apiError';

const uuid = z.string().uuid();
export const assignmentSchema = z.object({
  id: uuid,
  sessionId: uuid,
  type: z.enum(['QUIZ', 'ZIP', 'CODE']),
  purpose: z.enum(['TEST', 'HOMEWORK']),
  title: z.string(),
  description: z.string(),
  maxScore: z.string(),
  dueAt: dateTime.nullable(),
  timeLimitMinutes: z.number().int().positive().nullable(),
  maxAttempts: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  revision: z.number().int().positive(),
  instructionFiles: z
    .array(z.object({ id: uuid, originalFilename: z.string() }))
    .default([]),
  capabilities: z
    .object({
      zipMutationsEnabled: z.boolean(),
      instructionFilesEnabled: z.boolean(),
    })
    .optional(),
});
const pageSchema = z.object({
  items: z.array(assignmentSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const assignmentsService = {
  async list(
    classId: string,
    sessionId: string,
    page: number,
    signal?: AbortSignal
  ) {
    uuid.parse(classId);
    uuid.parse(sessionId);
    const response = await apiInstances.service.get<object>(
      `me/classes/${classId}/assignments`,
      {
        params: { sessionId, page, pageSize: 20 },
        ...(signal ? { signal } : {}),
      }
    );
    const parsed = pageSchema.safeParse(response);
    if (
      !parsed.success ||
      parsed.data.page !== page ||
      parsed.data.items.length > parsed.data.pageSize ||
      parsed.data.items.some(
        (item) => item.sessionId !== sessionId || item.status !== 'PUBLISHED'
      ) ||
      (!parsed.data.items.length &&
        parsed.data.total > (page - 1) * parsed.data.pageSize)
    )
      throw new ApiError({
        statusCode: 502,
        code: 'INVALID_ASSIGNMENT_RESPONSE',
        message: 'Invalid assignment response',
      });
    return parsed.data;
  },
};
