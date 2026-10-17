# Gọi API: Axios + TanStack Query

Cách viết Http client, service, hook query/mutation, cấu hình QueryClient và polling. Đọc khi làm bất kỳ phần nào gọi
API. Route, body và mã lỗi lấy từ [API_CONTRACT/](../API_CONTRACT/README.md). Quyết định liên quan:
[ADR-0002](../adr/ADR-0002-cookie-auth.md) (cookie), [ADR-0003](../adr/ADR-0003-tanstack-query-zustand.md)
(TanStack Query + Zustand), [ADR-0011](../adr/ADR-0011-no-optimistic-update.md) (không optimistic update).

## Tầng gọi

```
Screen  →  use<Feature>Controller  →  use<Feature>Query / Mutation  →  <feature>.service  →  apiInstances.service (Http/Axios)
```

- Component **KHÔNG ĐƯỢC** gọi service hoặc Axios trực tiếp.
- Service chỉ gọi HTTP và trả DTO. Không chứa toast, i18n, điều hướng.
- Hook query/mutation chỉ bọc TanStack Query. Logic màn hình nằm ở controller.
- `Http` trả thẳng `response.data`. Response của backend là DTO trực tiếp, **không** có wrapper `{ data }`.

## Http client

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
- Mutation cần header `Origin` (materials, release unit, file access, xem
  [contract §1.3](../API_CONTRACT/README.md#13-header-origin-bắt-buộc-cho-một-số-mutation)) phải set header từ
  `env.APP_ORIGIN`. Giá trị này phải nằm trong `CORS_ORIGINS` của backend (cần BE xác nhận, Phase 0.4).
- Teaching / Attendance: gửi `Idempotency-Key` (UUID v4). Một key cho một ý định; retry vì lỗi mạng giữ nguyên key
  và body; đổi body thì sinh key mới.
- Log request trong dev phải che `password`, `cookie`, `set-cookie`, `authorization` (dùng `logger`,
  [logging.md](logging.md)).

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

## Service

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

## Query

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

## Mutation

- Sau mutation thành công, invalidate đúng các key theo bảng "Refetch sau mutation" trong
  [contract §21](../API_CONTRACT/README.md#21-polling-cache-refetch).
- Không làm optimistic update cho thanh toán, điểm danh, giỏ hàng. Rule:
  [BUSINESS_RULES.md §6](../BUSINESS_RULES.md#6-không-optimistic-update-cho-dữ-liệu-do-server-quyết-định).
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

## QueryClient cho React Native

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

## Polling

Polling (upload file, chờ PayOS, roster điểm danh) làm đúng tần suất và điều kiện dừng trong
[contract §21](../API_CONTRACT/README.md#21-polling-cache-refetch), dùng `refetchInterval` trả `false` khi đạt điều kiện
dừng. Catalog, lịch, material review **không** poll.
