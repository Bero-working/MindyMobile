# 0.8 ESLint

## Mô tả
Bổ sung rule ESLint chặn `unknown`, `@ts-ignore` / `@ts-expect-error`, non-null assertion.

## Hạ tầng / ADR
- File khoá bị sửa: `.eslintrc.js`.
- ADR: [ADR-0009](../../adr/ADR-0009-no-any-unknown-zod.md).
- Nội dung: [guides/linting.md](../../guides/linting.md#rule-cần-bổ-sung-phase-08).

## Task
### 0.8.1 Thêm rule
- Kết quả mong đợi: `no-restricted-syntax` với `TSUnknownKeyword`, `@typescript-eslint/ban-ts-comment`,
  `@typescript-eslint/no-non-null-assertion` ở mức `error`.
- Test cần viết trước: một file tạm dùng `unknown` làm `npm run lint:rules` fail (xoá file tạm sau khi xác nhận).

### 0.8.2 Xử lý chỗ vi phạm còn lại
- Kết quả mong đợi: `npm run lint:rules` xanh. Chỗ dùng `unknown` của template (`http.config.ts`, `ignoreWarnings.ts`)
  đã được sửa ở 0.4 / 0.6; chỗ còn lại ghi vào entry PROGRESS để owner quyết định.
- Test cần viết trước: không áp dụng.

## Tiêu chí nghiệm thu
- [ ] Rule mới bật, `npm run lint:rules` xanh trên toàn repo.
