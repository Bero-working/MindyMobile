const appConfig = {
  name: 'Mindy Code',
  version: '1.0.0',
  bundleId: 'com.mindycode.app',

  // Navigation
  initialRouteName: 'Home',

  // Theme
  defaultTheme: 'light',

  // Features
  features: {
    darkMode: true,
    biometricAuth: true,
    pushNotifications: true,
  },

  // API
  api: {
    timeout: 10000,
    retries: 3,
  },
};

export default appConfig;
