import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { ApiError } from '@/shared/utilities/apiError';
import { enrollmentAction } from '../access';
import {
  checkLearningPage,
  enrollmentsSchema,
  fullDetailSchema,
  parseLearning,
  previewDetailSchema,
  type EnrollmentDto,
} from '../schemas/learning.schema';
import type { ClassDetail } from '../types';

export type ClassesFilter = {
  view: 'current' | 'history' | 'all';
  page: number;
  courseId?: string;
};
export type VerifiedClass = { detail: ClassDetail; enrollment: EnrollmentDto };
const denied = () =>
  new ApiError({
    statusCode: 403,
    code: 'CLASS_ACCESS_DENIED',
    message: 'Class access denied',
  });
function currentAccess(rows: EnrollmentDto[], classId: string) {
  const candidates = rows.filter(
    (r) =>
      r.classId === classId && r.classStatus !== 'CANCELLED' && !r.isHoldExpired
  );
  return (
    candidates.find(
      (r) => r.enrollmentStatus === 'ACTIVE' && enrollmentAction(r) === 'FULL'
    ) ??
    candidates.find(
      (r) =>
        r.enrollmentStatus === 'PENDING_PAYMENT' &&
        enrollmentAction(r) === 'CASH_PREVIEW'
    )
  );
}
async function readDetail(
  row: EnrollmentDto,
  signal?: AbortSignal
): Promise<ClassDetail> {
  const preview = row.accessMode === 'CASH_PREVIEW';
  const response = await apiInstances.service.get<object>(
    `me/classes/${row.classId}${preview ? '/preview' : ''}`,
    signal ? { signal } : {}
  );
  const data = preview
    ? parseLearning(previewDetailSchema, response)
    : parseLearning(fullDetailSchema, response);
  if (data.id !== row.classId || data.classStatus === 'CANCELLED')
    throw denied();
  return data;
}
export const learningService = {
  async classesPage(filter: ClassesFilter, signal?: AbortSignal) {
    const response = await apiInstances.service.get<object>('me/classes', {
      params: { ...filter, pageSize: 100 },
      ...(signal ? { signal } : {}),
    });
    const data = parseLearning(enrollmentsSchema, response);
    checkLearningPage(data, filter.page, data.items.length);
    return data;
  },
  async allClasses(view: ClassesFilter['view'] = 'all', signal?: AbortSignal) {
    const items = new Map<string, EnrollmentDto>();
    let page = 1,
      count = 0,
      asOf = '';
    for (;;) {
      const data = await learningService.classesPage({ view, page }, signal);
      count += data.items.length;
      checkLearningPage(data, page, count);
      data.items.forEach((item) => items.set(item.enrollmentId, item));
      asOf = data.asOf;
      if (count >= data.total) return { items: [...items.values()], asOf };
      page++;
    }
  },
  async verifiedDetail(
    classId: string,
    signal?: AbortSignal
  ): Promise<VerifiedClass> {
    if (!z.string().uuid().safeParse(classId).success)
      throw new ApiError({
        statusCode: 404,
        code: 'CLASS_NOT_FOUND',
        message: 'Class not found',
      });
    let rows = await learningService.allClasses('all', signal);
    let enrollment = currentAccess(rows.items, classId);
    if (!enrollment) throw denied();
    try {
      return { detail: await readDetail(enrollment, signal), enrollment };
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 403 ||
        !['CLASS_ACCESS_DENIED', 'CLASS_PREVIEW_DENIED'].includes(error.code)
      )
        throw error;
      const previous = enrollment.accessMode;
      rows = await learningService.allClasses('all', signal);
      enrollment = currentAccess(rows.items, classId);
      // One transition only. An unchanged hint cannot authorize another request.
      if (!enrollment || previous === enrollment.accessMode) throw error;
      return { detail: await readDetail(enrollment, signal), enrollment };
    }
  },
};
