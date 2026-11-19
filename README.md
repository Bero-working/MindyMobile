# My React Native App

A React Native application built with modern tools and best practices.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. For iOS, install pods:

   ```bash
   cd ios && pod install && cd ..
   ```

3. Run the app:

   ```bash
   # iOS
   npx react-native run-ios

   # Android
   npx react-native run-android
   ```

## Features

- TypeScript support
- Navigation with React Navigation
- State management with Zustand
- HTTP client with React Query
- UI components and theming
- Internationalization support
- Modern development tools

## Project Structure

- `src/` - Source code
- `src/navigation/` - Navigation configuration
- `src/modules/` - Feature modules
- `src/shared/` - Shared components and utilities
- `src/theme/` - Theme configuration
- `src/translations/` - Internationalization files

Happy coding! 🚀

## UI loading

The development preview gallery, Example screen and legacy demo splash have
been removed. App screens use the real authentication and API flows. Test-only
fixtures remain under `tests/fixtures/`; see [E2E checks](e2e/README.md) for the
remaining emulator scenarios.

Implementation details and validation: [Lazy loading UI](docs/IMPLEMENT/LAZY_LOADING.md).

Navigation uses `getComponent` to evaluate screen modules when their routes are
opened. Large conditional UI (shopping/filter sheets, session details, payment
results and QR codes, and account sheets) uses
`deferComponent` with a typed inline `require`. Declare deferred components at
module scope and render them only when needed; the wrapper caches the loaded
component and preserves its state during rerenders.

Shared tab navigation lives in `src/navigation/navigateLearningTab.ts` so Home
and Courses do not import the learning screen modules just to switch tabs.
Keep startup side effects (global CSS, i18n and native image interop) as explicit
side-effect imports. Metro has `inlineRequires` enabled; restart Metro after
changing its configuration.

This defers native JavaScript module evaluation and mounting. Android/iOS
release bundles still include the code; it is not downloaded on demand. Measure
startup and first-open latency in a release build before claiming speedups.
