# ADR-0009: Cấm `any`, `unknown`, dữ liệu ngoài parse bằng zod

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
tsconfig đã bật strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`. `any` / `unknown` / ép kiểu làm mất
các kiểm tra này. Dữ liệu từ ngoài (JSON, route params từ deep link, MMKV) không đảm bảo đúng kiểu. `zod` đã có trong
`package.json`.

## Decision
- Không dùng `any`, `unknown` để khai báo type (kể cả `Record<string, unknown>`, `as unknown as T`), không dùng
  `@ts-ignore`, `@ts-expect-error`, non-null assertion `!`. ESLint chặn bằng rule ở
  [guides/linting.md](../guides/linting.md).
- Dữ liệu chưa rõ kiểu đi qua zod `safeParse` trước khi dùng.

## Alternatives
- Cho phép `unknown` rồi tự thu hẹp: dễ dẫn tới ép kiểu, khó review.

## Consequences
+ Lỗi kiểu bị bắt lúc build, dữ liệu ngoài được kiểm tra lúc chạy.
- Code template hiện có dùng `unknown` (`http.config.ts`, `ignoreWarnings.ts`), phải sửa khi động vào.
