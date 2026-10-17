# Lint, ESLint, TypeScript

Lệnh kiểm tra bắt buộc trước khi báo xong việc, rule ESLint đang bật và rule cần bổ sung. Đọc trước khi tạo PR.

## Lệnh bắt buộc

Trước khi báo xong việc hoặc tạo PR, **PHẢI** chạy và không có lỗi:

```bash
npm run lint:rules
npm run lint:code-format
npm run lint:type-check
npm test
```

Phase màn hình còn phải chạy `npm run test:e2e` ở bước Kiểm tra ([B.5](../README.md#b5-vòng-đời-một-phase)).

## Rule đang bật

Xem `.eslintrc.js`: cấm inline style, màu literal, text thô trong JSX, `console` ngoài `warn`/`error`, `any`; dùng
single quote, LF, trailing comma.

## Rule đã bổ sung (Phase 0.8)

Bổ sung vào `.eslintrc.js` để chặn `unknown` ([ADR-0009](../adr/ADR-0009-no-any-unknown-zod.md)):

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

Các chỗ `unknown` và non-null assertion của template đã được chuyển sang type cụ thể/generic và guard.
Code app dùng logger, không gọi console trực tiếp. Thư mục coverage được bỏ qua trong lint.

Prettier: cài thêm `prettier-plugin-tailwindcss` để tự sắp xếp class trong `className` (Phase 0.1,
[ADR-0004](../adr/ADR-0004-nativewind-nativecn.md)).
