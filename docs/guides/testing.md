# Testing (TDD)

Cách viết unit test, component test, test API bằng MSW và E2E bằng Maestro. Đọc trước khi viết bất kỳ code production
nào, vì repo bắt buộc TDD ([ADR-0008](../adr/ADR-0008-tdd.md)). Công cụ: [ADR-0007](../adr/ADR-0007-maestro-msw.md).
Thứ tự Red → Green → Refactor: [CONTRIBUTING.md](../CONTRIBUTING.md#thứ-tự-làm-một-tính-năng-tdd).

## Nguyên tắc

- Luôn viết **unit test** và **test:e2e**. Unit test theo **TDD**: Red → Green → Refactor.
- Test hành vi người dùng thấy (text, role, testID, kết quả API), không test chi tiết cài đặt (state nội bộ, tên hàm).
- Query phần tử theo thứ tự ưu tiên: `getByRole` → `getByText` / `getByLabelText` → `getByTestId`.
- Mỗi test độc lập. Không phụ thuộc thứ tự chạy, không gọi mạng thật.
- Coverage mục tiêu: `services/`, `hooks/`, `shared/utilities/` ≥ **80%** dòng; component trong `components/ui` có test
  cho mọi variant và trạng thái `disabled` / `loading`.

| Loại | Công cụ | Vị trí |
| --- | --- | --- |
| Utility, service, hook | Jest (+ MSW cho service/hook gọi API) | `*.test.ts` cạnh file nguồn |
| Component, màn hình | `@testing-library/react-native` | `*.test.tsx` cạnh file nguồn |
| Integration cấp app | Jest + RNTL | `__tests__/` |
| E2E | Maestro | `e2e/flows/*.yaml` |

## Component testing

Button của nativecn dùng prop `label` thay cho `title`.

```tsx
// src/components/ui/Button/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button
        label="Press me"
        onPress={() => {}}
      />
    );

    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button
        label="Press me"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Press me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while loading', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button
        label="Press me"
        loading
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

## API testing

Mock server đặt ở `tests/mocks/` (không đặt trong `__tests__/`, xem [ARCHITECTURE.md](../ARCHITECTURE.md#cây-thư-mục)).

```ts
// tests/mocks/handlers/catalog.handlers.ts
import { http, HttpResponse } from 'msw';

import { TEST_API_URL } from '../constants';

export const catalogHandlers = [
  http.get(`${TEST_API_URL}/courses`, () =>
    HttpResponse.json({
      items: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          code: 'WEB101',
          title: 'Web cơ bản',
          description: null,
          imgUrl: null,
          priceAmount: 1500000,
          category: { id: 'c1', name: 'Lập trình', slug: 'lap-trinh' },
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    })
  ),
];
```

```ts
// tests/mocks/server.ts
import { setupServer } from 'msw/node';

import { catalogHandlers } from './handlers/catalog.handlers';

export const mockServer = setupServer(...catalogHandlers);
```

```ts
// src/modules/catalog/services/catalog.service.test.ts
import { http, HttpResponse } from 'msw';

import { catalogService } from '@/modules/catalog/services/catalog.service';
import { ApiError } from '@/shared/utilities/apiError';
import { mockServer } from '../../../../tests/mocks/server';
import { TEST_API_URL } from '../../../../tests/mocks/constants';

describe('catalogService', () => {
  beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('fetches courses successfully', async () => {
    const result = await catalogService.getCourses({ page: 1 });

    expect(result.total).toBe(1);
    expect(result.items[0]?.code).toBe('WEB101');
  });

  it('throws ApiError with backend code', async () => {
    mockServer.use(
      http.get(`${TEST_API_URL}/courses/:courseId`, () =>
        HttpResponse.json(
          { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Not found' },
          { status: 404 }
        )
      )
    );

    await expect(catalogService.getCourse('missing')).rejects.toMatchObject({
      code: 'COURSE_NOT_FOUND',
      status: 404,
    });
    await expect(catalogService.getCourse('missing')).rejects.toBeInstanceOf(
      ApiError
    );
  });
});
```

Khi cài MSW lần đầu, chạy thử một test để chắc request của Axios bị MSW chặn. Nếu không chặn được, kiểm tra
adapter Axios đang dùng trong Jest và `transformIgnorePatterns` cho các gói ESM của MSW.

## Hook và controller

Bọc bằng `QueryClientProvider` với client riêng cho mỗi test (`retry: false`, `gcTime: 0`):

```tsx
// tests/utils/renderWithProviders.tsx
import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

const createWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: createWrapper(createTestQueryClient()) });

export const renderHookWithProviders = <Result,>(hook: () => Result) =>
  renderHook(hook, { wrapper: createWrapper(createTestQueryClient()) });
```

## E2E (Maestro)

- Mỗi màn hình mới có ít nhất một flow cho luồng chính. Luồng tiền (giỏ hàng, checkout) có thêm flow cho lỗi
  thường gặp (`CLASS_FULL`, `CART_LIMIT_EXCEEDED`).
- Chọn phần tử bằng `testID` (kebab-case, [typescript.md](typescript.md#đặt-tên)), không bằng text vì text đổi theo
  ngôn ngữ.
- Flow chạy với backend môi trường dev/staging và tài khoản test riêng, không chạy với production.
- Flow dùng chung cho iOS và Android. Bước riêng của một nền tảng dùng `runFlow` + `when: platform`.
- E2E iOS chỉ chạy trên macOS hoặc CI runner macOS.
- `appId` không hard-code trong flow; truyền qua biến môi trường:

```bash
maestro test -e APP_ID=<id> e2e/flows
```

```yaml
# e2e/flows/login-student.yaml
appId: ${APP_ID}
---
- launchApp:
    clearState: true
- tapOn:
    id: 'login-email-input'
- inputText: 'student@example.test'
- tapOn:
    id: 'login-password-input'
- inputText: '123456'
- tapOn:
    id: 'login-submit-button'
- assertVisible:
    id: 'home-screen'
```

Bước chỉ chạy trên một nền tảng:

```yaml
- runFlow:
    when:
      platform: Android
    file: subflows/dismiss-android-permission.yaml
```

## Test bắt buộc khác

- `src/theme/colors.test.ts`: đọc `global.css`, so từng biến brand/dẫn xuất với `colors.ts`. Lệch là fail.
- `src/shared/utilities/logger.test.ts`: dữ liệu nhạy cảm bị che, `debug` không in khi `__DEV__ = false`.
- Interceptor: 401 → refresh đúng một lần cho nhiều request song song; refresh lỗi → clear cache.
