# ADR-0012: Đặt tên thư mục theo repo thay vì docs của boilerplate

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Tài liệu boilerplate (https://sohantalukder.github.io/react-native-boilerplate/docs/project-structure/) và repo
thực tế đặt tên thư mục khác nhau: `src/store/` ↔ `src/state/`, `src/utils/` ↔ `src/shared/utilities/`,
`src/hooks/` ↔ `src/shared/hooks/`, `App.tsx` ↔ `src/index.tsx`.

## Decision
Theo tên trong repo. Tài liệu boilerplate chỉ để tham khảo cách làm, không dùng để đặt đường dẫn. Bảng đối chiếu
nằm trong [ARCHITECTURE.md](../ARCHITECTURE.md#đối-chiếu-tên-với-boilerplate).

## Alternatives
- Đổi tên thư mục theo docs boilerplate: phải sửa import và alias hàng loạt, không có lợi ích.

## Consequences
+ Không phải di chuyển code.
- Khi đọc docs boilerplate phải tự đổi đường dẫn theo bảng đối chiếu.
