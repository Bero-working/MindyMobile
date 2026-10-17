# Architecture Decision Records

Danh sách quyết định kiến trúc của MindyMobile. Đọc khi cần biết vì sao repo chọn một công nghệ hoặc quy tắc. Muốn
thêm thư viện hay sửa file hạ tầng thì phải viết ADR trước (xem [quy trình B.8](../README.md#b8-hạ-tầng-và-công-nghệ-mới)).

## Cách viết ADR mới

1. Copy [template.md](template.md) thành `ADR-<NNNN>-<kebab-slug>.md`, số tiếp theo trong bảng dưới, 4 chữ số.
2. Đặt `Status: Proposed`, thêm một dòng vào bảng dưới.
3. Owner (@Bero) duyệt thì đổi sang `Accepted` và ghi `Approved by`.
4. ADR thay thế ADR cũ: ADR cũ đổi thành `Superseded by ADR-NNNN`, không xoá nội dung cũ.

## Danh sách

| Số | Tiêu đề | Trạng thái | Ngày |
| --- | --- | --- | --- |
| [ADR-0001](ADR-0001-rn-cli-no-expo.md) | Dùng RN CLI, không dùng Expo | Accepted | 2026-10-16 |
| [ADR-0002](ADR-0002-cookie-auth.md) | Xác thực bằng cookie HttpOnly, bỏ Bearer và token trong MMKV | Accepted | 2026-10-16 |
| [ADR-0003](ADR-0003-tanstack-query-zustand.md) | TanStack Query cho server state, Zustand cho client state | Accepted | 2026-10-16 |
| [ADR-0004](ADR-0004-nativewind-nativecn.md) | Chuyển UI từ rn-kit sang NativeWind + nativecn | Accepted | 2026-10-16 |
| [ADR-0005](ADR-0005-light-mode-only.md) | Bản v1 chỉ có light mode | Accepted | 2026-10-16 |
| [ADR-0006](ADR-0006-vietnamese-default.md) | Tiếng Việt là ngôn ngữ mặc định | Accepted | 2026-10-16 |
| [ADR-0007](ADR-0007-maestro-msw.md) | E2E bằng Maestro, mock API trong unit test bằng MSW | Accepted | 2026-10-16 |
| [ADR-0008](ADR-0008-tdd.md) | Bắt buộc TDD | Accepted | 2026-10-16 |
| [ADR-0009](ADR-0009-no-any-unknown-zod.md) | Cấm `any`, `unknown`, dữ liệu ngoài parse bằng zod | Accepted | 2026-10-16 |
| [ADR-0010](ADR-0010-images-over-cards.md) | Hạn chế card, ưu tiên ảnh và animation | Accepted | 2026-10-16 |
| [ADR-0011](ADR-0011-no-optimistic-update.md) | Không optimistic update cho thanh toán, giỏ hàng, điểm danh | Accepted | 2026-10-16 |
| [ADR-0012](ADR-0012-repo-folder-naming.md) | Đặt tên thư mục theo repo thay vì docs của boilerplate | Accepted | 2026-10-16 |
| [ADR-0013](ADR-0013-defer-google-oidc-payos-deeplink.md) | Hoãn Google OIDC và deep link PayOS cho tới khi thống nhất với backend | Proposed | 2026-10-16 |
| [ADR-0014](ADR-0014-docs-workflow.md) | Quy trình docs: IMPLEMENT / PROGRESS, khoá hạ tầng, ADR trước khi thêm công nghệ | Accepted | 2026-10-16 |
| [ADR-0015](ADR-0015-idempotency-key-uuid.md) | UUID v4 cho Idempotency-Key trên Hermes | Accepted | 2026-10-17 |
| [ADR-0016](ADR-0016-react-native-cli-compatibility.md) | Đồng bộ CLI với React Native 0.80 | Accepted | 2026-10-17 |
