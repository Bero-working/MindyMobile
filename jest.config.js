module.exports = {
  preset: 'react-native',
  testEnvironmentOptions: { customExportConditions: ['node', 'node-addons'] },
  setupFiles: ['./jest.setup.js'],
  transform: { '^.+\\.(js|mjs|ts|tsx)$': 'babel-jest' },
  transformIgnorePatterns: [
    'node_modules/(?!(@open-draft|msw|@mswjs|rettime|until-async|@bundled-es-modules|react-native-safe-area-context|nativewind|react-native-css-interop|react-native|react-native-reanimated|@react-native|@react-navigation|@sohantalukder/rn-kit)/)',
  ],
};
