import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { z } from 'zod';
import { env } from '@/config/env';
import { queryClient } from '@/config/queryClient';
import { useStore } from '@/state/store';
import { ApiError } from '@/shared/utilities/apiError';
import { logger } from '@/shared/utilities/logger';

export const CONTENT_TYPE = {
  formUrlEncoded: 'application/x-www-form-urlencoded',
  applicationJson: 'application/json',
};
type ParamValue = string | number | boolean | null | undefined;
interface ExtendedRequestConfig extends Omit<
  AxiosRequestConfig,
  'headers' | 'params'
> {
  headers?: Record<string, string>;
  params?: Record<string, ParamValue | readonly ParamValue[]>;
}
interface AuthRequestConfig extends InternalAxiosRequestConfig {
  _authGeneration?: number;
  _authRetried?: boolean;
}
const errorSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .catch(undefined),
  requestId: z.string().optional(),
});
const normalizeError = (error: Error): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const parsed = errorSchema.safeParse(error.response?.data);
    if (parsed.success) {
      const { details, requestId, ...body } = parsed.data;
      return new ApiError({
        ...body,
        statusCode: error.response?.status ?? body.statusCode,
        ...(details === undefined ? {} : { details }),
        ...(requestId === undefined ? {} : { requestId }),
      });
    }
    return new ApiError({
      statusCode: error.response?.status ?? 0,
      code: error.response ? 'HTTP_ERROR' : 'NETWORK_ERROR',
      message: error.response ? 'Request failed' : 'Network unavailable',
    });
  }
  return new ApiError({
    statusCode: 0,
    code: 'NETWORK_ERROR',
    message: 'Network unavailable',
  });
};
interface Session {
  generation: number;
  refresh: Promise<void> | null;
  lastError: ApiError | null;
}
export class Http {
  protected readonly axiosInstance: AxiosInstance;
  private static readonly sessions = new Map<string, Session>();
  constructor(baseURL: string) {
    const session = Http.sessions.get(baseURL) ?? {
      generation: 0,
      refresh: null,
      lastError: null,
    };
    Http.sessions.set(baseURL, session);
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 60_000,
    });
    this.axiosInstance.interceptors.request.use(
      async (request: AuthRequestConfig) => {
        const config = request;
        const network = await NetInfo.fetch();
        if (network.isConnected === false)
          throw new ApiError({
            statusCode: 0,
            code: 'NETWORK_ERROR',
            message: 'Network unavailable',
          });
        config._authGeneration = session.generation;
        const path = (config.url ?? '').replace(/^\//, '');
        const method = config.method?.toUpperCase();
        const needsOrigin =
          (['POST', 'PATCH', 'DELETE'].includes(method ?? '') &&
            /^(manager\/|mentor\/classes\/).*materials(?:\/|$)/.test(path)) ||
          (method === 'PATCH' && /\/units\/[^/]+\/release$/.test(path)) ||
          (method === 'POST' && /\/files\/[^/]+\/access$/.test(path));
        if (needsOrigin) {
          if (!env.APP_ORIGIN)
            throw new ApiError({
              statusCode: 0,
              code: 'APP_ORIGIN_REQUIRED',
              message: 'APP_ORIGIN is required for this mutation',
            });
          config.headers.set('Origin', env.APP_ORIGIN);
        }
        // Headers, bodies and query parameters may contain credentials or personal data.
        logger.debug('HTTP request', { method });
        return config;
      }
    );
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: Error) => {
        const normalized = normalizeError(error);
        const config: AuthRequestConfig | undefined = axios.isAxiosError(error)
          ? error.config
          : undefined;
        const isRefresh = /(?:^|\/)auth\/refresh\/?$/.test(config?.url ?? '');
        if (
          normalized.status !== 401 ||
          normalized.code !== 'AUTHENTICATION_REQUIRED' ||
          !config ||
          isRefresh
        )
          throw normalized;
        if (config._authRetried) {
          this.expireSession();
          throw normalized;
        }
        config._authRetried = true;
        if (config._authGeneration === session.generation) {
          if (!session.refresh) {
            session.refresh = this.axiosInstance
              .post('auth/refresh')
              .then(() => {
                session.lastError = null;
                session.generation++;
              })
              .catch((refreshError: Error) => {
                this.expireSession();
                session.lastError = normalizeError(refreshError);
                session.generation++;
                throw session.lastError;
              })
              .finally(() => {
                session.refresh = null;
              });
          }
          await session.refresh;
        } else if (session.lastError) {
          throw session.lastError;
        }
        return this.axiosInstance.request(config);
      }
    );
  }
  private expireSession(): void {
    queryClient.clear();
    // The Login phase will connect its auth navigator to this state.
    useStore.getState().logout();
  }
  static get axios() {
    return axios;
  }
  private createConfig(
    config: ExtendedRequestConfig,
    withCredentials: boolean,
    contentType?: string
  ): AxiosRequestConfig {
    return {
      ...config,
      withCredentials,
      headers: {
        ...(contentType ? { 'Content-Type': contentType } : {}),
        ...config.headers,
      },
      paramsSerializer: {
        serialize: (params: NonNullable<ExtendedRequestConfig['params']>) => {
          const search = new URLSearchParams();
          for (const [key, value] of Object.entries(params)) {
            for (const item of Array.isArray(value) ? value : [value]) {
              if (item !== undefined && item !== null)
                search.append(key, String(item));
            }
          }
          return search.toString();
        },
      },
    };
  }
  async get<T>(
    endpoint: string,
    config: ExtendedRequestConfig = {},
    withCredentials = true,
    contentType = CONTENT_TYPE.applicationJson
  ): Promise<T> {
    const response = await this.axiosInstance.get<T>(
      endpoint,
      this.createConfig(config, withCredentials, contentType)
    );
    return response.data;
  }
  async post<T, D>(
    endpoint: string,
    data: D,
    config: ExtendedRequestConfig = {},
    withCredentials = true,
    contentType = CONTENT_TYPE.applicationJson
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(
      endpoint,
      data,
      this.createConfig(
        config,
        withCredentials,
        data instanceof FormData ? undefined : contentType
      )
    );
    return response.data;
  }
  async put<T, D>(
    endpoint: string,
    data: D,
    config: ExtendedRequestConfig = {},
    withCredentials = true,
    contentType = CONTENT_TYPE.applicationJson
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(
      endpoint,
      data,
      this.createConfig(
        config,
        withCredentials,
        data instanceof FormData ? undefined : contentType
      )
    );
    return response.data;
  }
  async patch<T, D>(
    endpoint: string,
    data: D,
    config: ExtendedRequestConfig = {},
    withCredentials = true,
    contentType = CONTENT_TYPE.applicationJson
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(
      endpoint,
      data,
      this.createConfig(
        config,
        withCredentials,
        data instanceof FormData ? undefined : contentType
      )
    );
    return response.data;
  }
  async delete<T, D = never>(
    endpoint: string,
    data?: D,
    config: ExtendedRequestConfig = {},
    withCredentials = true,
    contentType = CONTENT_TYPE.applicationJson
  ): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, {
      ...this.createConfig(config, withCredentials, contentType),
      data,
    });
    return response.data;
  }
}
