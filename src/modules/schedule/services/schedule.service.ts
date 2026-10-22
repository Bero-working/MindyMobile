import { apiInstances } from '@/config/http/apiInstance.config';
import { rangeSchema } from '@/modules/home/schemas/homeResponse.schema';
import {
  checkLearningPage,
  invalidLearningResponse,
  learningScheduleSchema,
  parseLearning,
} from '@/modules/my-classes/schemas/learning.schema';
import type { ScheduleSession } from '../types';

export const scheduleService = {
  async week(range: { from: string; to: string }, signal?: AbortSignal) {
    parseLearning(rangeSchema, range);
    const items = new Map<string, ScheduleSession>();
    let page = 1,
      count = 0;
    let timeZone = '',
      asOf = '';
    for (;;) {
      const response = await apiInstances.service.get<object>('me/schedule', {
        params: { ...range, page, pageSize: 100, includeCancelled: true },
        ...(signal ? { signal } : {}),
      });
      const data = parseLearning(learningScheduleSchema, response);
      count += data.items.length;
      checkLearningPage(data, page, count);
      if (
        Date.parse(data.from) !== Date.parse(range.from) ||
        Date.parse(data.to) !== Date.parse(range.to) ||
        (timeZone && timeZone !== data.timeZone)
      )
        throw invalidLearningResponse();
      timeZone = data.timeZone;
      asOf = data.asOf;
      data.items.forEach((item) => {
        if (item.accessMode !== 'SESSION_MAKEUP')
          items.set(item.sessionId, { ...item, accessMode: item.accessMode });
      });
      if (count >= data.total)
        return {
          items: [...items.values()].sort(
            (a, b) =>
              Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
              a.sessionId.localeCompare(b.sessionId)
          ),
          timeZone,
          asOf,
        };
      page++;
    }
  },
};
