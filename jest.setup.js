/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = jest.requireActual('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('react-native-mmkv', () => {
  class MMKV {
    store = new Map();

    set(key, value) {
      this.store.set(key, String(value));
    }

    getString(key) {
      return this.store.get(key);
    }

    delete(key) {
      this.store.delete(key);
    }

    clearAll() {
      this.store.clear();
    }
  }

  return { MMKV };
});

jest.mock('react-native-device-info', () => ({
  getApplicationName: jest.fn(() => 'MindyMobile'),
  getBuildNumber: jest.fn(() => '1'),
  getBundleId: jest.fn(() => 'com.mindymobile'),
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '17.0'),
  getVersion: jest.fn(() => '1.0.0'),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    API_URL: 'http://localhost:3000/api/v1',
    APP_ENV: 'development',
    APP_ORIGIN: 'https://mobile.mindy.test',
    DEBUG_MODE: 'false',
  },
}));

// Use the Node HTTP transport so MSW intercepts the real Axios pipeline.
const axios = jest.requireActual('axios');
axios.defaults.adapter = 'http';

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default
);
