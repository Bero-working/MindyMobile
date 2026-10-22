# ADR-0024: Đăng ký route Khoá học và Thanh toán cho Phase 2

- Status: Accepted
- Date: 2026-10-17
- Created at: 2026-10-17T23:00:00+07:00
- Author: @Bero
- Approved by: @Bero (chat 2026-10-17, Phase 2 Q5)

## Context
[Phase 2](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/README.md) thêm màn Khoá học (tab) và màn Thanh toán QR. Theo kiến
trúc, thêm màn phải sửa `<Stack.Screen>` trong `src/navigation/index.tsx`, file nằm trong danh sách hạ tầng bị khoá.
Quyền sửa của ADR-0018/ADR-0022 chỉ áp dụng cho Phase 1.

## Decision
Cho phép Phase 2 sửa `src/navigation/index.tsx` để đăng ký `COURSES` và `PAYMENT` (params `{ orderId }`) trong nhánh
phiên STUDENT hiện có, kèm test điều hướng. Không đổi provider, screenOptions chung, bootstrap/guard phiên hoặc
cấu hình khác. `ARCHITECTURE.md` cập nhật mục ngoại lệ trong cùng PR.

## Alternatives
- Dùng tab navigator thật (`@react-navigation/bottom-tabs`): thêm thư viện, đổi cấu trúc Phase 1; chưa cần.
- Hiển thị Khoá học/Thanh toán bằng modal trong Home: không đúng điều hướng tab của thiết kế, Back khó kiểm soát.

## Consequences
+ Luồng Khoá học → Giỏ → QR chạy trong navigator hiện có, ít thay đổi.
- Mỗi phase thêm màn vẫn cần một ADR mở khoá; nên cân nhắc ADR chung cho việc đăng ký route ở các phase sau.
