/**
 * @fileoverview API service instance configuration for microservices architecture
 * Creates and exports HTTP client instances for different business domains
 */

import { env } from '@/config/env';
import { Http } from './http.config';

/**
 * Collection of HTTP client instances for different microservices
 * Each service is initialized with its corresponding base URL
 *
 * @example
 * // Making a request to business service
 * const data = await apiInstances.businessService.get('/users');
 *
 * const response = await apiInstances.lakehouseGeographicsService.post<ResponseType, PayloadType>('/process', payload);
 *
 */
export const apiInstances = {
  service: new Http(env.API_URL),
} as const;
