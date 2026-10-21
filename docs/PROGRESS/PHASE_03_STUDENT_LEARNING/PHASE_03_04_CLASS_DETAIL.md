# 3.4 Chi tiết lớp

### 2026-10-20 15:16 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4.1 Hero/chương và 3.4.2 Buổi học.
- Trạng thái: In progress.
- Đã làm: Detail union FULL/preview (preview không có meetingUrl ở type), hero/cover fallback, chương/buổi, session sheet, URL http/https và callback, cancelled/offline/preview không join; denial bỏ dữ liệu khỏi render.
- Test: ClassDetailScreen.test.tsx Red thiếu component → Green 6 tests, root fallback/preview/unsafe URL/denial PASS. Native đang kiểm tra.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa có protected endpoint ở bước UI. Callback join của preview chỉ mô phỏng lỗi, không mở URL mẫu.

### 2026-10-20 15:35 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4.1–3.4.2 tự kiểm tra detail/buổi.
- Trạng thái: In review.
- Đã làm: FULL/preview typing tách URL, root/session URL precedence, không link ở preview/offline/cancelled hoặc stale error; sessionId mở đúng chương/sheet, thiếu session có cảnh báo, empty units có copy.
- Test: ClassDetailScreen9tests PASS gồm URL credentials/scheme không hợp lệ, denial xoá UI, offline/cancelled và callback join lỗi giữ sheet. Native FULL/CASH/session sheet và320dp/font130% PASS ở các lượt ghi trong UI_REVIEW.
- PR / commit: Chưa tạo.
- Ghi chú: Protected endpoint xác minh quyền, cache gcTime0 và focus/refetch thuộc3.6; chưa có bằng chứng server thật hoặc UAT.


### 2026-10-20 16:22 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4.1–3.4.2 chỉnh detail/session và footer theo ảnh owner.
- Trạng thái: In review.
- Đã làm: Hero full width, thẻ mentor, stats từ dữ liệu và danh sách buổi phẳng; màn buổi full screen header mint nhạt, fact tiles, mục nội dung/mục tiêu thiếu dữ liệu hiển thị rõ, Tài liệu disabled. Đổi nhãn Vào Google Meet, nút rộng vừa nội dung/nền trắng/viền line/icon mint. Session: Tài liệu trái, Meet phải; class detail: avatar trái, Meet phải.
- Sửa lỗi: Bỏ native Modal của session gây cửa sổ cũ còn phủ sheet công cụ sau Back; dùng state nội bộ, status bar đúng màn. Hardware Back đóng session trước detail.
- Test: Jest detail/preview2suites15tests PASS; type-check/Prettier/scoped ESLint PASS. Native lượt meet-button/normal/2026-10-20_161551: student-schedule và my-classes-detail2/2 PASS; footer-normal/2026-10-20_162011 PASS gồm hai nút visible và hardware Back. Đã xem ảnh trực tiếp, hai nút đối diện đúng yêu cầu; snapshot after.png cập nhật. Lượt final-normal161837 gián đoạn khi source được chỉnh theo các yêu cầu owner đang gửi, không dùng làm bằng chứng pass.
- PR / commit: Chưa tạo.
- Ghi chú: Không thêm API/route production/dependency; không dựng số tiến độ/roster/tài liệu hoặc URL mẫu. Callback preview không mở link ngoài. Nhãn Google Meet theo yêu cầu owner, callback vẫn dùng URL xác minh của dữ liệu.


### 2026-10-20 16:26 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 footer hai nút và bố cục màn nhỏ.
- Trạng thái: In review.
- Đã làm: Nút Meet trắng/viền line ở bên phải cả session và class detail; Tài liệu/avatar ở bên trái. Thu icon28dp, padding8dp và chữ13dp tại màn hẹp/chữ lớn; nhãn một dòng fit tối đa15%, không còn pill cao do chữ bị tách từng đoạn.
- Test: footer-normal/2026-10-20_162011 PASS; footer-320dp-compact/2026-10-20_162434 PASS gồm thấy đủ nút và hardware Back về detail. Đã xem ảnh cuối, nhãn đủ, không tràn; type-check/scoped ESLint/Prettier PASS. Emulator đã khôi phục1080×2400/font100%/animator mặc định. Lượt320dp đầu không tới nút preview do ngoài viewport, đã sửa flow cuộn; lượt320dp-final trước compact pass hành vi nhưng bố cục chữ chưa đạt nên đã sửa và chụp lại, không dùng làm ảnh cuối.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ UI; API/UAT chưa thực hiện.


### 2026-10-20 18:20 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 đánh dấu buổi đã kết thúc theo yêu cầu owner.
- Trạng thái: In review.
- Đã làm: Row buổi có endsAt đã qua hiển thị tick trắng/vòng mint và nhãn Đã kết thúc, kể cả server còn SCHEDULED/IN_PROGRESS. Badge session đồng bộ. CANCELLED không đổi thành completed; COMPLETED server luôn giữ. Chỉ tính trạng thái hiển thị, không sửa status DTO/cache/backend, không ghi điểm danh hoặc tính tiến độ, không đổi quyền/link.
- Test: Red thiếu helper → Green; sessionDisplayStatus và ClassDetailScreen2suites15tests PASS, gồm boundary endsAt, tương lai/đang diễn ra, cancellation/servercompleted và không mutate. Prettier/type-check/scopedESLint PASS.
- PR / commit: Chưa tạo; UAT owner chưa xác nhận.


### 2026-10-20 18:22 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 tinh chỉnh row buổi theo ảnh owner.
- Trạng thái: In review.
- Đã làm: Bỏ đồng hồ ở row SCHEDULED/CANCELLED, giữ khoảng icon để tên thẳng hàng với tick/video. Cột status cố định104dp/compact112dp, canh trái và nhãn một dòng để Đã kết thúc bắt đầu cùng vị trí Đã lên lịch; chevron bên phải. Không đổi callback/API/quyền.
- Kiểm tra: Prettier/type-check/scopedESLint PASS.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:22 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 khoảng cách nhãn trạng thái.
- Trạng thái: In review.
- Đã làm: Bỏ flex-1 của nhãn, để chevron ngay sau nhãn với gap4dp; giữ cột cố định/nhãn một dòng/điểm bắt đầu thẳng hàng.
- Kiểm tra: Prettier và scopedESLint PASS; không đổi dữ liệu hoặc tương tác.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:23 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 canh cuối cụm trạng thái.
- Trạng thái: In review.
- Đã làm: Cụm trạng thái/chevron justify-end ở cuối mỗi row theo ảnh mới; chevron cùng mép phải, nhãn một dòng và gap4dp. Không đổi dữ liệu/tương tác.
- Kiểm tra: Prettier và scopedESLint PASS.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:24 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 khoảng cách nhãn tổng số buổi.
- Trạng thái: In review.
- Đã làm: Tăng margin trái nhãn tổng số buổi thêm4dp, không đổi số buổi hoặc tương tác.
- Kiểm tra: Prettier/scopedESLint PASS.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:25 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 căn đều thống kê.
- Trạng thái: In review.
- Đã làm: Bốn cột thống kê bằng nhau/căn giữa, padding ngang đối xứng4dp, gap giá trị/nhãn5dp; bỏ padding phải lệch. Compact giữ2×2 cột đều/căn giữa.
- Kiểm tra: Prettier/scopedESLint PASS; không đổi dữ liệu.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:31 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 tự active buổi học tiếp theo.
- Trạng thái: In review.
- Đã làm: Tô peach và accessibility selected cho đúng một buổi gần nhất chưa kết thúc theo startsAt/endsAt, bỏ qua CANCELLED/COMPLETED/past; không dùng sessionNumber lặp hoặc sessionId cũ làm active. Tự cập nhật tại endsAt và AppState active bằng đồng hồ UI, không poll API/đổi status hoặc quyền/link.
- Test: Red thiếu selector → Green; selector/clock/component3suites17tests PASS, có render assertion buổi active tự chuyển đúng khi hết giờ và timer cleanup. Prettier/type-check/scopedESLint phần triển khai PASS.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:34 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 danh sách buổi theo mẫu UI mới.
- Trạng thái: In review.
- Đã làm: Row gọn với vòng30dp/gap10dp/title13dp/metadata11dp. Buổi kết thúc tick mint; buổi tương lai vòng soft/số thứ tự toàn danh sách; active peach/vòng ember/chữ trắng/title đậm. Active hôm nay có nhãn Hôm nay, tương lai Sắp học; nhãn/chevron gọn cuối row. Giữ dữ liệu sessionNumber server, nhãn Đã kết thúc thay vì bịa điểm danh Đã học.
- Nguồn: references/session-rows-owner-2026-10-20.png.
- Kiểm tra: ClassDetailScreen13tests PASS; Prettier/type-check/scopedESLint PASS. Auto-active/đồng hồ UI giữ logic và test đã có.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:36 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 vòng số buổi theo ảnh mới.
- Trạng thái: In review.
- Đã làm: Vòng số cố định32dp/min-width32/shrink-0/radius16/overflow-hidden; active coral cam sáng/số trắng14dp, sắp tới soft/số forest. Không cho cột số co khi tiêu đề dài, completed giữ mint/tick. Lưu hai ảnh tham chiếu vòng active/upcoming vào references.
- Kiểm tra: Prettier/scopedESLint PASS; thay đổi style, không đổi dữ liệu/trạng thái/API.
- PR / commit: Chưa tạo; UAT chưa xác nhận.


### 2026-10-20 18:45 (+07:00) · @Bero (Codex thực hiện)
- Phase: 3.4 footer nổi và modal giáo viên/học viên.
- Trạng thái: In review; danh sách học viên chờ API Student.
- Owner xác nhận chưa có endpoint Student và chọn làm modal chờ API; tiếp theo yêu cầu bỏ nút Đóng và sửa avatar tròn.
- Đã làm: Footer nền trong suốt/nổi trên danh sách, safe area offset, chừa110dp cuối ScrollView. Avatar44×44dp/rounded-full/viền trắng/shadow, Meet trắng/shadow. Bấm avatar mở AppSheet, giáo viên lấy từ detail thật, học viên thông báo chưa được cung cấp, không count/roster giả hoặc gọi endpoint Mentor/Admin. Modal không nút Đóng, đóng bằng Back/backdrop/kéo xuống; denial ẩn modal.
- Sửa layout: Hai lượt56dp avatar bị dẹt/hình vuông khi hot reload, chưa đạt; chuyển chiều cao sang View con và dùng kích thước44dp/rounded-full đồng nhất với avatar đã có. Đã xem screenshot Android cuối avatar tròn, lưu evidence/class-participants-final/avatar-final.png. Không dùng ảnh footer trung gian làm ảnh cuối.
- Test: Red thiếu opener → Green; ClassDetailScreen và production integration2suites15tests PASS gồm open/close/pending/denial. Type-check/Prettier/scopedESLint PASS. Native final tại class-participants-final/2026-10-20_184336 PASS open/pending/Back/return detail, đã xem modal không nút Đóng. Không bấm link Meet hoặc tạo giao dịch thật.
- Dữ liệu native hiện tại: đã mở được detail JS-101-ON1 với mentor Trần Quốc Bảo từ môi trường thật; giới hạn FULL ở entry cũ là dữ liệu trước khi account được cập nhật. Vẫn chưa có Student roster endpoint; học viên chờ backend theo xác nhận owner.
- PR / commit: Chưa tạo; UAT chưa xác nhận.
