# Bàn giao API Phase3 — 2026-10-20

Cập nhật 2026-10-22: [bản sửa hộp xác nhận account sau CI PR #5](../PHASE_05_PAYMENT_RESULT/CI_ACCOUNT_FIX.md), gồm kết quả local và giới hạn. Không chạy lại API/logout backend thật; bàn giao API bên dưới giữ là bằng chứng lịch sử.

Owner đã duyệt ADR-0030 và cho phép gắn API, kèm yêu cầu Lịch chỉ xem. Owner @Bero đã xác nhận “Tôi duyệt UAT phase 3” trong chat ngày 2026-10-21 (+07:00); Phase 3 Done.

## Phần đã nối

- Lịch: GET me/schedule đủ trang, timezone từ response, chỉ xem row; chọn ngày/tuần và refresh còn hoạt động.
- Tài khoản: auth/me, đổi ngôn ngữ local và auth/logout; mục chưa có API vẫn disabled.
- Lớp của tôi: me/classes current/history, phân trang/enrollmentId, nhóm folder, giữ state/scroll khi quay lại.
- Chi tiết: lấy lại quyền qua me/classes view=all, gọi protected full/preview. Không dùng hint route hoặc public detail cấp quyền; repeated403 dừng, preview không chứa URL, focus/refetch ẩn link cũ.
- Đơn cũ: preflight enrollment+order trước POST link/retry; review, expired, CASH/PAID/CANCELLED không tạo link. Không checkout mới, không suy QR thành PAID/FULL.
- Route chỉ STUDENT; tabs dùng pop=true; logout/đổi session không dùng cache phiên trước. Không thêm dependency hoặc sửa HTTP/bootstrap.

## Kiểm tra

- Toàn repo60suites/284tests PASS. Lượt sau sửa giữ list/status bar4suites18tests PASS; không cộng các lượt.
- Type-check, Prettier PASS. ScopedESLint0lỗi/1warning testURL không an toàn có chủ ý. Lint tổng repo626lỗi/44warnings từ asset JavaScript thiết kế tồn tại trước đó.
- Native backend normal: [Lịch](evidence/api-real-final/2026-10-20_180816/student-learning-api/takeScreenshot/phase3-api-schedule.png), [Tài khoản](evidence/api-real-final/2026-10-20_180816/student-learning-api/takeScreenshot/phase3-api-account.png), [Lịch sử lớp](evidence/api-real-final/2026-10-20_180816/student-learning-api/takeScreenshot/phase3-api-history.png). Flow Home→Schedule→Account→MyClasses current/history→Back→Home PASS. Flow riêng `e2e/backend/student-learning-api.yaml` cần đăng nhập tài khoản có dataset như dưới, không nằm trong bộ fixture mặc định.
- MSW: phân trang101buổi; lỗi trang2 không thành empty/success; schema/URL preview stripping; FULL→CASH sau403; repeated403dừng; scope/generation; refocus không render link FULL cũ; review/expired preflight; production navigation/logout.

## Dữ liệu thật và giới hạn

Tài khoản STUDENT do owner cung cấp có2đăng ký lớp ở lịch sử: HTML-CSS-101-OFF1 và JS-101-ON1. Cả hai enrollment CANCELLED, accessMode NONE, lý do ENROLLMENT_CANCELLED; order EXPIRED và requiresReview=false. Lịch tuần19–25/10/2026 trống, timeZone Asia/Ho_Chi_Minh. Current empty và history2folder là dữ liệu thật, không lỗi mapping.

Chưa có FULL/CASH_PREVIEW/PENDING_PAYOS/đối soát hoặc lịch có buổi trong tài khoản này để kiểm tra native/backend thực tế. Các trạng thái đó được kiểm MSW/fixture, cần tài khoản/dataset phù hợp để owner UAT. Không tạo enrollment/đơn hoặc thanh toán thật nhằm dựng bằng chứng. Chưa iOS/TalkBack thủ công. Không lưu mật khẩu/cookie/link họp vào tài liệu; ảnh tài khoản chỉ dùng làm bằng chứng theo tài khoản owner giao.

## Owner UAT

Theo [hướng dẫn](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_99_User_Acceptance.md). API đã nối; giới hạn dataset cần được xem khi nghiệm thu. Owner @Bero đã duyệt UAT trong chat ngày 2026-10-21 (+07:00); Phase 3 Done theo xác nhận trực tiếp của owner. Các giới hạn và bằng chứng kiểm thử dưới đây được giữ nguyên.


## Bổ sung kiểm tra cuối

- Read-only fixture normal PASS: schedule-readonly/2026-10-20_180929. Chạm row buổi vẫn ở Lịch; error/empty/retry/success PASS.
- Responsive320dp/font130%/animator0 PASS: schedule-readonly-320dp/2026-10-20_181155. Emulator đã khôi phục kích thước/font/animator mặc định.
- PayOS hook11tests PASS ở lượt bổ sung: resume đúng orderId, review chuyển true trước retry thì không POST link mới. Đây là test riêng, không cộng với284tests của lượt toàn repo.


## Cập nhật2026-10-20 18:44

Ở lượt hiện tại đã mở protected detail JS-101-ON1/mentor Trần Quốc Bảo trên Android thật với phiên owner. Giới hạn account chỉ có NONE ở các lượt18:08 là ghi nhận lịch sử, không còn mô tả đầy đủ dữ liệu hiện tại. Modal giáo viên/học viên đã được owner yêu cầu bổ sung, owner xác nhận chưa có API Student roster và chọn UI chờ API. Không gọi endpoint roster Mentor/Admin, không suy học viên từ availableSeats. [Avatar cuối](evidence/class-participants-final/avatar-final.png); modal/native open-Back PASS tại evidence/class-participants-final/2026-10-20_184336.
