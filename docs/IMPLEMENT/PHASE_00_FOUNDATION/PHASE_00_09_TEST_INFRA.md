# 0.9 Hạ tầng test

## Mô tả
Cài MSW và tạo helper test dùng chung: mock server, handler theo feature, `renderWithProviders`.

## Hạ tầng / ADR
- File khoá bị sửa hoặc tạo: `package.json`, `jest.setup.js`, `jest.config.js` (nếu cần `transformIgnorePatterns`),
  `tests/mocks/server.ts`, `tests/utils/**`.
- ADR: [ADR-0007](../../adr/ADR-0007-maestro-msw.md), [ADR-0008](../../adr/ADR-0008-tdd.md).
- Nội dung: [guides/testing.md](../../guides/testing.md#api-testing).

## Task
### 0.9.1 Cài MSW và mock server
- Kết quả mong đợi: `npm i -D msw`; `tests/mocks/server.ts`, `tests/mocks/constants.ts` (`TEST_API_URL`),
  `tests/mocks/handlers/`. `API_URL` mock trong `jest.setup.js` đổi thành `http://localhost:3000/api/v1`.
- Test cần viết trước: test gọi `apiInstances.service.get('health/live')` với handler MSW trả 200. Xác nhận request của
  Axios bị MSW chặn (nếu không chặn được, kiểm tra adapter Axios trong Jest và `transformIgnorePatterns`).

### 0.9.2 `tests/utils/`
- Kết quả mong đợi: `renderWithProviders`, `renderHookWithProviders`, `createTestQueryClient` theo guide.
- Test cần viết trước: hook query dùng `renderHookWithProviders` nhận dữ liệu từ handler MSW.

## Tiêu chí nghiệm thu
- [ ] Request Axios trong Jest bị MSW chặn, `onUnhandledRequest: 'error'` bắt được request chưa mock.
- [ ] Helper trong `tests/utils/` dùng được cho test ở 0.4 và 0.7.

## Xác nhận nghiệm thu cuối Phase 0

- Trạng thái: **Done** theo xác nhận owner trong chat ngày 2026-10-17: “Bước 6 approve và done phase 0, không cần đợi refresh”.
- Checklist kiểm thử phía trên giữ mức bằng chứng đã ghi; việc đóng theo owner không bổ sung kết quả cho ca chưa chạy.
- Chi tiết nghiệm thu và giới hạn tại [PROGRESS cấp phase](../../PROGRESS/PHASE_00_FOUNDATION/README.md).
