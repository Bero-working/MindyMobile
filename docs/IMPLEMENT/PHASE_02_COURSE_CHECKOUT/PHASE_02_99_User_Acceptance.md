# 2.99 User Acceptance — Khoá học → Giỏ hàng → Thanh toán QR

- Người nghiệm thu: **@Bero**.
- Trạng thái: **Done — owner duyệt lại UAT ngày2026-10-18 21:34 (+07:00), sau sửa E2E**.
- Phạm vi: màn Khoá học, sheet khoá học, sheet Giỏ hàng, màn Thanh toán QR, với API thật theo [2.6](PHASE_02_06_API_INTEGRATION.md).
  Không gồm xác nhận `PAID`, trang kết quả PayOS, CASH.
- Quy trình: [ADR-0017](../../adr/ADR-0017-ai-self-review-owner-uat.md), [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md).

## Điều kiện bắt đầu

- [x] README Q1–Q10 đã chốt (chat 2026-10-17); ADR-0024, ADR-0025 Accepted.
- [x] Q11–Q13 đã chốt (chat 2026-10-17); ADR-0027 Accepted.
- [x] Owner đã xác nhận UI, có bằng chứng trong PROGRESS.
- [x] 2.6 đã hoàn tất code/test và có bằng chứng backend thật (STUDENT, lớp OPEN, QR PayOS). Quét bank app và cấu hình sandbox phía server **chưa xác minh**; owner kiểm tra bước 8 với đơn mới còn hạn.
- [x] Dọn dẹp/Kiểm tra đạt; phase và 2.99 ở In review “chờ UAT”. Giới hạn process Jest CustomGC và kiểm tra ngân hàng/native còn thiếu được ghi tại API_REVIEW.
- [x] [PROGRESS cấp phase](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/README.md) có tổng hợp tự nghiệm thu và giới hạn.

## Owner kiểm tra

| Bước | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Đăng nhập STUDENT, chọn tab Khoá học; đặt app cạnh ảnh tham chiếu | Header, Gợi ý + RECOMMEND, Danh mục, chip, lưới, tab Khoá học được chọn đúng ảnh |
| 2 | Lướt gợi ý, đổi chip, mở bộ lọc Online/Offline, đặt lại, lật trang | Lưới 6 thẻ/trang đổi đúng; “Xem n khoá học” đúng số; empty có “Đặt lại bộ lọc”; chấm đúng |
| 3 | Bấm mũi tên một khoá có nhiều lớp, một khoá có lớp hết chỗ | Sheet khoá học như ảnh 4: lịch thứ/giờ, mentor, số chỗ đúng; lớp hết chỗ không chọn được |
| 4 | Chọn/bỏ/đổi lớp; bấm icon giỏ cạnh Mua ngay, chọn lớp khác cùng khoá rồi Mua ngay | Chọn tạm không đổi badge/giỏ; icon giỏ thêm lớp, hiện toast và giữ modal. Mua ngay thêm/thay lớp rồi mở giỏ; đúng một lớp của khoá. Thêm lỗi giữ lớp cũ |
| 5 | Mở giỏ từ Home và từ Khoá học; xoá một lớp | Số lượng, tổng đúng server; hàng mất sau khi server xoá |
| 6 | Giỏ rỗng | “Giỏ hàng (0)”, “Giỏ hàng đang trống.”, `0 VND`, Thanh toán disabled |
| 7 | Thêm lớp, bấm Thanh toán | Chuyển màn Thanh toán, không có tab bar; số tiền `x VND` đúng; đồng hồ ~15:00 đếm lùi; giỏ về 0 |
| 8 | Quét QR bằng app ngân hàng (không cần chuyển tiền) | App ngân hàng đọc được số tiền/người nhận khớp đơn |
| 9 | Sao chép số tài khoản và nội dung; bấm Back | Toast đã sao chép; hộp thoại xác nhận rời màn. Build development hiện thông tin ngân hàng **mock** (Q3); build production không hiện 4 hàng mock (Q12) |
| 10 | Tắt mạng khi mở Khoá học / khi bấm Thanh toán | Lỗi dễ hiểu, Thử lại đúng vùng; không tạo đơn lặp |
| 11 | Chữ lớn, đọc màn hình, Reduce Motion, Android Back | Không cắt chữ/che nút; nhãn đúng; vùng chạm ≥ 44 |
| 12 | Xem lint/type-check/Jest/Maestro và giới hạn | Bằng chứng đủ; giới hạn được ghi rõ |

## Bằng chứng AI

[API_REVIEW](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/API_REVIEW.md) tổng hợp môi trường, ảnh QR thật, kết quả giải mã, kiểm thử và giới hạn. [QR backend thật](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/evidence/api-payos-qr.png), [giỏ đã xoá](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/evidence/api-cart-cleared.png), [Jest](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/evidence/api-final-jest.json). QR mẫu trong ảnh có hạn; tạo đơn mới khi kiểm tra bước 8.

## Ghi nhận của owner

@Bero xác nhận trực tiếp trong chat: **“UAT phase 2 được approve”**, ghi nhận ngày2026-10-18 19:21 (+07:00).
Phase2 và bước2.99 chuyển Done theo xác nhận của owner, không phải AI tự nghiệm thu thay owner.
Nhật ký đầy đủ tại [PROGRESS](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/README.md).
Các giới hạn bằng chứng đã nêu tại API_REVIEW được giữ nguyên; không suy ra thêm kết quả từng phép thử ngoài xác nhận chung này.

Owner sau đó rút xác nhận: “Test e2e đã fail (tôi chưa check kĩ, chuyển trạng thái phase 2 tiếp tục chờ UAT, đồng thời fix e2e)”. Phase2 và2.99 trở lại In review; chưa có UAT mới. Xác nhận Done phía trên là lịch sử.


## Xác nhận UAT hiện tại — 2026-10-18 21:34 (+07:00)

@Bero xác nhận trực tiếp: **“UAT phase 2 approve”** sau khi E2E thiếu APP_ID đã sửa và9/9flow đạt. Phase2 và2.99 **Done** theo owner. Các xác nhận/mở lại trước đây là lịch sử. Giữ nguyên giới hạn bằng chứng đã ghi tại API_REVIEW; không tự bổ sung kết quả từng phép thử từ xác nhận chung.
