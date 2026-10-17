# ADR-0013: Hoãn Google OIDC và deep link PayOS cho tới khi thống nhất với backend

- Status: Proposed
- Date: 2026-10-16
- Author: @Bero
- Approved by: (chờ owner)

## Context
Google OIDC, link xác thực email và trang thanh toán PayOS đều đi qua redirect trình duyệt rồi quay về
`FRONTEND_BASE_URL` của web (xem [auth.md §6.8](../API_CONTRACT/auth.md#68-google-oidc) và
[orders-payment.md §11.8](../API_CONTRACT/orders-payment.md)). Trên mobile cần deep link để quay lại app và cách đưa
cookie từ trình duyệt về networking native. Contract chưa mô tả cho mobile.

## Decision
Chưa làm Google OIDC, xác thực email qua link và luồng mở trang PayOS rồi quay lại app, cho tới khi thống nhất với
backend về deep link và cách chuyển cookie. Phase dùng các luồng này đặt `Blocked`.

## Alternatives
- Tự làm WebView đăng nhập và đọc cookie: phụ thuộc chi tiết cookie của backend, dễ vỡ khi backend đổi.
- Mở trình duyệt ngoài rồi poll order: vẫn cần deep link để đưa người dùng về đúng màn hình.

## Consequences
+ Không làm phần dễ phải làm lại.
- v1 chỉ đăng nhập bằng email/password. Thanh toán PayOS trên mobile chờ backend.
