# ADR-0005: Bản v1 chỉ có light mode

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
[GLOBAL_CSS.md](../CORE/GLOBAL_CSS.md) chỉ có bảng màu sáng. Chưa có bảng màu tối được thống nhất với web.

## Decision
App v1 chỉ có light mode. Không làm dark mode cho tới khi có bảng màu tối và ADR mới.

## Alternatives
- Tự pha bảng màu tối trên mobile: lệch với web, chưa được duyệt thiết kế.

## Consequences
+ Ít token, ít case cần test.
- `ThemeProvider` của rn-kit hiện vẫn lưu lựa chọn theme; cần cố định light khi chuyển sang NativeWind.
