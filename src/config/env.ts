import { Platform } from 'react-native';
import Config from 'react-native-config';

export type AppEnv = 'development' | 'production';

const APP_ENVS: readonly string[] = ['development', 'production'];

const DEFAULT_DEV_API_URL = 'http://localhost:3000/api/v1';

const isAppEnv = (value: string | undefined): value is AppEnv =>
  value !== undefined && APP_ENVS.includes(value);

/**
 * APP_ENV lấy từ file env. Nếu thiếu/sai thì suy ra từ kiểu build,
 * để bản release không bao giờ rơi về URL localhost.
 */
const resolveAppEnv = (): AppEnv => {
  const appEnv = Config.APP_ENV;
  if (isAppEnv(appEnv)) {
    return appEnv;
  }
  return __DEV__ ? 'development' : 'production';
};

const resolveApiUrl = (appEnv: AppEnv): string => {
  const apiUrl = Config.API_URL?.trim().replace(/\/+$/, '');

  if (appEnv === 'production') {
    if (!apiUrl) {
      throw new Error('[env] API_URL is required when APP_ENV=production');
    }
    return apiUrl;
  }

  const devApiUrl = apiUrl || DEFAULT_DEV_API_URL;

  // Android emulator không truy cập được localhost của máy host, phải đi qua 10.0.2.2
  return Platform.OS === 'android'
    ? devApiUrl.replace(/\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, '//10.0.2.2')
    : devApiUrl;
};

const APP_ENV = resolveAppEnv();

export const env = {
  API_URL: resolveApiUrl(APP_ENV),
  APP_ORIGIN: Config.APP_ORIGIN?.trim() ?? '',
  APP_ENV,
  DEBUG_MODE: Config.DEBUG_MODE === 'true',
};
