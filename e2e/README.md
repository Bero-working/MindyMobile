# End-to-end checks

`npm run test:e2e` runs the app launch and authentication UI checks against an
installed build on an Android emulator/device. These checks validate navigation
and empty form errors without creating accounts or submitting payments.

The scenarios in `api/` and `backend/` use real application screens and require
the student session, backend dataset and parameters described in each flow.
Run those explicitly after preparing the required environment. Keep credentials
out of committed files and command logs.

The development preview gallery and flows relying on its fake data were removed.
Component, hook and API adapter coverage remains in the Jest suite; fixtures and
HTTP mocks used by tests live under `tests/`.
