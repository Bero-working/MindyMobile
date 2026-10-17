# ADR-0006: Tiếng Việt là ngôn ngữ mặc định

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Người dùng Mindy Center là người Việt. Template có `en-EN.json` và `bn-BN.json`, chưa có tiếng Việt.

## Decision
- Thêm `src/translations/vi-VN.json` và đặt làm ngôn ngữ mặc định.
- Mọi text hiển thị đi qua `t(...)`, có key cho tất cả ngôn ngữ đang hỗ trợ.
- `bn-BN.json` là của template, xoá khi dọn.

## Alternatives
- Hard-code tiếng Việt: không đổi được ngôn ngữ, vi phạm rule `no-raw-text`.

## Consequences
+ Đúng ngôn ngữ người dùng.
- Mỗi text mới cần thêm key ở mọi file ngôn ngữ. E2E phải chọn phần tử bằng `testID` vì text đổi theo ngôn ngữ.
