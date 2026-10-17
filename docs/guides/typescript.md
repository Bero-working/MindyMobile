# TypeScript, định nghĩa type và đặt tên

Quy tắc TypeScript, cách khai báo type theo API contract và quy tắc đặt tên file, `testID`, translation key. Đọc khi
viết type, DTO hoặc tạo file mới. Lý do cấm `any` / `unknown`: [ADR-0009](../adr/ADR-0009-no-any-unknown-zod.md).

## Đặt tên

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

## Quy tắc

- **KHÔNG ĐƯỢC** dùng `any`, `unknown` để khai báo type, kể cả trong generic (`Record<string, unknown>`), tham số
  hàm, `as unknown as T`. ESLint chặn bằng `@typescript-eslint/no-explicit-any` và rule `TSUnknownKeyword`
  ([linting.md](linting.md)).
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

## Ví dụ định nghĩa

Các file dưới đây chưa có trong repo; tạo theo mẫu khi làm feature đầu tiên cần tới. Enum đầy đủ ở
[API contract §3](../API_CONTRACT/README.md#3-enum-dùng-chung).

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
