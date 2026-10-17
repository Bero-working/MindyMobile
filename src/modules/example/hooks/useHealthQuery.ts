import { useQuery } from '@tanstack/react-query';

import { exampleService } from '@/modules/example/services/example.service';

export const exampleQueryKeys = {
  all: ['example'] as const,
  health: () => [...exampleQueryKeys.all, 'health'] as const,
};

export function useHealthQuery() {
  return useQuery({
    queryKey: exampleQueryKeys.health(),
    queryFn: exampleService.checkHealth,
    enabled: false,
    retry: false,
  });
}
