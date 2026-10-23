# Bàn giao UI Phase 5 — ba ticket kết quả

Owner đã duyệt UI trong chat và cho nối API. Kết quả bên dưới là mốc UI trước tích hợp; bản API hiện tại ở [API_REVIEW](API_REVIEW.md).

## Phạm vi cuối theo owner ngày 2026-10-22

Chỉ giữ **PAID (SUCCESS), CANCELLED (FAIL), EXPIRED**. Các ticket pending/review/loading/empty/error/forbidden/notFound, callback kiểm tra lại và nội dung dịch/preview tương ứng đã bỏ. QR/loading/lỗi inline hiện có và enum backend giữ nguyên. Không tạo thêm trạng thái FAILED cho backend.

Giữ thiết kế theo [ảnh owner](../../IMPLEMENT/PHASE_05_PAYMENT_RESULT/references/payment-ticket-reference.png): giấy SVG trắng liên tục, mép xé, đường đục lỗ, dữ liệu in phẳng, nút chữ nhật bên ngoài giấy. Không card hoặc khung bo tròn cho kết quả. Xem [nguồn và thông số](../../IMPLEMENT/PHASE_05_PAYMENT_RESULT/references/DESIGN_SOURCE.md).

| Trạng thái | Hiển thị | CTA và Back |
| --- | --- | --- |
| PAID | Thanh toán thành công, dấu check | Về Home, reset stack chỉ còn STUDENT_HOME |
| CANCELLED | Thanh toán không thành công, dấu X và lý do đơn đã huỷ | Thử lại → Courses chọn lại lớp |
| EXPIRED | Đơn thanh toán đã hết hạn, dấu đồng hồ | Thử lại → Courses chọn lại lớp |

Không tự đóng hoặc tự chuyển Home. Callback rời ticket chỉ gọi một lần, không tự checkout/khôi phục giỏ/giá cũ. Không có nút kiểm tra lại hoặc skeleton trong ticket.

## Cách xem

Bản debug: Login → Back → Welcome → Xem thử UI → Kết quả thanh toán (dữ liệu mẫu). Menu chỉ ba trạng thái trên. Preview chỉ trong nhánh development, không tạo phiên giả và không gọi API nghiệp vụ. Mã DEMO-RESULT-5 không phải giao dịch thật.

## Kiểm tra và giới hạn

- Jest toàn dự án: **66 suite / 317 test PASS** sau khi bỏ test các trạng thái đã loại; module thanh toán 45 test PASS. Mapping ba trạng thái Red→Green, kiểm tra render/CTA/Back/double tap/focus/thông báo/Việt-Anh; reset adapter và cô lập QR phía sau có test.
- Lint: 0 lỗi, 1 warning có sẵn tại my-classes/ClassDetailScreen.test.tsx:183, ngoài phạm vi. Format/type-check PASS; lần format đầu bị khoá file translation, đã chạy lại sửa định dạng và check PASS.
- Maestro bản ba trạng thái payment-result.yaml: **PASS Android**. PAID CTA/Back→Home, CANCELLED/EXPIRED→Courses, không có nút kiểm tra lại. [Ảnh PAID](evidence/three-results-normal/phase5-PAID.png), [CANCELLED](evidence/three-results-normal/phase5-CANCELLED.png), [EXPIRED](evidence/three-results-normal/phase5-EXPIRED.png).
- Gallery ba trạng thái ở320×640dp/font1.3×: **PASS**, sáu ảnh top/actions tại three-results-compact. Đã xem ảnh và kiểm tra cuộn tới nút; emulator được khôi phục1080×2400/font1.0. Các ảnh10 trạng thái hoặc ticket-normal/ticket-compact cũ là lịch sử trước yêu cầu thu gọn, không phải bằng chứng bản cuối.
- Native TalkBack, iOS và Reduce Motion chưa kiểm tra đầy đủ. Lần scale0 trước đó bị cảnh báo Reanimated che nút preview ở Welcome, ảnh evidence/reduced-motion-blocked. Ticket không animation tự chạy; nút kế thừa PressableScale có sẵn.
- Tại thời điểm bàn giao UI trước đây, API5.3 chưa bắt đầu: chưa polling/cache/GETtrướcPOST hoặc xác minh thanh toán thật; chưa kết nối result từ usePaymentQuery. Chỉ PAID xác minh từ backend mới được mở success khi tích hợp. Hai origin checkout/learning thật chưa kiểm tra; callback Home dùng adapter chung, preview kiểm tra riêng.

## Hồ sơ và trạng thái

AI Codex, nhật ký @Bero theo owner xác nhận trong chat. Windows/Metro debug, Pixel_8 API37; màn thường1080×2400px/density420/font1.0. Revision HEAD76f7b42 + working tree, chưa commit/push/PR/CI mới. Danh sách SHA256 file bàn giao ở evidence/source-sha256.txt. Giữ các thay đổi auth/navigator/env/tài liệu có sẵn trước lượt này.

UI đã được owner xác nhận sau bản bàn giao này; API5.3 đã tích hợp theo API_REVIEW, UAT5.99 Done theo xác nhận owner trong chat ngày2026-10-22. Thay đổi phạm vi không phải UI approval hoặc UAT. Checklist accessibility ghép vẫn chưa tick vì còn thiếu native, không thay bằng tổng test xanh.

Ảnh compact cuối: [PAID](evidence/three-results-compact/phase5-PAID-actions.png), [CANCELLED](evidence/three-results-compact/phase5-CANCELLED-actions.png), [EXPIRED](evidence/three-results-compact/phase5-EXPIRED-actions.png).
