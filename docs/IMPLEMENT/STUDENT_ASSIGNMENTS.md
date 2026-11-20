# Luồng làm bài tập học sinh

## Điểm vào

Mở lớp học → chọn buổi học → tab **Bài tập** → **Làm bài tập**.
Route `STUDENT_ASSIGNMENT` nhận `assignmentId`; tải lại đề từ API bằng phiên học sinh hiện tại.
Các màn hình làm bài được tải khi cần, cùng phong cách giao diện của phần học tập.

## Danh sách bài theo loại (thay đổi UI 2026-11-09)

Owner yêu cầu chia tab **Bài tập** của buổi học thành hai mục **Code** và **Quiz**.

- Dưới tiêu đề "N bài tập" có thanh tab dạng pill (`accessibilityRole="tablist"`, nền `bg-soft`, bo tròn full, padding 4 px). Mỗi tab cao tối thiểu 40 px, chia đều chiều ngang, hiện tên và số bài; tab chọn nền `bg-forest`, chữ `text-primary-foreground`; tab còn lại chữ `text-forest`, số `text-muted`.
- Tab mặc định: tab đầu tiên (thứ tự Code → Quiz → ZIP) có bài; người dùng chọn tab khác thì giữ lựa chọn. Đổi tab thu gọn đề bài đang mở.
- Tab **Nộp ZIP** chỉ xuất hiện khi danh sách đã tải có bài ZIP, để không ẩn bài của học sinh.
- Tab không có bài: khung `assignment-tab-empty` "Chưa có bài {loại} trong buổi này"; nếu còn trang sau thì nhắc bấm "Xem thêm bài tập".
- Contract không có filter `type`, nên lọc phía client trên các trang đã tải; số đếm trên tab là số bài đã tải. Thẻ bài, nút "Làm bài tập" và phân trang giữ nguyên.
- testID: `assignment-tab-CODE`, `assignment-tab-QUIZ`, `assignment-tab-ZIP`, `assignment-tab-empty`.

Tiêu chí:

- [x] Danh sách có cả CODE và QUIZ mở ở tab Code, chỉ hiện bài Code; bấm Quiz chỉ hiện bài Quiz. Bằng chứng: `work.integration.test.tsx` (MSW, Jest), 2026-11-09; chưa kiểm tra trên thiết bị.
- [x] Không có bài ZIP thì không có tab ZIP. Bằng chứng: `work.integration.test.tsx` (MSW, Jest), 2026-11-09; chưa kiểm tra trên thiết bị.
- [x] Chỉ có bài Quiz thì mở sẵn tab Quiz; tab Code hiện trạng thái trống. Bằng chứng: `work.integration.test.tsx` (MSW, Jest), 2026-11-09; chưa kiểm tra trên thiết bị.
- [ ] Owner xác nhận UI trên thiết bị. **Chưa kiểm tra**.

## Trang làm bài dạng compiler (thay đổi UI 2026-11-09)

Owner yêu cầu trang làm bài CODE có dạng compiler và chỉnh lại UI trang làm bài. Logic query/lưu/chạy/nộp giữ nguyên.

- **Thẻ thông tin** (mọi loại bài): chip loại (`bg-forest`) + chip mục đích (`bg-canvas`); tiêu đề 22 px extrabold; mô tả `text-forest`, khi trống hiện chữ nghiêng `text-muted`; ô thông số nền `bg-canvas` bo 14 px: Điểm tối đa, Số lượt nộp (2 cột) và Hạn nộp (full).
- **Trạng thái CODE**: chip "Còn N lượt nộp", chip điểm cao nhất (nếu có); hết hạn là banner `bg-peach` chữ `text-headsup`.
- **Đề bài**: khung viền `border-line`; ràng buộc trong ô `bg-soft` font mono; mỗi ví dụ là khối terminal `bg-forest-deep` với thanh tiêu đề `bg-forest-night`, dòng "Đầu vào" `text-canvas`, "Đầu ra" `text-aqua`.
- **IDE** (`code-ide`): thanh tiêu đề `bg-forest-night` có 3 chấm (headsup/sunshine/mint) và tên tệp theo ngôn ngữ (`solution.js`, `Solution.java`); hàng chọn ngôn ngữ dạng pill (`code-language-<key>`, chọn: `bg-aqua`); editor nền `bg-forest-deep`, mono 13/20 px, cột số dòng (`code-gutter`, ẩn với trình đọc màn hình); editor không xuống dòng mà cuộn ngang để số dòng luôn khớp; cao tối thiểu 300 px. Thanh trạng thái: chấm màu (mint đã lưu / action chưa lưu / sunshine đang xử lý) + chữ trạng thái + "N dòng".
- **Thanh công cụ**: Lưu bài · Chạy thử · Nộp bài chia đều 3 cột.
- **Console**: khối terminal; chưa chạy thì "> Bấm Chạy thử…"; sau khi chạy (`code-run-result`) hiện dòng biên dịch (sunshine), lỗi biên dịch (peach), mỗi test "✓/✗ đầu vào · trạng thái" (aqua nếu PASS/PASSED/OK/ACCEPTED/AC, ngược lại action), mong đợi/thực tế, console/stderr.
- **Kết quả chấm** (`code-result`): nhãn "Kết quả chấm", trạng thái, điểm 22 px; lỗi biên dịch trong khối terminal.
- **Lịch sử nộp**: hàng `#n · trạng thái · điểm/tối đa`, hàng đang xem có viền `border-forest`.
- Giới hạn: không tô màu cú pháp (không thêm thư viện); độ rộng ký tự mono ước lượng 8.1 px nên dòng rất dài có thể dư/thiếu vài px cuộn ngang.

Tiêu chí:

- [x] Editor có số dòng khớp từng dòng code và thanh trạng thái đếm dòng. Bằng chứng: Jest `work.integration.test.tsx` (3 dòng) + ảnh emulator API37 2026-11-09 (9 dòng khớp).
- [x] Console hiện hướng dẫn trước khi chạy và kết quả sau khi chạy. Bằng chứng: Jest (MSW); ảnh emulator cho trạng thái trống. Kết quả chạy thật với bộ chấm **chưa kiểm tra**.
- [x] Thẻ thông tin, đề bài, ví dụ, 3 nút chia đều hiển thị đúng. Bằng chứng: ảnh emulator API37 2026-11-09.
- [ ] Owner xác nhận UI. **Chưa kiểm tra**.

## Nút thao tác và kết quả chạy (thay đổi UI 2026-11-09, lần 2)

Owner yêu cầu chỉnh UI phần nút và output. Thay cho mục "Thanh công cụ" và "Console" ở trên:

- **Lưu**: bỏ nút "Lưu bài" riêng. Bài vẫn tự lưu sau 1 giây; khi có thay đổi, thanh trạng thái IDE hiện pill nhỏ "Lưu ngay" (`code-save`, viền `border-aqua`).
- **Panel "Kết quả chạy"** (`code-output`): header `bg-forest-night` gồm tiêu đề, pill tóm tắt "x/y đạt" (`bg-aqua` nếu đạt hết, ngược lại `bg-action`) và nút **▶ Chạy thử** (`code-run`, pill `bg-aqua`, chữ `text-forest-night`, cao 36 px; mờ 40% khi khoá; spinner khi đang chạy).
- Thân panel: chưa chạy → icon ▶ tròn + hướng dẫn (`code-output-empty`); đang chạy → spinner "Đang chạy code…"; có kết quả (`code-run-result`) → chip "Biên dịch: <status>", lỗi biên dịch trong ô tối chữ peach, mỗi ví dụ là thẻ có badge "✓ Đạt"/"✗ Sai", mã trạng thái, đầu vào, hai ô **Mong đợi | Thực tế** cạnh nhau (thực tế aqua nếu đạt, action nếu sai), dòng `stdout ›`/`stderr ›`.
- **Hết hạn**: backend từ chối chạy thử sau hạn (`ASSIGNMENT_DEADLINE_PASSED`, quan sát trên backend dev 2026-11-09), nên khi `deadlinePassed` thì khoá Chạy thử và panel ghi "Đã hết hạn nộp bài nên không thể chạy thử."
- **Nộp bài**: nút chính full-width dưới panel; khi bị khoá hiện lý do ngay dưới: hết hạn, hết lượt hoặc đang chấm lượt trước.
- **Lỗi thao tác** (lưu/chạy/nộp) hiển thị giữa panel kết quả và nút Nộp bài, không còn ở trên editor.

Tiêu chí:

- [x] Hết hạn thì Chạy thử và Nộp bài bị khoá, panel nêu lý do. Bằng chứng: Jest `closes sample runs after the deadline…` + ảnh emulator API37 2026-11-09 (bài "tesst").
- [x] Trạng thái trống, nút ▶ Chạy thử trên header, nút Nộp bài full-width kèm lý do hiển thị đúng. Bằng chứng: ảnh emulator API37 2026-11-09.
- [ ] Thẻ kết quả từng ví dụ (Đạt/Sai, Mong đợi | Thực tế) trên thiết bị. **Đạt một phần**: Jest/MSW render `code-run-result`; chưa xem trên emulator vì bài thật đã hết hạn.
- [ ] Owner xác nhận UI. **Chưa kiểm tra**.

## Kết quả quiz sau khi chấm (thay đổi UI 2026-11-09)

Owner yêu cầu: đáp án sai thì tô đỏ, tô xanh đáp án đúng, ghi đáp án đúng dưới câu. (Owner viết "bôi xanh đáp án sai"; AI hiểu là đáp án **đúng** — owner xác nhận khi duyệt UI.)

- Áp dụng khi `quiz.status === 'GRADED'` và có kết quả câu đó.
- Đáp án đúng: viền `border-status-green`, nền `bg-cover-d-soft`, chữ đậm `text-status-green`, huy hiệu tròn ✓ `bg-status-green` bên phải.
- Đáp án học viên chọn sai: viền `border-status-red`, nền `bg-cover-c-soft`, chữ đậm `text-status-red`, huy hiệu ✗ `bg-status-red`.
- Phương án khác giữ kiểu thường. Trước khi chấm, kiểu chọn cũ (`border-forest bg-cover-a-soft`) không đổi.
- Dưới câu: đúng → "Chính xác" (`text-status-green`); sai → ô `bg-cover-d-soft` "Đáp án đúng: <nhãn>. <nội dung>".
- Trợ năng: nhãn phương án thêm ", đáp án đúng" hoặc ", bạn chọn, sai".

Tiêu chí:

- [x] Câu sai: phương án đã chọn đánh dấu sai, phương án đúng đánh dấu đúng, hiện "Đáp án đúng: A. 2". Bằng chứng: Jest `marks a wrong pick red, the right option green and names the answer` (MSW), 2026-11-09.
- [ ] Màu đỏ/xanh hiển thị đúng trên thiết bị. **Chưa kiểm tra**: emulator không ở màn quiz lúc kiểm tra.
- [ ] Owner xác nhận UI. **Chưa kiểm tra**.

## Hành vi

- **QUIZ**: bắt đầu/tiếp tục cùng lượt làm; khôi phục đáp án từ server; tự lưu toàn bộ đáp án sau 900 ms; xác nhận trước khi nộp; hiển thị điểm và đáp án sau khi chấm. Đồng hồ dùng thời gian server và thời gian trôi qua của thiết bị. Khi hết giờ, khóa lựa chọn và đợi server chấm các đáp án đã lưu.
- **CODE**: xem đề và ví dụ; chọn ngôn ngữ server cho phép; khôi phục và tự lưu bản nháp theo ngôn ngữ sau 1 giây; chạy các ví dụ; xác nhận nộp; theo dõi hàng đợi chấm; xem điểm, lỗi biên dịch và lịch sử nộp. Quyền nộp và lượt còn lại lấy từ server.
- **ZIP**: tạo/tiếp tục bản nháp; chọn một tệp ZIP không rỗng, tối đa 20 MiB; sao chép vào cache; tải lên URL ký sẵn; chờ kiểm tra READY; gắn vào bản nháp; xác nhận nộp; xem điểm/nhận xét đã công bố. Việc tải tệp không tự nộp bài. Tuân theo `capabilities.zipMutationsEnabled` của server.
- Tệp hướng dẫn được mở qua URL tải do API cấp. Có cảnh báo khi quay lại lúc còn thay đổi chưa lưu hoặc thao tác chưa xác định kết quả.
- Mỗi thao tác có receipt giữ cùng `Idempotency-Key` và nội dung khi thử lại sau lỗi không xác định. `expectedVersion` bảo vệ các lần lưu/gắn/nộp. Bản nháp code dùng cơ chế version riêng của API.
- Dữ liệu query tách theo học sinh và thế hệ phiên đăng nhập; không chạy query private khi chưa đăng nhập hoặc màn hình không hoạt động.

## API và cấu hình

Đối chiếu controller/DTO trong `Mindy-BE/src/modules/assignments` và luồng web trong `Mindy-FE2/src/features/assignments`.
Dùng các endpoint `me/assignments`, `me/assignment-submissions`, `me/code-submissions`, `me/zip-submissions` và `assignment-files`; không đổi backend.

`API_URL` phải trỏ tới backend hỗ trợ các endpoint này. `APP_ORIGIN` phải là origin được backend chấp nhận cho các mutation. Kho lưu trữ ZIP và bộ chấm code phải được cấu hình ở backend.

Thêm `@react-native-documents/picker`: cần build native lại sau khi cài dependency. Android dùng `npm run android`; iOS chạy `npm run pod-install` trên macOS rồi build lại.

## Kiểm chứng

`work.integration.test.tsx` dùng HTTP client thật qua MSW theo contract backend: mở bài trong app, lưu/nộp trắc nghiệm và retry cùng receipt, khôi phục bài, timeout, cảnh báo rời màn hình, lưu/chạy/nộp/poll code, pipeline ZIP, kiểm tra dung lượng và chặn truy cập khi đăng xuất.

Các kiểm thử này xác minh frontend với HTTP giả lập; không chứng minh hoạt động của hệ thống chấm và kho lưu trữ thật. Android debug được build cho emulator x86_64; iOS chưa được build trên Windows.
