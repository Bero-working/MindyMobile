# Dọn dẹp Phase 5 sau UAT

Cập nhật sau báo cáo: [sửa lỗi CI account của PR #5](CI_ACCOUNT_FIX.md). Kết quả bên dưới thuộc lượt dọn dẹp trước; không thay kết quả CI mới.

Ngày 2026-10-22 (+07:00), theo yêu cầu owner @Bero. Phase giữ **Done** theo xác nhận UAT trước đó. Revision: HEAD `76f7b4200785539b62830e61f02799d74aa2968b` cộng working tree; chưa commit.

## Thay đổi

- Bỏ hàm `resultAction` trùng nhánh PAID đã có trong ticket; CTA/Back dùng chung điều kiện hiện tại. Bỏ ba test chỉ kiểm tra hàm này; các test hành vi CTA, chống bấm lặp, Back cho cả ba trạng thái và route integration vẫn giữ.
- Thu hẹp helper/constant polling về nội bộ module; bỏ trường `requestId` không có nơi sử dụng khỏi kết quả hook. Thông tin lỗi API gốc vẫn giữ.
- Dùng import kiểu `ReactNode` trực tiếp; cập nhật đặc tả từ mô tả đề xuất sang ticket đã duyệt, một CTA và các mốc UI/API/UAT đã hoàn tất.
- Giữ lịch sử PROGRESS, ảnh và manifest cũ. [Manifest sau dọn dẹp](evidence/cleanup-source-sha256.txt) định danh 25 file còn tồn tại trong danh sách 26 file bàn giao API trước đây; file test helper đã bỏ không còn trong manifest mới.

## Kiểm tra mới

| Kiểm tra | Kết quả |
| --- | --- |
| `npm test -- --runInBand` | PASS: 68 suite / 355 test; giảm đúng một suite / ba test helper đã bỏ |
| `npm run lint` | PASS: lint 0 lỗi, format và type-check đạt; một cảnh báo có sẵn ở `ClassDetailScreen.test.tsx:183` ngoài phase |
| Maestro `e2e/flows/payment-result.yaml` | PASS trên Pixel_8 Android emulator, 1080×2400, font 1.0: ba ticket, PAID về Home, CANCELLED/EXPIRED về Courses, Back từ PAID về Home |
| Tìm code tạm trong payment và PhaseFivePreview | Không có console/logger.debug/TODO/FIXME |
| Diff whitespace trong phạm vi | PASS |

Log local: `build-logs/phase5-cleanup-jest.txt`, `build-logs/phase5-cleanup-lint.txt`, `build-logs/phase5-cleanup-maestro.txt`; báo cáo/ảnh Android tại `build-logs/phase5-cleanup-maestro/`. Không chạy lại coverage; số coverage trong API_REVIEW thuộc bản bàn giao trước dọn dẹp.

Android ở lượt này dùng fixture; không phải thanh toán backend thật. Giới hạn backend Student/đơn test, lifecycle API native, iOS/TalkBack/Reduce Motion đầy đủ giữ như API_REVIEW. Các checkbox kỹ thuật thiếu bằng chứng tiếp tục chưa tick. Không có dependency, hạ tầng, commit/push/PR/CI/merge mới.
