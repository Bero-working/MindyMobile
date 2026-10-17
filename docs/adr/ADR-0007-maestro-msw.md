# ADR-0007: E2E bằng Maestro, mock API trong unit test bằng MSW

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Repo có Jest + `@testing-library/react-native`, chưa có công cụ mock API và chưa có E2E. Test service/hook cần chặn
request của Axios mà không gọi mạng thật. Luồng chính (đăng nhập, giỏ hàng, checkout) cần kiểm tra trên app thật.

## Decision
- Mock API trong unit/component test bằng **MSW** (`msw/node`). Handler đặt ở `tests/mocks/handlers/`.
- E2E bằng **Maestro**, flow YAML trong `e2e/flows/`, script `npm run test:e2e`. Flow dùng chung cho iOS và Android.

## Alternatives
- Mock Axios bằng `jest.mock`: test gắn với chi tiết cài đặt, không kiểm tra interceptor.
- Detox: cấu hình build native phức tạp hơn, flow viết bằng JS khó đọc với người không viết code.

## Consequences
+ Test đi qua interceptor thật. Flow E2E ngắn, dễ đọc.
- Có thể phải chỉnh `transformIgnorePatterns` cho gói ESM của MSW. Maestro cần cài CLI riêng; E2E iOS chỉ chạy trên
  macOS.
