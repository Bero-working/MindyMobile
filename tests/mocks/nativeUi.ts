// Native-only dependencies; screens/controllers remain real in component tests.
jest.mock('@d11/react-native-fast-image', () => ({
  __esModule: true,
  default: Object.assign(jest.requireActual('react-native').Image, {
    resizeMode: { cover: 'cover' },
  }),
}));

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: jest.fn(() => false),
}));
