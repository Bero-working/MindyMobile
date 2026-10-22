import { apiInstances } from '@/config/http/apiInstance.config';
import { z } from 'zod';
import { ApiError } from '@/shared/utilities/apiError';

const healthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthSchema>;

export const exampleService = {
  async checkHealth(): Promise<HealthResponse> {
    const response =
      await apiInstances.service.get<HealthResponse>('health/live');
    const parsed = healthSchema.safeParse(response);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 502,
        code: 'INVALID_HEALTH_RESPONSE',
        message: 'Invalid health response',
      });
    }
    return parsed.data;
  },
};
