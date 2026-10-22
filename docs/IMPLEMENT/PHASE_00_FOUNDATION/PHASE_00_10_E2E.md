# 0.10 E2E

## Mô tả
Cài Maestro CLI, tạo thư mục flow và script `test:e2e` để mọi phase màn hình viết được flow cho luồng chính.

## Hạ tầng / ADR
- File khoá bị sửa: `package.json` (script).
- ADR: [ADR-0007](../../adr/ADR-0007-maestro-msw.md).
- Nội dung: [guides/testing.md](../../guides/testing.md#e2e-maestro).
- Lưu ý: Android `applicationId` là `com.mindymobile`, còn iOS `PRODUCT_BUNDLE_IDENTIFIER` vẫn là giá trị mặc định của
  template (`org.reactjs.native.example...`). Flow dùng `appId: ${APP_ID}` nên phải truyền đúng id theo nền tảng.

## Task
### 0.10.1 Cài Maestro và script
- Kết quả mong đợi: Maestro CLI cài trên máy dev (ghi cách cài vào [CONTRIBUTING.md](../../CONTRIBUTING.md)); thư mục
  `e2e/flows/`; script `"test:e2e": "maestro test e2e/flows"` truyền được `APP_ID`
  (`maestro test -e APP_ID=<id> e2e/flows`).
- Test cần viết trước: flow mẫu `e2e/flows/app-launch.yaml` mở app và `assertVisible` một `testID` của màn đầu tiên;
  chạy trước khi thêm `testID`, phải fail.

## Tiêu chí nghiệm thu
- [x] `npm run test:e2e` chạy flow mẫu xanh trên Android Emulator.
- [ ] Owner chốt cách truyền `APP_ID` cho script (Android và iOS).

## Xác nhận nghiệm thu cuối Phase 0

- Trạng thái: **Done** theo xác nhận owner trong chat ngày 2026-10-17: “Bước 6 approve và done phase 0, không cần đợi refresh”.
- Checklist kiểm thử phía trên giữ mức bằng chứng đã ghi; việc đóng theo owner không bổ sung kết quả cho ca chưa chạy.
- Chi tiết nghiệm thu và giới hạn tại [PROGRESS cấp phase](../../PROGRESS/PHASE_00_FOUNDATION/README.md).

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_00_FOUNDATION/PHASE_00_10_E2E.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

- Tiêu chí checkbox thứ 2: **Đạt một phần: Android APP_ID=com.mindymobile và override đã kiểm chứng/owner duyệt bước 8; chưa có bằng chứng chốt riêng bundle ID và E2E iOS. Không suy từ build Simulator thành E2E iOS.**
