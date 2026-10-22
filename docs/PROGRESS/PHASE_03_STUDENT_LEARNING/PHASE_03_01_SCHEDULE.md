# 3.1 Lịch học

### 2026-10-20 15:16 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1.1 Dải tuần và 3.1.2 Timeline.
- Trạng thái: In progress.
- Đã làm: Calendar date arithmetic, Intl theo timezone, tuần trước/sau/Hôm nay, ô ngày >=44dp, timeline có nhãn trạng thái/hình thức/preview; callbacks chỉ classId/sessionId/accessMode; loading/empty/error/requestId/retry.
- Test: Red module calendar chưa tồn tại → Green calendar.test.ts; ScheduleScreen.test.tsx qua năm và chọn ngày rỗng PASS. Native đang kiểm tra; chưa tự nghiệm thu toàn sub-phase.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ fixture development, không API mới hoặc meetingUrl trên lịch.

### 2026-10-20 15:35 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1.1–3.1.2, chỉnh UI theo ảnh owner.
- Trạng thái: In review — chờ owner xem UI.
- Đã làm: Lưu snapshot trước sửa và ảnh owner; cập nhật spec trước thay bố cục. Header tháng/năm và dải ngày cố định, timeline cột ngày72dp/giờ/mã lớp, ngày chọn và dot, nhãn Online/Offline, sessionNumber/trạng thái hợp lệ thay ca/điểm danh. 320dp/font130% cho giờ lên trên và ngày/tháng hai dòng có chủ ý. Tự cuộn dải ngày để ngày chọn trong viewport; ngày rỗng không xoá buổi khác trong tuần.
- Test: Normal flow lịch PASS sau sửa, đủ success/empty/error/retry và detail/session. Jest calendar + ScheduleScreen4tests PASS; format/type-check và eslint phần sửa được kiểm tra. Ảnh đã xem trực tiếp: normal không gãy dd/mm,320dp không mất hành động.
- PR / commit: Chưa tạo.
- Ghi chú: Snapshot tại evidence/schedule-redesign/before.png và after.png; nguồn/khác biệt/giới hạn tại UI_REVIEW.md. Chưa gọi API hoặc xác nhận UI thay owner.


### 2026-10-20 18:11 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1 lịch chỉ xem và3.6.2 API lịch tuần.
- Trạng thái: In review.
- Đã làm: Row lịch là View accessible, không role button/onPress/callback điều hướng; giữ chọn ngày, đổi tuần và refresh. Service me/schedule lấy đủ trang100, includeCancelled=true, dedupe/sessionId-sort, timezone/range validate; lỗi trang sau không thành thành công một phần. Range tuần theo timezone response, ranh giới năm/DST có test.
- Test: component và preview read-only PASS; MSW đủ101buổi, trang2lỗi PASS; backend thật lịch trống/timezone Asia/Ho_Chi_Minh; native API flow normal PASS. Android row với fixture đang kiểm tra riêng để có buổi thật trên màn.
- PR / commit: Chưa tạo.


### 2026-10-20 18:14 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1/3.5/3.6 kiểm tra cuối và bàn giao.
- Trạng thái: In review — chờ owner UAT; không tự chuyển Done.
- Đã làm: Lịch chỉ xem, ADR-0030 Accepted và API production đã nối. Tài liệu [API_REVIEW](API_REVIEW.md) và UAT cập nhật đúng quyền owner đã cấp/giới hạn dataset; báo cáo kiểm tra chuyển vào evidence/checks để không để log phase mới ở root.
- Test: Native fixture read-only normal PASS tại schedule-readonly/2026-10-20_180929; responsive320dp/font130%/animator0 PASS tại schedule-readonly-320dp/2026-10-20_181155, gồm chạm lịch không mở session, chuyển account/list/detail và về Courses. Đã khôi phục1080×2400/font100%/animator mặc định. Backend normal final PASS như entry trước. Kiểm thử bổ sung PayOS hook11tests PASS, gồm resume đúng đơn và retry sau review=true không POST link mới. Sau các chỉnh cuối scoped lint/type-check/format/diff-check PASS; toàn repo lint vẫn lỗi asset ngoài phạm vi như báo cáo trước.
- Giới hạn giữ nguyên: tài khoản backend chưa có FULL/CASH/PAYOS/lịchcóbuổi; các trạng thái đó MSW/fixture, không tuyên bố backend thật. Không giao dịch thật hoặc cấp enrollment. UAT owner chưa thực hiện.
- PR / commit: Chưa tạo.


### 2026-10-20 18:19 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.1/3.5 điều chỉnh theo ảnh owner.
- Trạng thái: In review.
- Đã làm: ONLINE trên Lịch giữ nhãn Phòng nhưng giá trị trống, không hiện thông báo thiếu phòng; OFFLINE giữ dữ liệu/fallback. Bỏ thanh Lớp của tôi ở trang Khoá học cả production/preview, dọn prop/callback thừa, giữ lối vào Home/Tài khoản. Flow responsive cập nhật không tìm thanh đã bỏ.
- Kiểm tra: Prettier/type-check/scopedESLint PASS. Thay đổi hiển thị và gỡ điểm vào, không đổi endpoint/quyền dữ liệu.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ tiêu chí sau tổng kết test/AI review theo yêu cầu owner.
- Trạng thái: Done theo UAT owner đã có; giữ các giới hạn kiểm chứng, không ghi nhận UAT mới.
- Tiêu chí: tick bổ sung 3 mục đủ bằng chứng đã ghi; 0 mục giữ chưa đủ bằng chứng và nêu lý do trong IMPLEMENT/bảng đối chiếu.
- Test: Chỉ rà hồ sơ, không chạy lại app/Jest/Maestro/backend; không biến kết quả lịch sử hoặc owner approval thành lượt test mới.
- Đồng bộ: [IMPLEMENT](../../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_01_SCHEDULE.md) và [bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); nhật ký cũ giữ nguyên.
