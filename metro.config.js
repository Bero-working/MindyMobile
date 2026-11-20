/* eslint-disable @typescript-eslint/no-require-imports */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest(context, moduleName, platform) {
      // lib0/Yjs only needs crypto.getRandomValues, installed in index.js.
      // Its default native entry requires an unrelated full WebCrypto package.
      if (moduleName === 'lib0/webcrypto') {
        return {
          type: 'sourceFile',
          filePath: path.join(
            path.dirname(require.resolve('lib0/package.json')),
            'dist/webcrypto.cjs'
          ),
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    assetExts: assetExts.filter((extension) => extension !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    // Fix for duplicate dependency resolution
    unstable_enablePackageExports: true,
    // Resolve node_modules dependencies properly
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    // Block problematic nested node_modules
    blockList: [
      // Block nested @react-native packages that cause conflicts
      /node_modules\/@react-native\/metro-config\/node_modules\/@react-native\/.*/,
    ],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    unstable_allowRequireContext: true,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // Ensure proper watching of node_modules
  watchFolders: [path.resolve(__dirname, 'node_modules')],
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
  input: './global.css',
});
