# Tiến độ 3.6 — Tích hợp API

Chỉ ghi thêm kết quả từng task; chưa có entry triển khai. Bắt đầu sau owner xác nhận UI của Phase 3.


### 2026-10-20 18:11 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.6.1–3.6.5 tích hợp API.
- Trạng thái: In review; giới hạn dữ liệu backend ghi trong API_REVIEW.
- Đã làm: Zod DTO/service/query scoped user+generation, pagination enrollmentId, quyền hiện tại lấy đủ view=all trước protected detail; FULL được ưu tiên hơn enrollment lịch sử cùng classId. Denial refetch và chuyển endpoint đúng một lần, preview strip toàn bộ meetingUrl, detail ẩn data cũ khi focus/refetch/error. Account auth/me/logout, checkout invalidate learning, resume PayOS preflight list/order/review/expired trước link/retry; không checkout lại.
- Test: Toàn repo lượt cuối60suites/284tests PASS; sau chỉnh giữ list khi blur và status bar4suites18tests PASS. MSW bao gồm101buổi/partial-page-failure, chuyểnFULL→CASH, repeated403khôngloop, scopegeneration, bỏlinkcũkhifocus/denial, preflightreview/expired, productionnavigation/logout. Type-check/Prettier PASS; scopedESLint0lỗi/1warning URL cố ý trong test; lint tổng còn626lỗi/44warnings ở asset JS thiết kế ngoài phạm vi.
- Backend/native: Tài khoản owner chỉ định đăng nhập STUDENT thành công. me/classes all có2enrollment CANCELLED/NONE với order EXPIRED, me/schedule tuần19–25/10/2026 total0. Android api-real-final/2026-10-20_180816 PASS; ảnh account/schedule/history lưu cùng thư mục. Không tạo đơn/giao dịch/enrollment hay POST link thật.
- Chưa kiểm tra thực tế: FULL/CASH/PayOS/review/quyền đổi giữa phiên vì account không có trạng thái này; đã kiểm bằng MSW. Chưa iOS/TalkBack thủ công. Không coi MSW là bằng chứng backend FULL, không tự duyệt UAT.
- PR / commit: Chưa tạo.


### 2026-10-20 18:14 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1/3.5/3.6 kiểm tra cuối và bàn giao.
- Trạng thái: In review — chờ owner UAT; không tự chuyển Done.
- Đã làm: Lịch chỉ xem, ADR-0030 Accepted và API production đã nối. Tài liệu [API_REVIEW](API_REVIEW.md) và UAT cập nhật đúng quyền owner đã cấp/giới hạn dataset; báo cáo kiểm tra chuyển vào evidence/checks để không để log phase mới ở root.
- Test: Native fixture read-only normal PASS tại schedule-readonly/2026-10-20_180929; responsive320dp/font130%/animator0 PASS tại schedule-readonly-320dp/2026-10-20_181155, gồm chạm lịch không mở session, chuyển account/list/detail và về Courses. Đã khôi phục1080×2400/font100%/animator mặc định. Backend normal final PASS như entry trước. Kiểm thử bổ sung PayOS hook11tests PASS, gồm resume đúng đơn và retry sau review=true không POST link mới. Sau các chỉnh cuối scoped lint/type-check/format/diff-check PASS; toàn repo lint vẫn lỗi asset ngoài phạm vi như báo cáo trước.
- Giới hạn giữ nguyên: tài khoản backend chưa có FULL/CASH/PAYOS/lịchcóbuổi; các trạng thái đó MSW/fixture, không tuyên bố backend thật. Không giao dịch thật hoặc cấp enrollment. UAT owner chưa thực hiện.
- PR / commit: Chưa tạo.
