# Business Rules — MindyMobile

Cập nhật: **16/10/2026**. Áp dụng cho mọi code trong repo MindyMobile (React Native, app của Mindy Center).

Thứ tự ưu tiên khi các nguồn mâu thuẫn:

1. `docs/API_CONTRACT/API_CONTRACT_FE.md`: hành vi API (route, body, mã lỗi, polling).
2. File này: kiến trúc, UI, UX, test, quy trình.
3. `docs/CORE/GLOBAL_CSS.md`: màu, font, border (nguồn token cho mục 7).
4. Code mẫu của boilerplate (`example`, `contacts`, interceptor Bearer): chỉ để tham khảo, sửa dần theo file này.

Từ khoá: **PHẢI** là bắt buộc, review sẽ chặn. **KHÔNG ĐƯỢC** là cấm. **NÊN** là khuyến nghị, cần lý do khi làm khác.

---

## Mục lục

1. [Tech stack](#1-tech-stack)
2. [Cấu trúc thư mục và đặt tên](#2-cấu-trúc-thư-mục-và-đặt-tên)
3. [Quy trình làm việc](#3-quy-trình-làm-việc)
4. [TypeScript và định nghĩa type](#4-typescript-và-định-nghĩa-type)
5. [Gọi API: Axios + TanStack Query](#5-gọi-api-axios--tanstack-query)
6. [UI: NativeWind + nativecn](#6-ui-nativewind--nativecn)
7. [Global CSS cho Tailwind](#7-global-css-cho-tailwind)
8. [Hình ảnh và animation thay cho card](#8-hình-ảnh-và-animation-thay-cho-card)
9. [UX](#9-ux)
10. [Performance](#10-performance)
11. [Logging](#11-logging)
12. [Testing (TDD)](#12-testing-tdd)
13. [Lint, ESLint, TypeScript](#13-lint-eslint-typescript)
14. [Nghiệp vụ theo API contract](#14-nghiệp-vụ-theo-api-contract)
15. [Việc cần làm để áp dụng file này](#15-việc-cần-làm-để-áp-dụng-file-này)

---

## 1. Tech stack

| Hạng mục | Lựa chọn | Trạng thái trong repo |
| --- | --- | --- |
| Framework | React Native 0.80 (CLI, không Expo), React 19 | Có |
| Ngôn ngữ | TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) | Có |
| HTTP | Axios, bọc trong class `Http` (`src/config/http/http.config.ts`) | Có |
| Server state | TanStack Query v5 | Có |
| Client state | Zustand (slice) | Có |
| Styling | Tailwind qua **NativeWind v4** (`className`) | **Chưa cài** (mục 15) |
| UI component | **nativecn** (https://nativecn.mintlify.app), copy vào repo rồi custom | **Chưa cài** |
| Biến thể class | `class-variance-authority`, `clsx`, `tailwind-merge` | **Chưa cài** |
| Animation | `react-native-reanimated` 3 | Có |
| Ảnh | `@d11/react-native-fast-image`, `react-native-svg` | Có |
| List | `FlatList`, `@shopify/flash-list` | Có |
| Form/validation | `zod` | Có |
| i18n | `i18next` + `react-i18next` | Có |
| Unit/component test | Jest + `@testing-library/react-native` | Có |
| Mock API trong test | **MSW** (`msw/node`) | **Chưa cài** |
| E2E | **Maestro** | **Chưa cài** |

Không thêm thư viện ngoài danh sách trên khi chưa thống nhất với team.

---

## 2. Cấu trúc thư mục và đặt tên

Repo dựng từ boilerplate `@sohantalukder/react-native-boilerplate`
(https://sohantalukder.github.io/react-native-boilerplate/docs/project-structure/). Tài liệu boilerplate
và repo thực tế đặt tên hơi khác nhau. **Theo tên trong repo**:

| Boilerplate docs | Repo MindyMobile |
| --- | --- |
| `src/store/` | `src/state/` (`store.ts` + `slices/`) |
| `src/utils/` | `src/shared/utilities/` |
| `src/hooks/` | `src/shared/hooks/` |
| `App.tsx` | `src/index.tsx` |

### 2.1 Cây thư mục

```
MindyMobile/
├── global.css                  # Token Tailwind (mục 7)
├── tailwind.config.js
├── nativewind-env.d.ts
├── assets/fonts/               # Nunito TTF, link qua react-native.config.js
├── e2e/flows/                  # Maestro flow (*.yaml)
├── tests/                      # Helper cho test, KHÔNG chứa file test
│   ├── mocks/                  # server.ts, handlers/<feature>.handlers.ts
│   └── utils/                  # renderWithProviders.tsx, createTestQueryClient.ts
├── __tests__/                  # Test cấp app / integration
└── src/
    ├── assets/                 # constants/, images/, illustrations/ (SVG)
    ├── components/
    │   ├── ui/                 # Component nativecn đã custom (Button, Input, Badge, Dialog...)
    │   └── common/             # Component dùng chung tự viết (PressableScale, CoverImage, ScreenState...)
    ├── config/                 # env.ts, http/, queryClient.ts, i18n.config.ts
    ├── modules/<feature>/      # Mỗi feature một thư mục (2.2)
    ├── navigation/             # routes.ts, types.ts, index.tsx
    ├── services/               # storage/, appInfo/
    ├── shared/
    │   ├── hooks/
    │   └── utilities/          # cn.ts, logger.ts, apiError.ts, format*.ts
    ├── state/                  # store.ts, slices/
    ├── theme/                  # colors.ts, regions.ts, motion.ts
    ├── translations/
    └── types/                  # Type dùng chung: user.ts, api.ts, enums.ts
```

`tests/` (không phải `__tests__/`) chứa helper vì Jest chạy mọi file trong `__tests__/` như test. `tsconfig.json`
đã include `tests/**/*`.

### 2.2 Feature module

```
src/modules/catalog/
├── index.ts
├── CatalogScreen.tsx           # Chỉ render, lấy mọi thứ từ controller
├── CatalogScreen.test.tsx
├── components/
│   └── CourseCover/
│       ├── index.ts
│       ├── CourseCover.tsx
│       └── CourseCover.test.tsx
├── hooks/
│   ├── useCoursesQuery.ts      # Query + factory key
│   ├── useAddToCartMutation.ts
│   └── useCatalogController.ts # Gom query, mutation, i18n, toast, điều hướng
├── services/catalog.service.ts
├── schemas/catalog.schema.ts   # zod cho form/filter
├── constants/catalog.constant.ts
└── types/catalog.type.ts
```

Thêm màn hình mới phải sửa đủ 4 chỗ: enum `src/navigation/routes.ts`, `RootStackParamList` trong
`src/navigation/types.ts`, export trong `src/modules/index.ts`, `<Stack.Screen>` trong `src/navigation/index.tsx`.

### 2.3 Đặt tên

| Loại | Quy tắc | Ví dụ |
| --- | --- | --- |
| Thư mục component | PascalCase, có `index.ts` | `components/ui/Button/` |
| File component | PascalCase trùng tên component | `Button.tsx` |
| Màn hình | PascalCase, hậu tố `Screen` | `CatalogScreen.tsx` |
| Hook | camelCase, tiền tố `use` | `useCoursesQuery.ts` |
| Service / type / constant / schema | `<feature>.service.ts`, `.type.ts`, `.constant.ts`, `.schema.ts` | `cart.service.ts` |
| Test | `<Tên>.test.ts(x)` đặt cạnh file nguồn | `Button.test.tsx` |
| Maestro flow | kebab-case | `e2e/flows/login-student.yaml` |
| `testID` | kebab-case, `<màn>-<phần tử>` | `login-submit-button` |
| Translation key | `<feature>.<màn/khối>.<khoá>` | `catalog.list.emptyTitle` |

---

## 3. Quy trình làm việc

Tham khảo: https://sohantalukder.github.io/react-native-boilerplate/docs/development/ và
https://sohantalukder.github.io/react-native-boilerplate/docs/configuration/

### 3.1 Lệnh

```bash
npm install
npm start                       # Metro
npm run android                 # hoặc npm run ios (cần macOS)
npm test                        # Jest
npx jest src/modules/catalog    # Chạy test của một module
npm run test:report             # Coverage
npm run test:e2e                # Maestro (sau khi thêm script, mục 15)
npm run lint:rules              # ESLint
npm run lint:code-format        # Prettier
npm run lint:type-check         # tsc
```

`npm run lint` và `lint:fix` gọi `yarn` bên trong. Không có yarn thì chạy từng script con bằng npm.

### 3.2 Chạy máy ảo và Dev Menu

- **Android Emulator**: tạo AVD trong Android Studio, mở emulator rồi `npm run android`. Trong emulator, `localhost`
  của máy host là `10.0.2.2`. `src/config/env.ts` tự đổi khi `APP_ENV=development`. Thiết bị thật cắm USB thì chạy
  `adb reverse tcp:8081 tcp:8081`.
- **iOS Simulator**: chỉ trên macOS. Chạy `npm run pod-install` trước lần đầu, sau đó `npm run ios`.
- **Dev Menu**: ở chế độ development, lắc thiết bị hoặc bấm:
  - iOS Simulator: `Cmd + D`
  - Android Emulator: `Cmd + M` (Mac) hoặc `Ctrl + M` (Windows/Linux)
- Reload nhanh: bấm `R` hai lần trên Android, `Cmd + R` trên iOS. Fast Refresh bật mặc định và giữ state component
  khi sửa code.
- Đổi file `.env` / `.env.production` phải build lại native. Reload Metro không đủ.
- Bật `global.css` hoặc sửa `tailwind.config.js` mà style không ăn: chạy `npm start -- --reset-cache`.

### 3.3 Thứ tự làm một tính năng (TDD)

1. Đọc section tương ứng trong API contract. Ghi chú route, body, mã lỗi, rule polling.
2. Viết type trong `types/` (mục 4).
3. **Red**: viết MSW handler và test cho service. Chạy, test phải fail.
4. **Green**: viết service cho test pass.
5. Lặp red → green cho hook query/mutation, rồi controller, rồi component/màn hình.
6. **Refactor** khi test đang xanh.
7. Viết Maestro flow cho luồng chính của màn hình.
8. Chạy đủ checklist ở 3.4.

Không viết code production trước khi có test fail cho nó. Sửa bug cũng vậy: viết test tái hiện bug trước.

### 3.4 Definition of Done

- [ ] Test viết trước code, tất cả xanh (`npm test`).
- [ ] Có Maestro flow cho luồng chính (màn hình mới hoặc luồng thay đổi).
- [ ] `npm run lint:rules`, `npm run lint:code-format`, `npm run lint:type-check` không lỗi.
- [ ] Không có `any`, `unknown`, `@ts-ignore`, `eslint-disable` mới (ngoại lệ ghi ở mục 11).
- [ ] Text hiển thị đi qua `t(...)`, có key cho tất cả ngôn ngữ đang hỗ trợ.
- [ ] Màn hình có đủ 4 trạng thái: loading, empty, error, success (mục 9).
- [ ] Chạy thử trên Android Emulator (và iOS Simulator nếu có máy Mac).

---

## 4. TypeScript và định nghĩa type

### 4.1 Quy tắc

- **KHÔNG ĐƯỢC** dùng `any`, `unknown` để khai báo type, kể cả trong generic (`Record<string, unknown>`), tham số
  hàm, `as unknown as T`. ESLint chặn bằng `@typescript-eslint/no-explicit-any` và rule `TSUnknownKeyword` (mục 13).
- **KHÔNG ĐƯỢC** dùng `@ts-ignore`, `@ts-expect-error`, non-null assertion `!`.
- Biến `catch (error)` để TS tự suy kiểu, không ghi `: unknown`. Thu hẹp bằng `error instanceof Error`,
  `error instanceof ApiError` hoặc `axios.isAxiosError(error)`.
- Dữ liệu chưa rõ kiểu (JSON, route params từ deep link, MMKV) phải đi qua zod `safeParse` rồi mới dùng.
- DTO của API khai báo bằng `interface`, đặt tên theo contract (bỏ hậu tố `Dto`). Query params và union dùng `type`.
- Enum của contract viết bằng string literal union, không dùng `enum` của TS.
- Timestamp từ API giữ kiểu `string` (ISO 8601 UTC). Chỉ đổi sang `Date` khi hiển thị/tính toán.
- Field nullable theo contract khai báo `T | null`. Field có thể vắng khai báo `field?: T`. Với
  `exactOptionalPropertyTypes`, không gán `undefined` cho field optional; bỏ hẳn field đó.
- Phần tử lấy từ mảng/record có kiểu `T | undefined` (`noUncheckedIndexedAccess`), phải kiểm tra trước khi dùng.
- Kiểu trả về của hàm export phải ghi rõ.

### 4.2 Ví dụ định nghĩa

```ts
// src/types/enums.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'MENTOR' | 'STUDENT';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
export type DeliveryMode = 'ONLINE' | 'OFFLINE';
export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
```

```ts
// src/types/user.ts
import type { UserRole, UserStatus } from '@/types/enums';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceName?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface AuthenticatedUser {
  user: User;
  accessTokenExpiresAt: string;
}

// Không có token: backend dùng cookie HttpOnly, app không đọc/lưu token.
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}
```

```ts
// src/types/api.ts
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type QueryParamValue = string | number | boolean | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
  details?: string | string[];
  requestId?: string;
}
```

---

## 5. Gọi API: Axios + TanStack Query

### 5.1 Tầng gọi

```
Screen  →  use<Feature>Controller  →  use<Feature>Query / Mutation  →  <feature>.service  →  apiInstances.service (Http/Axios)
```

- Component **KHÔNG ĐƯỢC** gọi service hoặc Axios trực tiếp.
- Service chỉ gọi HTTP và trả DTO. Không chứa toast, i18n, điều hướng.
- Hook query/mutation chỉ bọc TanStack Query. Logic màn hình nằm ở controller.
- `Http` trả thẳng `response.data`. Response của backend là DTO trực tiếp, **không** có wrapper `{ data }`.

### 5.2 Http client

- `API_URL` trỏ tới `{API_ORIGIN}/api/v1`. Service dùng path tương đối, không có `/` đầu: `'courses'`, `'me/cart'`.
- Giữ `withCredentials: true`. Backend xác thực bằng cookie HttpOnly `access_token` / `refresh_token`. Networking
  native của RN (NSURLSession / OkHttp) tự lưu và gửi cookie.
- **KHÔNG ĐƯỢC** gắn `Authorization: Bearer`, không lưu token vào MMKV. Phần này trong interceptor là của template,
  phải bỏ.
- Mọi lỗi phải được chuẩn hoá thành `ApiError` trong response interceptor. Lỗi mạng dùng `status: 0`,
  `code: 'NETWORK_ERROR'`. Nhờ đó mọi `error` trong TanStack Query có cùng kiểu.
- Xử lý lỗi theo `status` + `code`, **không** so sánh `message` (`message` có thể là mảng).
- 401 `AUTHENTICATION_REQUIRED`: gọi `POST auth/refresh` **một lần**, dạng single-flight (các request song song chờ
  chung một promise), rồi retry request gốc **một lần**. Refresh lỗi → `queryClient.clear()`, reset store auth,
  về màn Login. Request `auth/refresh` không đi qua nhánh này.
- Mutation cần header `Origin` (materials, release unit, file access, xem contract §1.3) phải set header từ
  `env.APP_ORIGIN`. Giá trị này phải nằm trong `CORS_ORIGINS` của backend (cần BE xác nhận, mục 15).
- Teaching / Attendance: gửi `Idempotency-Key` (UUID v4). Một key cho một ý định; retry vì lỗi mạng giữ nguyên key
  và body; đổi body thì sinh key mới.
- Log request trong dev phải che `password`, `cookie`, `set-cookie`, `authorization` (dùng `logger`, mục 11).

```ts
// src/shared/utilities/apiError.ts
import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly string[];
  readonly requestId: string | undefined;

  constructor(body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join('\n') : body.message);
    this.name = 'ApiError';
    this.status = body.statusCode;
    this.code = body.code;
    this.details =
      body.details === undefined
        ? []
        : Array.isArray(body.details)
          ? body.details
          : [body.details];
    this.requestId = body.requestId;
  }
}

export const isApiErrorCode = (error: Error, code: string): boolean =>
  error instanceof ApiError && error.code === code;
```

### 5.3 Service

```ts
// src/modules/catalog/services/catalog.service.ts
import { apiInstances } from '@/config/http/apiInstance.config';
import type { Paginated } from '@/types/api';
import type {
  Course,
  CourseDetail,
  CourseListParams,
} from '@/modules/catalog/types/catalog.type';

export const catalogService = {
  getCourses(params: CourseListParams): Promise<Paginated<Course>> {
    return apiInstances.service.get<Paginated<Course>>('courses', { params });
  },

  getCourse(courseId: string): Promise<CourseDetail> {
    return apiInstances.service.get<CourseDetail>(`courses/${courseId}`);
  },
};
```

### 5.4 Query

- Mỗi feature có factory key `<feature>QueryKeys`. Key gồm đủ ID, filter, page.
- Dữ liệu cá nhân (`me/...`, `mentor/...`) **PHẢI** có `userId` trong key để không lẫn cache giữa các tài khoản.
- Danh sách phân trang dùng `useInfiniteQuery`, trang tiếp theo tính từ `page`, `pageSize`, `total`.
- Đổi filter → key mới, page về 1.
- Dùng `select` để lấy phần cần thiết, tránh re-render khi phần khác của data đổi.

```ts
// src/modules/catalog/hooks/useCoursesQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';

import { catalogService } from '@/modules/catalog/services/catalog.service';
import type { CourseListParams } from '@/modules/catalog/types/catalog.type';

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  courses: (params: CourseListParams) =>
    [...catalogQueryKeys.all, 'courses', params] as const,
  course: (courseId: string) =>
    [...catalogQueryKeys.all, 'course', courseId] as const,
};

export function useCoursesQuery(params: CourseListParams) {
  return useInfiniteQuery({
    queryKey: catalogQueryKeys.courses(params),
    queryFn: ({ pageParam }) =>
      catalogService.getCourses({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
}
```

### 5.5 Mutation

- Sau mutation thành công, invalidate đúng các key theo bảng "Refetch sau mutation" trong contract §21.
- Không làm optimistic update cho thanh toán, điểm danh, giỏ hàng (server quyết định chỗ ngồi, giá, trạng thái).
- 409 có `expectedRevision` / `expectedVersion` → refetch rồi để người dùng quyết định lại. Không tự tăng version
  rồi retry.

```ts
// src/modules/cart/hooks/useAddToCartMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartService } from '@/modules/cart/services/cart.service';
import { cartQueryKeys } from '@/modules/cart/hooks/useCartQuery';

export function useAddToCartMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => cartService.addItem({ classId }),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(userId), cart);
    },
  });
}
```

### 5.6 QueryClient cho React Native

```ts
// src/config/queryClient.ts
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';

import { ApiError } from '@/shared/utilities/apiError';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected === true);
  })
);

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    'change',
    (status: AppStateStatus) => {
      handleFocus(status === 'active');
    }
  );
  return () => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Chỉ retry lỗi mạng / 5xx, không retry 4xx.
      retry: (failureCount, error) =>
        (error.status === 0 || error.status >= 500) && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});
```

Polling (upload file, chờ PayOS, roster điểm danh) làm đúng tần suất và điều kiện dừng trong contract §21, dùng
`refetchInterval` trả `false` khi đạt điều kiện dừng. Catalog, lịch, material review **không** poll.

---

## 6. UI: NativeWind + nativecn

### 6.1 Styling

- Style bằng `className` của NativeWind. Không dùng `StyleSheet` cho style tĩnh mới.
- **KHÔNG ĐƯỢC** inline style object (`style={{ ... }}`) và màu literal (`#fff`, `'red'`). ESLint đã chặn.
- `style={...}` chỉ dùng cho giá trị động: style của Reanimated (`useAnimatedStyle`) và biến CSS vùng (`regionVars`,
  mục 7.5).
- Màu chỉ lấy từ token (mục 7). **KHÔNG ĐƯỢC** dùng palette mặc định của Tailwind (`bg-slate-700`, `text-gray-500`...).
  Prop không nhận `className` (`selectionColor`, `placeholderTextColor`, `ActivityIndicator.color`, SVG `fill`,
  theme của React Navigation, `StatusBar`) lấy màu từ `src/theme/colors.ts`.
- Ghép class bằng `cn()`:

```ts
// src/shared/utilities/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
```

- Component ngoài (FastImage, Svg...) muốn nhận `className` phải đăng ký `cssInterop` một lần trong
  `src/components/common/interop.ts`.

### 6.2 nativecn

nativecn là bộ component kiểu shadcn/ui cho React Native: không cài package, copy source vào repo rồi sửa. Danh sách:
Avatar, Badge, Button, Card, Checkbox, Dialog, Drop down, Input, Progress, Radio group, Select, Skeleton, Switch,
Tabs, Toast.

Cách thêm một component:

1. Lấy source bằng `npx nativecn-ui add <Component>` hoặc copy từ
   https://github.com/Mobilecn-UI/nativecn-ui/tree/main/components.
2. Đặt vào `src/components/ui/<Component>/<Component>.tsx` kèm `index.ts`. Đổi import `../lib/utils` thành
   `@/shared/utilities/cn`.
3. **Viết test cho hành vi hiện có trước khi sửa** (mục 12).
4. Custom theo bảng dưới, chạy lại test.

| Việc phải sửa | Lý do |
| --- | --- |
| Đổi màu palette mặc định sang token (`ghost: 'bg-slate-700'` → `bg-secondary`, `text-foreground`...) | Đúng màu GLOBAL_CSS |
| Thêm variant còn thiếu theo GLOBAL_CSS §4: `outline`, `action` (CTA coral) | Đồng bộ với web |
| Chiều cao tối thiểu 44 (`h-11` trở lên) hoặc `hitSlop` | Vùng chạm (mục 9) |
| `accessibilityRole`, `accessibilityState` (`disabled`, `busy`), `accessibilityLabel` | Accessibility |
| Prop `loading`: hiện spinner, khoá bấm | Chống bấm hai lần |
| Prop `testID` truyền xuống phần tử bấm được | Maestro / RNTL |
| Font qua class `font-nunito-*` | Android không tự chọn weight cho font custom |
| Nếu import gói `expo-*` → thay bằng thư viện RN CLI tương đương | Repo không dùng Expo |
| Thay `TouchableOpacity` bằng `Pressable` + phản hồi chạm (mục 8) | Nhất quán animation |

Quan hệ với `@sohantalukder/rn-kit`:

- Component UI mới dùng nativecn + NativeWind. Không trộn component rn-kit và nativecn trong cùng một màn hình.
- `ThemeProvider`, `UiPortalProvider` và `toast` của rn-kit giữ nguyên cho tới khi team quyết định thay.
  Chỉ dùng **một** hệ toast trong app.

---

## 7. Global CSS cho Tailwind

Chuyển từ `docs/CORE/GLOBAL_CSS.md` sang NativeWind. Màu khai báo dạng biến CSS chứa 3 kênh RGB để dùng được
độ mờ (`bg-mint/50`, `shadow-forest/20`).

Quy tắc:

- Đổi màu → sửa `global.css` **và** `src/theme/colors.ts` cùng lúc. Có test đối chiếu hai file (mục 12.6).
- Màu dẫn xuất (`soft`, `line`, `muted`...) dùng hex đã quy đổi trong GLOBAL_CSS, không tự pha lại.
- App v1 chỉ có **light mode**. Dark mode chưa có bảng màu thì chưa làm.

### 7.1 `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* 1. Màu gốc (brand) */
  --canvas: 255 255 255; /* #FFFFFF */
  --mint: 51 138 133; /* #338A85 */
  --forest: 29 91 87; /* #1D5B57 */
  --coral: 255 127 80; /* #FF7F50 */
  --headsup: 255 84 0; /* #FF5400 */
  --sunshine: 255 221 174; /* #FFDDAE */
  --logo-soft: 216 240 250; /* #D8F0FA */
  --black: 0 0 0; /* #000000 */

  /* 2. Màu pha (dẫn xuất) */
  --soft: 241 247 246; /* #F1F7F6  mint 7% + trắng */
  --line: 216 233 232; /* #D8E9E8  mint 19% + trắng */
  --muted: 52 107 104; /* #346B68  forest 90% + trắng */
  --peach: 255 238 232; /* #FFEEE8  coral 13% + trắng */
  --action: 255 153 115; /* #FF9973  coral 80% + trắng */
  --action-hover: 255 165 132; /* #FFA584  coral 70% + trắng */
  --banner: 202 225 223; /* #CAE1DF  mint 26% + trắng */
  --catalog-ink: 38 38 38; /* #262626  đen 85% + trắng */

  /* Trạng thái */
  --status-green: 21 128 61; /* #15803D */
  --status-yellow: 161 98 7; /* #A16207 */
  --status-red: 185 28 28; /* #B91C1C */
  --pastel-red: 213 119 119; /* #D57777 */
  --ink-soft: 46 46 46; /* #2E2E2E */
  --ink-gray: 107 107 107; /* #6B6B6B */

  /* 3. Token ngữ nghĩa (ghi giá trị trực tiếp, không trỏ var() lồng nhau) */
  --background: 255 255 255; /* canvas */
  --foreground: 29 91 87; /* forest */
  --card: 255 255 255; /* canvas */
  --card-foreground: 29 91 87; /* forest */
  --popover: 255 255 255; /* canvas */
  --popover-foreground: 29 91 87; /* forest */
  --primary: 29 91 87; /* forest */
  --primary-foreground: 255 255 255; /* canvas */
  --secondary: 241 247 246; /* soft */
  --secondary-foreground: 29 91 87; /* forest */
  --accent: 241 247 246; /* soft */
  --accent-foreground: 29 91 87; /* forest */
  --border: 216 233 232; /* line */
  --input: 216 233 232; /* line */
  --ring: 51 138 133; /* mint */
  --muted-foreground: 52 107 104; /* muted */
  --destructive: 255 84 0; /* headsup */
  --destructive-foreground: 255 255 255; /* canvas */
  --hero: 51 138 133; /* mint */
  --hero-ink: 255 255 255; /* canvas */
  --hero-copy: 255 255 255; /* canvas */
  --feature: 255 221 174; /* sunshine */
}

/* 7. Kiểu chữ dùng chung (GLOBAL_CSS §7, bỏ breakpoint sm/lg của web) */
@layer components {
  .section-title {
    @apply font-nunito-extrabold text-3xl tracking-tight text-foreground;
  }

  .eyebrow {
    @apply font-nunito-extrabold text-xs uppercase tracking-[0.14em] text-mint;
  }

  .text-link {
    @apply font-nunito-extrabold text-sm text-mint;
  }

  .body-text {
    @apply font-nunito text-base text-foreground;
  }

  .caption {
    @apply font-nunito text-sm text-muted-foreground;
  }
}
```

### 7.2 `tailwind.config.js`

```js
/* eslint-disable @typescript-eslint/no-require-imports */

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        mint: token('mint'),
        forest: token('forest'),
        coral: token('coral'),
        headsup: token('headsup'),
        sunshine: token('sunshine'),
        'logo-soft': token('logo-soft'),
        black: token('black'),
        soft: token('soft'),
        line: token('line'),
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        peach: token('peach'),
        action: {
          DEFAULT: token('action'),
          hover: token('action-hover'),
        },
        banner: token('banner'),
        'catalog-ink': token('catalog-ink'),
        status: {
          green: token('status-green'),
          yellow: token('status-yellow'),
          red: token('status-red'),
        },
        'pastel-red': token('pastel-red'),
        'ink-soft': token('ink-soft'),
        'ink-gray': token('ink-gray'),

        background: token('background'),
        foreground: token('foreground'),
        card: {
          DEFAULT: token('card'),
          foreground: token('card-foreground'),
        },
        popover: {
          DEFAULT: token('popover'),
          foreground: token('popover-foreground'),
        },
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        secondary: {
          DEFAULT: token('secondary'),
          foreground: token('secondary-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        destructive: {
          DEFAULT: token('destructive'),
          foreground: token('destructive-foreground'),
        },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        hero: {
          DEFAULT: token('hero'),
          ink: token('hero-ink'),
          copy: token('hero-copy'),
        },
        feature: token('feature'),
      },
      fontFamily: {
        nunito: ['Nunito-Regular'],
        'nunito-semibold': ['Nunito-SemiBold'],
        'nunito-bold': ['Nunito-Bold'],
        'nunito-extrabold': ['Nunito-ExtraBold'],
      },
    },
  },
  plugins: [],
};
```

### 7.3 `src/theme/colors.ts`

Chỉ dùng cho prop không nhận `className` (6.1).

```ts
export const colors = {
  canvas: '#FFFFFF',
  mint: '#338A85',
  forest: '#1D5B57',
  coral: '#FF7F50',
  headsup: '#FF5400',
  sunshine: '#FFDDAE',
  logoSoft: '#D8F0FA',
  black: '#000000',
  soft: '#F1F7F6',
  line: '#D8E9E8',
  muted: '#346B68',
  peach: '#FFEEE8',
  action: '#FF9973',
  actionHover: '#FFA584',
  banner: '#CAE1DF',
  catalogInk: '#262626',
  statusGreen: '#15803D',
  statusYellow: '#A16207',
  statusRed: '#B91C1C',
  pastelRed: '#D57777',
  inkSoft: '#2E2E2E',
  inkGray: '#6B6B6B',
} as const;

export type ColorToken = keyof typeof colors;
```

### 7.4 Font

- Font chính **Nunito**. Mobile không dùng bản Variable; dùng file tĩnh `Nunito-Regular.ttf`, `Nunito-SemiBold.ttf`,
  `Nunito-Bold.ttf`, `Nunito-ExtraBold.ttf` đặt trong `assets/fonts/` (đã khai báo trong `react-native.config.js`),
  rồi chạy `npx react-native-asset`.
- Đậm/nhạt dùng `font-nunito-bold`... **KHÔNG** dùng `font-bold` với Nunito vì Android không tự chọn file theo weight.
- Font `Inter` chỉ dùng nếu mobile có màn hình admin.

### 7.5 Ghi đè theo vùng

Web dùng class bọc (`.home-content`, `.cart-content`...). Trên mobile dùng `vars()` của NativeWind, đặt ở
`style` của `View` bọc vùng đó:

```ts
// src/theme/regions.ts
import { vars } from 'nativewind';

const BLACK = '0 0 0';
const CATALOG_INK = '38 38 38';

export const regionVars = {
  // Trang chủ: forest và muted thành đen
  home: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Giỏ hàng: các token *-foreground thành đen
  cart: vars({
    '--foreground': BLACK,
    '--card-foreground': BLACK,
    '--popover-foreground': BLACK,
    '--secondary-foreground': BLACK,
    '--accent-foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Chi tiết khoá học: chữ forest/muted/mint thành đen. SVG lấy màu từ colors.ts nên không bị ảnh hưởng.
  courseDetail: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--mint': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Danh sách khoá học: thành catalog-ink. Bộ lọc đặt ngoài View này để giữ màu gốc.
  catalog: vars({
    '--forest': CATALOG_INK,
    '--muted': CATALOG_INK,
    '--mint': CATALOG_INK,
    '--foreground': CATALOG_INK,
    '--muted-foreground': CATALOG_INK,
  }),
} as const;
```

```tsx
<View
  style={regionVars.home}
  className="flex-1 bg-background"
>
  ...
</View>
```

### 7.6 Trạng thái tương tác trên mobile

| Web | Mobile |
| --- | --- |
| Hover (`hover:bg-soft`) | Khi nhấn: `active:bg-soft`, `active:opacity-90` trên `Pressable` + scale (mục 8) |
| Focus outline mint 3px | `TextInput`: `focus:border-mint`, viền 1.5–2px |
| Lỗi input viền headsup | `border-destructive` + dòng lỗi `text-destructive` dưới input |
| Vùng chọn chữ nền mint | `selectionColor={colors.mint}`, `cursorColor={colors.mint}` |
| `.home-content`, `.cart-content`... | `regionVars` (7.5) |

---

## 8. Hình ảnh và animation thay cho card

### 8.1 Hạn chế card

- **KHÔNG** dùng card (khung viền + bóng) làm mặc định cho item danh sách.
- Ưu tiên:
  - **Ảnh bìa tràn**: ảnh 16:9 bo `rounded-2xl`, gradient tối ở đáy, tiêu đề và giá đặt trên gradient.
  - **Carousel ngang** cho danh mục, khoá học nổi bật, lớp sắp khai giảng.
  - **Row phẳng**: thumbnail + text, phân tách bằng khoảng trắng hoặc `border-b border-line` mảnh.
  - **Khối nền màu** (`bg-banner`, `bg-feature`, `bg-logo-soft`, `bg-hero`) cho section, không viền.
- Card chỉ dùng khi cần gom nhóm thông tin không có ảnh: tóm tắt thanh toán, thông tin order, form trong Dialog.
- Empty state và error state dùng **illustration SVG** (`src/assets/illustrations/`), không chỉ có chữ.
- Ảnh chưa có (`imgUrl: null`) dùng ảnh placeholder theo danh mục, không để khung trống.

### 8.2 Ảnh

- Ảnh mạng dùng `FastImage` (cache, priority). Ảnh local dùng `require` hoặc SVG component.
- Luôn đặt kích thước hoặc `aspect-video` / `aspect-square` để không giật layout khi ảnh tải xong.
- Có placeholder (`bg-soft`) và hiệu ứng fade-in khi ảnh tải xong.
- Gradient overlay vẽ bằng `react-native-svg` (`LinearGradient`), màu lấy từ `colors.ts`.
- Ảnh có nội dung phải có `accessibilityLabel`. Ảnh trang trí đặt `accessible={false}`.

### 8.3 Animation (Reanimated 3)

| Loại | Cách làm | Thời lượng |
| --- | --- | --- |
| Phản hồi chạm | Scale 1 → 0.97 trên `Pressable` (`PressableScale`) | 120–150ms |
| Item xuất hiện | `FadeInDown` lệch theo index, **chỉ 8 item đầu** | 200–300ms, delay 40ms/item |
| Ảnh tải xong | Opacity 0 → 1 | 200ms |
| Loading | `Skeleton` của nativecn đúng layout thật, không dùng spinner toàn màn hình | — |
| Đổi màn hình | Transition mặc định của React Navigation | — |
| Bottom sheet | `@gorhom/bottom-sheet` | — |

Quy tắc:

- Chỉ animate `transform` và `opacity`. Không animate `width`, `height`, `top`, `left`.
- Chạy trên UI thread (worklet). Gọi JS từ worklet qua `runOnJS`.
- Tôn trọng **Reduce Motion**: `useReducedMotion()` trả `true` thì tắt entering animation và vòng lặp.
- Thời lượng và easing lấy từ `src/theme/motion.ts`, không hard-code số trong component.
- Không thêm Lottie hoặc thư viện animation khác khi chưa thống nhất.

```ts
// src/theme/motion.ts
import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: { fast: 150, base: 250, slow: 350 },
  easing: Easing.out(Easing.cubic),
  pressScale: 0.97,
  staggerMs: 40,
  staggerLimit: 8,
} as const;
```

```tsx
// src/components/common/PressableScale/PressableScale.tsx
import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme/motion';

type PressableScaleProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  className?: string;
};

export const PressableScale = memo(function PressableScale({
  children,
  className,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animateTo = useCallback(
    (value: number) => {
      if (reducedMotion) return;
      scale.value = withTiming(value, {
        duration: motion.duration.fast,
        easing: motion.easing,
      });
    },
    [reducedMotion, scale]
  );

  const handlePressIn = useCallback(() => animateTo(motion.pressScale), [animateTo]);
  const handlePressOut = useCallback(() => animateTo(1), [animateTo]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={className}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});
```

---

## 9. UX

### 9.1 Trạng thái màn hình

Mọi màn hình có dữ liệu từ API **PHẢI** có đủ 4 trạng thái (component chung `ScreenState`):

| Trạng thái | Hiển thị |
| --- | --- |
| Loading lần đầu | Skeleton đúng bố cục thật |
| Empty | Illustration + câu giải thích + CTA (ví dụ "Xem khoá học") |
| Error | Thông điệp theo `code` (i18n `errors.<CODE>`, fallback `errors.generic`) + nút "Thử lại" + `requestId` chữ nhỏ để báo hỗ trợ |
| Success | Nội dung. Refetch nền không hiện skeleton lại |

### 9.2 Tương tác

- Vùng chạm tối thiểu **44×44**. Icon nhỏ dùng `hitSlop`.
- CTA chính đặt ở vùng ngón cái (đáy màn hình), dạng sticky cho giỏ hàng, checkout, thêm vào giỏ.
- Nút mutation: khi `isPending` thì hiện loading và khoá bấm. Không cho gửi hai lần.
- Hành động khó hoàn tác (xoá khỏi giỏ, chốt điểm danh, đăng xuất mọi thiết bị) phải hỏi xác nhận bằng `Dialog`.
- Danh sách có pull-to-refresh. Danh sách phân trang tải tiếp khi gần cuối, có loader ở footer.
- Quay lại màn trước giữ vị trí cuộn và filter.
- Đăng xuất hoặc hết phiên: reset navigation stack về Login, không để quay lại màn cũ bằng nút back.

### 9.3 Form

- Validate bằng zod khi blur và khi submit. Lỗi hiện ngay dưới field.
- 422 từ server: map `details` vào field tương ứng nếu nhận ra được, còn lại hiện ở đầu form.
- Bàn phím: `KeyboardAvoidingView`, `returnKeyType="next"` chuyển field, field cuối submit.
- Email/password đặt `autoComplete`, `textContentType`, `keyboardType` đúng để dùng autofill. Password có nút hiện/ẩn.
- Không xoá dữ liệu đã nhập khi submit lỗi.

### 9.4 Phản hồi

- Thành công ngắn (thêm vào giỏ, đã lưu): toast 2–3 giây.
- Lỗi gắn với form: hiện trong form, không dùng toast.
- Mất mạng: banner cố định trên đầu (theo `useNetInfo`). Query tạm dừng, mutation báo lỗi rõ ràng.
- Không hiện thông báo kỹ thuật thô (stack trace, `message` tiếng Anh từ server).

### 9.5 Định dạng và ngôn ngữ

- Mọi text qua `t(...)`. Ngôn ngữ mặc định **tiếng Việt**.
- Tiền: `priceAmount` là số nguyên VND, hiển thị bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Ngày giờ: hiển thị theo field `timeZone` của response (hiện là `Asia/Ho_Chi_Minh`), không theo múi giờ máy.
- Ngày thuần (`YYYY-MM-DD`) không chuyển qua `Date` để tránh lệch ngày.

### 9.6 Accessibility

- Mọi phần tử bấm được có `accessibilityRole` và `accessibilityLabel` (qua `t(...)`).
- Không tắt `allowFontScaling`. Kiểm tra bố cục với cỡ chữ hệ thống lớn.
- Không truyền thông tin chỉ bằng màu: trạng thái (PAID, EXPIRED...) luôn có chữ hoặc icon kèm theo.
- Bọc màn hình bằng safe area (`react-native-safe-area-context`).

---

## 10. Performance

- **Dùng `React.memo()` cho component tốn kém**: item của list, component có ảnh/animation, component nhận props
  ổn định nhưng cha re-render thường xuyên. Không memo component nhỏ, rẻ.
- **Dùng `useMemo()` và `useCallback()` cho tính toán nặng**: lọc/sắp xếp/nhóm danh sách (lịch học theo ngày),
  callback truyền vào component đã memo hoặc vào `renderItem`. Dependency phải đầy đủ.
- **Tối ưu `FlatList` bằng `getItemLayout` và `keyExtractor`**:
  - `keyExtractor` trả `id` từ API. **KHÔNG** dùng index làm key.
  - Item cao cố định → khai báo `getItemLayout`.
  - `renderItem`, `keyExtractor`, `getItemLayout` khai báo ngoài component hoặc bọc `useCallback`.
  - Danh sách dài hoặc item cao không đều → dùng `FlashList` với `estimatedItemSize`.
  - Không lồng `FlatList` dọc trong `ScrollView` dọc.
- **Dùng `InteractionManager` cho tác vụ nặng**: xử lý dữ liệu lớn (dựng lưới lịch, parse nội dung material dài)
  chạy sau khi animation chuyển màn hình xong. Huỷ task khi unmount.
- Zustand: luôn lấy state qua selector (`useStore((s) => s.auth.user)`), không lấy cả store.
- TanStack Query: dùng `select` để component chỉ re-render khi phần nó cần thay đổi.
- Ảnh: tải đúng kích thước hiển thị, dùng cache của FastImage.
- Kiểm tra bằng Perf Monitor trong Dev Menu (FPS UI/JS) trước khi tối ưu thêm.

```tsx
const ITEM_HEIGHT = 88;

const keyExtractor = (item: ClassSummary): string => item.id;

const getItemLayout = (
  _data: ArrayLike<ClassSummary> | null | undefined,
  index: number
) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index });

export function ClassList({ classes, onOpen }: ClassListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ClassSummary>) => (
      <ClassRow
        item={item}
        onPress={onOpen}
      />
    ),
    [onOpen]
  );

  return (
    <FlatList
      data={classes}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
    />
  );
}

const ClassRow = memo(function ClassRow({ item, onPress }: ClassRowProps) {
  // ...
});
```

```ts
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    setScheduleGrid(buildScheduleGrid(sessions, timeZone));
  });
  return () => task.cancel();
}, [sessions, timeZone]);
```

---

## 11. Logging

- Dùng `logger`. **KHÔNG** gọi `console.*` trực tiếp ở nơi khác.
- `logger.ts` là file **duy nhất** được `eslint-disable no-console`.
- `debug`, `info` chỉ in khi `__DEV__`. `warn`, `error` luôn in. `error` ở production gửi qua reporter
  (gắn Crashlytics/Sentry sau bằng `setErrorReporter`).
- Che dữ liệu nhạy cảm: `password`, `token`, `cookie`, `set-cookie`, `authorization`.
- Không log PII (email, số điện thoại) ngoài dev.
- Log lỗi API kèm `code` và `requestId`.
- File này thay cho `logger` trong `src/ignoreWarnings.ts`. Khi chuyển, sửa import trong `http.config.ts`.

```ts
// src/shared/utilities/logger.ts
/* eslint-disable no-console -- logger là nơi duy nhất được gọi console */

type LogPrimitive = string | number | boolean | null | undefined;

export type LogValue =
  | LogPrimitive
  | Error
  | readonly LogValue[]
  | { readonly [key: string]: LogValue };

type LogRecord = { readonly [key: string]: LogValue };

type ErrorReporter = (
  message: string,
  error?: Error,
  context?: LogValue
) => void;

const SENSITIVE_KEYS: readonly string[] = [
  'password',
  'token',
  'cookie',
  'set-cookie',
  'authorization',
];

let reportError: ErrorReporter | null = null;

export const setErrorReporter = (reporter: ErrorReporter): void => {
  reportError = reporter;
};

const isLogArray = (
  value: readonly LogValue[] | LogRecord
): value is readonly LogValue[] => Array.isArray(value);

const redact = (value: LogValue): LogValue => {
  if (value === null || typeof value !== 'object' || value instanceof Error) {
    return value;
  }
  if (isLogArray(value)) {
    return value.map(redact);
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]): [string, LogValue] => [
      key,
      SENSITIVE_KEYS.includes(key.toLowerCase()) ? '[REDACTED]' : redact(item),
    ])
  );
};

export const logger = {
  debug: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.log('🐛 DEBUG:', message, ...args.map(redact));
    }
  },

  info: (message: string, ...args: LogValue[]): void => {
    if (__DEV__) {
      console.info('ℹ️ INFO:', message, ...args.map(redact));
    }
  },

  warn: (message: string, ...args: LogValue[]): void => {
    console.warn('⚠️ WARN:', message, ...args.map(redact));
  },

  error: (message: string, error?: Error, context?: LogValue): void => {
    console.error(
      '❌ ERROR:',
      message,
      error,
      context === undefined ? '' : redact(context)
    );
    if (!__DEV__) {
      reportError?.(message, error, context);
    }
  },
};
```

---

## 12. Testing (TDD)

### 12.1 Nguyên tắc

- Luôn viết **unit test** và **test:e2e**. Unit test theo **TDD**: Red → Green → Refactor (mục 3.3).
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

### 12.2 Component testing

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

### 12.3 API testing

Mock server đặt ở `tests/mocks/` (không đặt trong `__tests__/`, xem 2.1).

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

### 12.4 Hook và controller

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

### 12.5 E2E (Maestro)

- Mỗi màn hình mới có ít nhất một flow cho luồng chính. Luồng tiền (giỏ hàng, checkout) có thêm flow cho lỗi
  thường gặp (`CLASS_FULL`, `CART_LIMIT_EXCEEDED`).
- Chọn phần tử bằng `testID` (kebab-case, 2.3), không bằng text vì text đổi theo ngôn ngữ.
- Flow chạy với backend môi trường dev/staging và tài khoản test riêng, không chạy với production.

```yaml
# e2e/flows/login-student.yaml
appId: com.mindymobile
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

### 12.6 Test bắt buộc khác

- `src/theme/colors.test.ts`: đọc `global.css`, so từng biến brand/dẫn xuất với `colors.ts`. Lệch là fail.
- `src/shared/utilities/logger.test.ts`: dữ liệu nhạy cảm bị che, `debug` không in khi `__DEV__ = false`.
- Interceptor: 401 → refresh đúng một lần cho nhiều request song song; refresh lỗi → clear cache.

---

## 13. Lint, ESLint, TypeScript

Trước khi báo xong việc hoặc tạo PR, **PHẢI** chạy và không có lỗi:

```bash
npm run lint:rules
npm run lint:code-format
npm run lint:type-check
npm test
```

Rule đang bật (xem `.eslintrc.js`): cấm inline style, màu literal, text thô trong JSX, `console` ngoài
`warn`/`error`, `any`; dùng single quote, LF, trailing comma.

Bổ sung vào `.eslintrc.js` để chặn `unknown`:

```js
'no-restricted-syntax': [
  'error',
  {
    selector: 'TSUnknownKeyword',
    message: 'Không dùng unknown. Khai báo type cụ thể hoặc parse bằng zod.',
  },
],
'@typescript-eslint/ban-ts-comment': 'error',
'@typescript-eslint/no-non-null-assertion': 'error',
```

Code template hiện có dùng `unknown` (`http.config.ts`, `ignoreWarnings.ts`). Sửa khi động vào file đó; không thêm
chỗ mới.

Prettier: cài thêm `prettier-plugin-tailwindcss` để tự sắp xếp class trong `className`.

---

## 14. Nghiệp vụ theo API contract

Tóm tắt rule ảnh hưởng tới mobile. Chi tiết và mã lỗi đầy đủ xem `docs/API_CONTRACT/API_CONTRACT_FE.md`.

### 14.1 Chung

- Chỉ gọi API có nhãn **IMPL**. API **PLANNED** (contract §0, §22) chưa có route: không làm UI gọi tới. Gồm: sửa
  hồ sơ, đổi/quên mật khẩu, tiến độ học, huỷ order/hoàn tiền, Student xem điểm danh, đổi lịch/học bù, xin nghỉ.
- Không gửi `role`, `status`, `studentId`/`mentorId` của chính mình. Server lấy người dùng từ cookie.
- Body không được có field lạ (backend trả 422). Optional rỗng thì bỏ field, không gửi chuỗi rỗng.
- Timestamp gửi lên phải có offset (`Z` hoặc `+07:00`). Query string có `+07:00` phải encode qua `URLSearchParams`.
- Dùng `asOf` của server để quyết định quyền/thời hạn, không dùng đồng hồ máy.
- Ẩn tính năng theo `user.role`, nhưng server vẫn là nơi quyết định. 403 `INSUFFICIENT_ROLE` → ẩn tính năng, không retry.

### 14.2 Auth

- Khởi động app: gọi `GET auth/me`. 200 → vào app theo `role`; 401 → màn Login.
- Đăng ký: luôn hiện "Kiểm tra email", kể cả khi email đã tồn tại (response giống nhau). Password 6–128 ký tự.
- `INVALID_CREDENTIALS` là lỗi chung, không nói sai email hay sai mật khẩu.
- Đăng xuất: gọi `auth/logout`, sau đó `queryClient.clear()`, huỷ polling, xoá signed URL trong bộ nhớ, reset store.
- Google OIDC và link xác thực email đi qua redirect trình duyệt. Trên mobile cần deep link và cách chuyển cookie
  về app; contract chưa mô tả cho mobile → **chưa làm** cho tới khi thống nhất với backend.

### 14.3 Catalog, giỏ hàng, thanh toán (Student)

- Catalog chỉ trả khoá học active và lớp `OPEN`. Hiện `availableSeats`; hết chỗ thì khoá nút thêm vào giỏ.
- `courseUnitId` (thuộc khoá học) khác `classUnitId` (thuộc lớp). Không ghép theo title/position.
- Giỏ tối đa **20 lớp**. Xử lý riêng: `CART_ITEM_ALREADY_EXISTS`, `CART_LIMIT_EXCEEDED`, `CLASS_FULL`,
  `CLASS_ALREADY_ENROLLED`, `CLASS_NOT_OPEN`, `CART_EMPTY`.
- Chờ xác nhận PayOS: poll `GET me/orders/:orderId` có backoff và giới hạn số lần; dừng khi `PAID`, `EXPIRED`,
  `CANCELLED`, `REQUIRES_REVIEW`, 401, 403. Luồng mở trang PayOS và quay lại app cần deep link → thống nhất với
  backend trước khi làm.
- Sau checkout / PAID / xác nhận tiền mặt: refetch `me/classes`, `me/schedule`, chi tiết/preview lớp.

### 14.4 Lớp của tôi, lịch, tài liệu (Student)

- UI chi tiết lớp theo `accessMode`: `FULL` → chi tiết đầy đủ; `CASH_PREVIEW` → màn preview; `NONE` → giải thích
  theo `accessReason`.
- Lịch hiển thị theo `timeZone` của response.
- Signed URL của tài liệu chỉ giữ trong bộ nhớ, không lưu MMKV, không cache chéo user. Hết hạn thì xin lại.
- `POST .../files/:fileId/access` cần header `Origin` (5.2).

### 14.5 Mentor

- Điểm danh: mọi mutation gửi `Idempotency-Key` và `expectedVersion` lấy từ GET mới nhất.
  409 `SESSION_VERSION_CONFLICT` → refetch và cho mentor xem lại trước khi gửi lại.
- Poll roster mỗi **30 giây** khi màn hình đang focus và buổi học `IN_PROGRESS`; dừng khi `COMPLETED`, `CANCELLED`,
  401, 403 hoặc rời màn hình.
- Xác nhận thu tiền mặt: hỏi xác nhận trước khi gửi; xử lý `CASH_ORDER_CLOSED`, `CASH_CONFIRMATION_INVALID`.
- Mutation materials và release chương cần header `Origin`.

---

## 15. Việc cần làm để áp dụng file này

Các mục sau chưa có trong repo. Làm theo thứ tự, mỗi bước chạy lại lint/test.

1. **NativeWind + nativecn**
   - `npm i nativewind class-variance-authority clsx tailwind-merge`
   - `npm i -D tailwindcss@^3.4 prettier-plugin-tailwindcss`
   - Tạo `global.css`, `tailwind.config.js` (mục 7), `nativewind-env.d.ts` chứa
     `/// <reference types="nativewind/types" />` và thêm file này vào `include` của `tsconfig.json`.
   - `babel.config.js`: `presets: ['module:@react-native/babel-preset', 'nativewind/babel']`.
     Giữ `react-native-reanimated/plugin` ở cuối danh sách plugin.
   - `metro.config.js`: bọc config bằng `withNativeWind(config, { input: './global.css' })` từ `nativewind/metro`,
     giữ cấu hình SVG transformer.
   - Import `./global.css` trong `index.js`.
   - `jest.config.js`: thêm `nativewind|react-native-css-interop` vào `transformIgnorePatterns`.
2. **Font**: thêm Nunito TTF vào `assets/fonts/`, chạy `npx react-native-asset`, build lại native.
3. **Theme**: tạo `src/theme/colors.ts`, `regions.ts`, `motion.ts`, `src/shared/utilities/cn.ts`.
4. **HTTP**: bỏ Bearer + MMKV token trong interceptor, chuẩn hoá lỗi thành `ApiError`, thêm refresh single-flight,
   thêm biến env `APP_ORIGIN` (đọc qua `src/config/env.ts`) và nhờ backend thêm giá trị này vào `CORS_ORIGINS`.
5. **Idempotency-Key**: cài `uuid` + `react-native-get-random-values` để sinh UUID v4 (Hermes không có `crypto.randomUUID`).
6. **Logger**: tạo `src/shared/utilities/logger.ts`, thay import `logger` từ `@/ignoreWarnings`.
7. **QueryClient**: cập nhật theo 5.6.
8. **ESLint**: thêm rule ở mục 13.
9. **Test**: `npm i -D msw`; tạo `tests/mocks/`, `tests/utils/`; đổi `API_URL` mock trong `jest.setup.js` thành
   `http://localhost:3000/api/v1`.
10. **E2E**: cài Maestro CLI, tạo `e2e/flows/`, thêm script `"test:e2e": "maestro test e2e/flows"`.
11. **i18n**: thêm `src/translations/vi-VN.json` làm mặc định; `bn-BN.json` là của template, xoá khi dọn.
12. **CLAUDE.md**: cập nhật phần "UI kit" (rn-kit → NativeWind + nativecn) cho khớp file này.
