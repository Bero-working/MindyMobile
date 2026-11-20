# Nhật ký: Luồng làm bài tập học sinh

Spec: [IMPLEMENT/STUDENT_ASSIGNMENTS.md](../IMPLEMENT/STUDENT_ASSIGNMENTS.md). Entry chỉ ghi thêm vào cuối file.

### 2026-11-09 14:00 (+07:00) · @Bero
- Phase: Danh sách bài theo loại — tab Code | Quiz
- Trạng thái: In review (chờ owner xác nhận UI)
- Đã làm: AI (Claude) thêm thanh tab Code/Quiz (ZIP chỉ hiện khi có bài ZIP) vào `SessionAssignments.tsx`, lọc client theo `type`, tab mặc định là tab đầu có bài, trạng thái trống từng tab; thêm key `assignments.tab.*`, `assignments.tabEmpty`, `assignments.tabEmptyMore` (vi/en). Viết test trước (Red: 2 test fail vì chưa có tab) rồi triển khai (Green).
- Test: `npx jest src/modules/assignments` 21/21 ✓ · eslint 2 file ✓ · `tsc --noEmit` ✓ · prettier ✓. Chưa chạy toàn bộ `npm test`, chưa chạy e2e.
- Tiêu chí nghiệm thu: 3 tiêu chí lọc/tab mặc định/tab ZIP đạt ở mức Jest + MSW; xác nhận UI trên thiết bị **chưa kiểm tra**.
- Đồng bộ: checklist trong `IMPLEMENT/STUDENT_ASSIGNMENTS.md`.
- PR / commit: chưa commit.
- Ghi chú: Số trên tab là số bài đã tải (contract không có filter `type`). Trang làm bài không đổi.

### 2026-11-09 21:10 (+07:00) · @Bero
- Phase: Trang làm bài dạng compiler + chỉnh UI trang làm bài
- Trạng thái: In review (chờ owner xác nhận UI)
- Đã làm: AI (Claude) dựng lại phần trình bày `CodeWork.tsx` thành IDE (thanh tiêu đề terminal, chọn ngôn ngữ, cột số dòng, editor cuộn ngang, thanh trạng thái, thanh công cụ 3 nút, Console, thẻ kết quả chấm, lịch sử dạng hàng); gọn thẻ thông tin chung trong `AssignmentWorkRoute.tsx` (chip, ô thông số). Thêm key i18n `assignmentWork.*` (vi/en). Không đổi logic query/lưu/nộp.
- Test: `npx jest src/modules/assignments` 21/21 ✓ (test code bổ sung kiểm tra gutter 3 dòng, "3 dòng" và console trống) · eslint ✓ · prettier ✓ · `tsc --noEmit` ✓. Chưa chạy toàn bộ `npm test`/e2e.
- Tiêu chí nghiệm thu: 3/4 tiêu chí mục "Trang làm bài dạng compiler" đạt (Jest + ảnh emulator API37 debug, Metro fast refresh, bài "tesst" thật); kết quả Console với bộ chấm thật và xác nhận owner **chưa kiểm tra**.
- Đồng bộ: checklist `IMPLEMENT/STUDENT_ASSIGNMENTS.md`.
- PR / commit: chưa commit.
- Ghi chú: Lần đầu `className="flex-1"` trên Button không có tác dụng (PressableScale không nhận class ở lớp ngoài), đã bọc View `flex-1`. Không tô màu cú pháp vì cần thư viện mới (phải có ADR).

### 2026-11-09 21:08 (+07:00) · @Bero
- Đính chính entry 2026-11-09 14:00: giờ đúng là khoảng 21:00 (+07:00); lệnh `date` trong Git Bash trả giờ UTC. Nội dung entry không đổi.
### 2026-11-09 21:15 (+07:00) · @Bero
- Phase: Chỉnh UI nút thao tác và kết quả chạy (trang làm bài CODE)
- Trạng thái: In review (chờ owner xác nhận UI)
- Đã làm: AI (Claude) chuyển Lưu vào thanh trạng thái IDE ("Lưu ngay" khi có thay đổi); dựng panel "Kết quả chạy" có nút ▶ Chạy thử trên header, tóm tắt x/y đạt, trạng thái đang chạy, thẻ từng ví dụ với Mong đợi | Thực tế; Nộp bài full-width kèm lý do khoá; chuyển hộp lỗi thao tác xuống cạnh panel. Thêm icon `play` vào `src/components/common/Icon.tsx` (không thuộc danh sách khoá). Khi hết hạn thì khoá Chạy thử vì backend dev trả `ASSIGNMENT_DEADLINE_PASSED` cho lệnh chạy thử (AI bấm Chạy thử một lần trên bài "tesst" để kiểm tra; chạy thử không tốn lượt nộp). Gỡ các key i18n đã thêm ở lượt trước nay không dùng (`console`, `compileLine`, `testPassedLine`, `testFailedLine`).
- Test: `npx jest src/modules/assignments` 22/22 ✓ (thêm test hết hạn) · eslint ✓ · prettier ✓ · `tsc --noEmit` ✓. Chưa chạy toàn bộ `npm test`/e2e.
- Tiêu chí nghiệm thu: 2/4 đạt; thẻ kết quả từng ví dụ chỉ đạt ở mức Jest/MSW, chưa xem trên thiết bị; xác nhận owner chưa có.
- Đồng bộ: checklist `IMPLEMENT/STUDENT_ASSIGNMENTS.md` (mục "Nút thao tác và kết quả chạy").
- PR / commit: chưa commit.
- Ghi chú: Muốn xem thẻ kết quả trên thiết bị cần một bài CODE còn hạn.

### 2026-11-09 22:18 (+07:00) · @Bero
- Phase: Tô màu kết quả quiz sau khi chấm
- Trạng thái: In review (chờ owner xác nhận UI)
- Đã làm: AI (Claude) sửa `QuizWork.tsx`: sau khi chấm, đáp án đúng tô xanh + ✓, đáp án chọn sai tô đỏ + ✗, dưới câu sai ghi "Đáp án đúng: <nhãn>. <nội dung>"; thêm nhãn trợ năng; key i18n `assignmentWork.markRight`/`markWrong` (vi/en). Hiểu "bôi xanh đáp án sai" là đáp án đúng.
- Test: test mới viết trước (Red: không tìm thấy "Đáp án đúng: A. 2") → Green; `npx jest src/modules/assignments` 23/23 ✓ · eslint ✓ · prettier ✓ · `tsc --noEmit` ✓. Chưa chạy toàn bộ `npm test`/e2e.
- Tiêu chí nghiệm thu: 1/3 đạt (Jest/MSW); hiển thị trên thiết bị và xác nhận owner chưa kiểm tra.
- Đồng bộ: checklist `IMPLEMENT/STUDENT_ASSIGNMENTS.md` mục "Kết quả quiz sau khi chấm".
- PR / commit: chưa commit.
- Ghi chú: Không có.
