# 3.1 Lịch học

## Cập nhật owner — 2026-10-20

Owner duyệt ADR-0030 và cho phép gắn API Phase3 trong chat. Lịch học chỉ xem: row buổi là View, không button/onPress/điều hướng session; giữ chọn ngày/đổi tuần/xem nội dung/làm mới. Detail/session mở từ Home hoặc Lớp của tôi. Đây là quyết định UI mới ưu tiên các luồng lịch→session mô tả bên dưới. Tại mốc 2026-10-20, API/route bắt đầu In progress. Cập nhật 2026-10-21: owner đã duyệt UAT, sub-phase Done.

## Bước và nguồn

UI, trạng thái Done (owner duyệt UAT ngày 2026-10-21). Base `section#t2` → `c.isSchedule`, `weekDays`, `dayGroups`, khảo sát 2026-10-20 và ảnh owner trong lượt triển khai; [nguồn/điều chỉnh](references/DESIGN_SOURCE.md). Đã có UI fixture/callback và snapshot trước/sau; API production đã tích hợp tại 3.6; fixture chỉ dùng trong development preview/test.

## Đặc tả UI

### Điều chỉnh của owner — 2026-10-20 (ưu tiên các điểm dưới)
- Buổi ONLINE: giữ nhãn “Phòng:” nhưng để trống giá trị, kể cả khi dữ liệu có roomName; không hiện “Chưa có thông tin phòng”. OFFLINE giữ roomName hoặc thông báo thiếu phòng như trước.
- Bổ sung theo hai ảnh owner đánh dấu: bỏ chip “Xem trước” trên từng buổi và bỏ nút “Lớp của tôi” cuối lịch (kể cả trạng thái rỗng). Quyền CASH_PREVIEW vẫn được giữ trong dữ liệu/callback và mô tả đọc màn hình; màn chi tiết preview giữ giới hạn truy cập.
- Nguồn mới: ảnh owner gửi trong chat, lưu [schedule-owner-2026-10-20.png](references/schedule-owner-2026-10-20.png). Snapshot UI trước sửa: [before.png](../../PROGRESS/PHASE_03_STUDENT_LEARNING/evidence/schedule-redesign/before.png), chụp từ bản Android hiện tại lúc15:25 (+07).
- Bỏ tiêu đề lớn Lịch học và hàng nút Hôm nay riêng. Header lịch là tháng/năm căn giữa, nút tuần trước/sau tròn44dp; bấm tiêu đề tháng thực hiện Hôm nay, có accessibilityHint. Header lịch và dải ngày cố định phía trên timeline cuộn.
- Dải ngày nền canvas: thứ chữ nhỏ, ngày trong vòng tròn38dp, selected forest/canvas, chấm màu cho ngày có buổi. Mỗi ô target>=44dp; tràn thì cuộn ngang. Ngày mặc định là hôm nay trong tuần hiện tại.
- Timeline hết chiều ngang: cột ngày72dp (đã tăng sau đối chiếu native để dd/mm không gãy chữ), nền soft/peach xen kẽ, ngày dd/mm21dp ExtraBold và thứ12dp. Cột buổi flex1, vạch mint/coral4dp, cột giờ44dp, nội dung gồm khối mã lớp soft/bo14dp, tiêu đề buổi, phòng/giảng viên và chip trạng thái/hình thức. Row có border dưới line, padding12dp. Không thêm course card hay tiêu đề ngày riêng chiếm một hàng.
- Tại320dp/chữ1.3×: cột ngày56dp, giờ trên nội dung để giữ chiều rộng chữ và hành động; hàng/nhãn tự xuống dòng. Không dựng khung điện thoại, giờ9:41 hoặc pin giả.
- Badge “Ca” trong ảnh thay bằng “Buổi N” từ sessionNumber của contract; điểm danh/nghỉ học thay bằng trạng thái session được backend hỗ trợ (Đã lên lịch/Đang diễn ra/Đã kết thúc/Đã huỷ). Không bịa điểm danh hoặc số ca. Course/class name có trong nhãn đọc màn hình; thị giác ưu tiên mã lớp và tên buổi như ảnh.
- Giữ token, font và tabs hiện có; status bar/BrandBar nền mint. Các quy tắc quyền, preview, callback, empty/error/loading và múi giờ giữ nguyên.

- Thứ tự: BrandBar cố định → tiêu đề “Lịch học” → điều khiển tuần trước/khoảng tuần/tuần sau → “Hôm nay” → dải Thứ 2–Chủ nhật → danh sách buổi nhóm theo ngày → AppTabBar chọn schedule. Nội dung cuộn dọc, footer padding đủ chiều cao overlay + safe area; lấy vị trí tab bar đã duyệt Phase 2.
- Nền canvas; padding ngang16dp; khoảng section16dp. Tiêu đề22/28 ExtraBold; khoảng tuần16/22 ExtraBold, metadata12.5/18, tiêu đề buổi14.5/20 Bold. Nút trước/sau tối thiểu44dp; ô ngày44dp, vòng ngày38dp. Nếu 7 ô không vừa, dải cuộn ngang và giữ ngày chọn trong viewport, không thu nhỏ target.
- Ngày chọn nền forest/chữ canvas; hôm nay viền mint và nhãn “Hôm nay”; chấm mint cho ngày có buổi. Không chỉ dựa vào màu. Bấm ngày có buổi cuộn tới nhóm ngày; ngày rỗng hiện thông báo riêng, không che lịch của cả tuần. Đổi tuần bỏ chọn ngày cũ; Hôm nay về tuần hiện tại và chọn ngày hiện tại.
- Timeline: cột ngày72dp nền soft/peach xen kẽ; phần buổi gồm vạch mint/coral4dp, cột giờ54dp, nội dung còn lại. Ở320dp/chữ lớn cho giờ lên trên nội dung, không ép tiêu đề vào cột quá hẹp. Row phẳng cách nhau14dp, mã lớp nền soft bo12dp, badge trạng thái/hình thức có chữ.
- Mỗi buổi: ngày/giờ, courseTitle, classCode/className, sessionTitle, mentor, Online/Offline, roomName nếu có, trạng thái session và nhãn xem trước nếu CASH_PREVIEW. Không có trường “ca” trong contract nên bỏ số ca. Không suy ra điểm danh hoặc “Đã học” từ giờ đã qua.
- Bấm buổi hoặc “Xem buổi học” → callback `{ classId, sessionId, accessMode }`; không mở meeting trực tiếp từ schedule. Buổi CANCELLED vẫn xem thông tin, có nhãn “Đã huỷ”, không CTA tham gia.
- Loading: skeleton dải ngày và3row. Empty tuần: illustration hiện có + “Tuần này chưa có buổi học” + “Xem lớp của tôi”. Error: ScreenState/retry/requestId; lỗi tải trang tiếp theo hiện footer, không tuyên bố lịch đã đầy đủ. Refetch giữ dữ liệu của đúng tuần, ghi rõ nếu đang hiển thị dữ liệu cũ.
- Accessibility: đọc đủ ngày/tháng/năm, selected của ngày; mô tả ngày có buổi; focus tới tiêu đề sau đổi tuần khi phù hợp. Reduce Motion cuộn tức thì; không tắt font scaling.

## Dữ liệu và API dự kiến

GET `/me/schedule` theo [§14.4](../../API_CONTRACT/my-classes.md). Tuần `[00:00 thứ2, 00:00 thứ2 kế tiếp)` trong timezone nghiệp vụ; request ISO có offset và encode bằng params. Mỗi range7ngày, luôn≤31ngày; pageSize100 và lấy đủ trang trước khi gắn trạng thái đầy đủ. Hiển thị theo response.timeZone, ban đầu dùng Asia/Ho_Chi_Minh và tính lại range nếu server trả timezone khác. “Hôm nay” theo timezone nghiệp vụ; quyền theo accessMode/asOf, không theo đồng hồ máy. includeCancelled=true; không thêm bộ lọc lớp trong UI lần đầu.

## Task (test hành vi trước triển khai)

### 3.1.1 Dải tuần và chọn ngày
- Test qua tháng/năm, Hôm nay, ngày rỗng, target trên320dp; testID `schedule-prev-week`, `schedule-next-week`, `schedule-today`, `schedule-day-YYYY-MM-DD`.
- i18n `schedule.title`, `schedule.week`, `schedule.today`, `schedule.noSessionsOnDay`.

### 3.1.2 Timeline và trạng thái
- Test nhiều buổi/ngày, ONLINE/OFFLINE, nullable mentor/phòng, CANCELLED/CASH_PREVIEW, loading/empty/error/retry và callback đúng ID. Không có meetingUrl trong view model lịch.
- testID `schedule-session-{sessionId}`, `schedule-retry`; i18n `schedule.session.*`, `schedule.state.*`.

## Nghiệm thu

- [x] Lịch đọc được ở320dp/font1.3×, không che buổi cuối bởi tabs.
- [x] Chọn tuần/ngày và callback đúng; không có quyền hoặc tiến độ suy diễn.
- [x] Đối chiếu native, lưu ảnh normal/empty/error/chữ lớn vào PROGRESS.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_03_STUDENT_LEARNING/PHASE_03_01_SCHEDULE.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Các nhánh FULL/CASH_PREVIEW/NONE, thay đổi quyền và dữ liệu có buổi được ghi theo unit/MSW/fixture khi chưa có dataset backend phù hợp. Có native protected detail bổ sung lúc 18:44 ngày 2026-10-20; Student roster, các dataset còn thiếu và TalkBack/iOS thủ công giữ giới hạn tại API_REVIEW.
